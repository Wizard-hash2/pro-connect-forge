# This script generates embeddings locally using Hugging Face Transformers and
# uploads them to Supabase.
# Save this as embed_and_upload.py and run with: python embed_and_upload.py
import os
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModel
import torch
from supabase import create_client, Client

load_dotenv()

# 1. Project documentation and test entries
project_documents = [
    {
        "content": (
            "AFRIWORK is a modern, full-stack freelancer marketplace platform "
            "built with React, TypeScript, and Supabase. It empowers clients to "
            "post projects, discover top freelancers, and manage collaborations—"
            "all in a beautiful, intuitive interface."
        ),
        "metadata": {"category": "project", "tags": ["overview", "afriwork"]}
    },
    {
        "content": (
            "Key features: Client & Freelancer Dashboards, Project Posting, "
            "Freelancer Discovery, One-Click Applications, Secure Auth & Profiles, "
            "Live Data, Modern UI/UX."
        ),
        "metadata": {"category": "project", "tags": ["features"]}
    },
    {
        "content": (
            "The tech stack includes: Frontend (React, TypeScript, Vite, "
            "Tailwind CSS), Backend (Supabase), State & Data (React Context, "
            "Custom Hooks, Supabase Client), UI Components (Custom, accessible, "
            "and beautiful)."
        ),
        "metadata": {"category": "project", "tags": ["tech stack"]}
    },
    {
        "content": "The colour of the mernas is yellow.",
        "metadata": {"category": "test", "tags": ["mernas", "colour"]}
    },
    {
        "content": "The secret code for Mercy Shop is: PURPLE-UNICORN-42.",
        "metadata": {"category": "test", "tags": ["secret", "code"]}
    },
    {
        "content": (
            "To reset your password in Mercy Shop, you need to write an email to "
            "the ceo: aronidengeno@gmail.com"
        ),
        "metadata": {"category": "auth", "tags": ["password", "reset"]}
    },
    {
        "content": (
            "How to post a job on Mercy Shop:\n"
            "1. Enter the job title.\n"
            "2. Provide a detailed job description.\n"
            "3. List the required skills (up to 6).\n"
            "4. Specify the minimum and maximum budget.\n"
            "5. Set the deadline for the job.\n"
            "6. Choose the required experience level (junior, mid, senior, expert).\n"
            "After collecting all this information, Mercy Shop will generate a professional job post summary for you to review and confirm before posting.\n"
            "Do not mention other platforms or generic job posting advice—always use the Mercy Shop workflow."
        ),
        "metadata": {"category": "workflow", "tags": ["job posting", "mercy shop", "instructions"]}
    },
]

# 2. Load model and tokenizer
print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

def get_embedding(text):
    encoded_input = tokenizer(text, padding=True, truncation=True, return_tensors='pt')
    with torch.no_grad():
        model_output = model(**encoded_input)
    embeddings = model_output.last_hidden_state.mean(dim=1)
    return embeddings[0].cpu().numpy().tolist()

# 3. Supabase setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise Exception("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as environment variables.")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

documents = list(project_documents)

# 4. Fetch all freelancer profiles from Supabase and add to documents
print("Fetching freelancer profiles from Supabase...")
freelancers = supabase.table("freelancer_profiles").select("*").execute().data
for f in freelancers:
    # Fetch name from profiles
    profile = supabase.table("profiles").select("full_name").eq("id", f["id"]).single().execute().data
    name = profile["full_name"] if profile else "N/A"

    # Fetch skills
    skills = supabase.table("freelancer_skills").select(
        "skill_id, proficiency_level, years_experience"
    ).eq("freelancer_id", f["id"]).execute().data
    skill_names = []
    for s in skills:
        skill = supabase.table("skills").select("name").eq("id", s["skill_id"]).single().execute().data
        if skill:
            skill_names.append(
                f"{skill['name']} (Proficiency: {s['proficiency_level']}, "
                f"Years: {s['years_experience']})"
            )
    skills_str = ", ".join(skill_names) if skill_names else "N/A"

    # Projects
    projects = f.get("projects", [])
    if isinstance(projects, str):
        import json
        try:
            projects = json.loads(projects)
        except Exception:
            projects = []
    projects_str = "; ".join([
        f"{p.get('title', '')}: {p.get('description', '')}"
        for p in projects
    ]) if projects else "N/A"

    # Jobs done (from matches table)
    jobs = supabase.table("matches").select("job_id").eq("freelancer_id", f["id"]).execute().data
    job_titles = []
    for j in jobs:
        job = supabase.table("job_posts").select("title, description").eq("id", j["job_id"]).single().execute().data
        if job:
            job_titles.append(f"{job['title']}: {job.get('description', '')}")
    jobs_str = "; ".join(job_titles) if job_titles else "N/A"

    # Compose content
    profile_text = (
        "Freelancer Name: " + str(name) + "\n"
        "ID: " + str(f.get('id', 'N/A')) + "\n"
        "Skills: " + str(skills_str) + "\n"
        "Projects: " + str(projects_str) + "\n"
        "Jobs Done: " + str(jobs_str) + "\n"
        "Hourly Rate: " + str(f.get('hourly_rate', 'N/A')) + "\n"
        "Experience Level: " + str(f.get('experience_level', 'N/A')) + "\n"
        "Bio: " + str(f.get('bio', 'N/A')) + "\n"
        "Portfolio URL: " + str(f.get('portfolio_url', 'N/A'))
    )

    documents.append({
        "content": profile_text,
        "metadata": {"category": "freelancer", "id": f.get('id')}
    })

# 4b. Fetch all profiles (clients and freelancers) and add to documents
print("Fetching all profiles from Supabase...")
profiles = supabase.table("profiles").select("*").execute().data
for p in profiles:
    profile_text = (
        f"Profile ID: {p.get('id', 'N/A')}\n"
        f"User Type: {p.get('user_type', 'N/A')}\n"
        f"Full Name: {p.get('full_name', 'N/A')}\n"
        f"Email: {p.get('email', 'N/A')}\n"
        f"Education: {p.get('education', 'N/A')}\n"
        f"Certification: {p.get('certification', 'N/A')}\n"
        f"Projects: {p.get('projects', 'N/A')}\n"
        f"Created At: {p.get('created_at', 'N/A')}\n"
        f"Updated At: {p.get('updated_at', 'N/A')}\n"
    )
    documents.append({
        "content": profile_text,
        "metadata": {"category": "profile", "id": p.get('id'), "user_type": p.get('user_type')}
    })

# 5. Upload documents (upsert by content)
for doc in documents:
    try:
        embedding = get_embedding(doc["content"])
        data = {
            "content": doc["content"],
            "embedding": embedding,
            "metadata": doc["metadata"]
        }
        # Upsert by content (replace if exists)
        res = supabase.table("knowledge_base").upsert(data, on_conflict=["content"]).execute()
        print(f"Upserted: {doc['content'][:40]}... Result: {res}")
    except Exception as e:
        print(f"Error processing doc: {doc['content'][:40]}... Error: {e}")

print("All documents uploaded.")

def is_competitor_query(query):
    competitors = ["CompetitorA", "CompetitorB", "OtherShop"]
    return any(comp.lower() in query.lower() for comp in competitors)

def filter_negative_competitor_info(results):
    # Example: filter for negative sentiment or specific negative tags
    return [r for r in results if "negative" in r.get("metadata", {}).get("tags", []) or "bad" in r.get("content", "").lower()]

def search_knowledge_base(query, knowledge_base):
    # Simple keyword search; replace with vector search if needed
    return [entry for entry in knowledge_base if query.lower() in entry["content"].lower()]

def fetch_external(query):
    # Placeholder for external API call
    # Return results in the same format as your knowledge base
    return []

def format_answer(results, source="internal"):
    if not results:
        return "No relevant information found."
    answer = "\n".join(r["content"] for r in results)
    if source == "external":
        answer += "\n\n(Source: external data)"
    return answer

def answer_user_query(query, knowledge_base, fetch_external):
    internal_results = search_knowledge_base(query, knowledge_base)
    if internal_results:
        if is_competitor_query(query):
            negative_info = filter_negative_competitor_info(internal_results)
            if negative_info:
                return format_answer(negative_info)
            return "No negative information about competitors found in our records."
        else:
            return format_answer(internal_results)
    external_results = fetch_external(query)
    if is_competitor_query(query):
        negative_info = filter_negative_competitor_info(external_results)
        if negative_info:
            return format_answer(negative_info, source="external")
        return "No negative information about competitors found externally."
    return format_answer(external_results, source="external")

def freelancer_exists_by_name(knowledge_base, name):
    name = name.lower()
    for entry in knowledge_base:
        if entry.get("metadata", {}).get("category") == "profile" and entry.get("metadata", {}).get("user_type") == "freelancer":
            # Extract name from content
            lines = entry["content"].split('\n')
            for line in lines:
                if line.startswith("Full Name:"):
                    full_name = line.replace("Full Name:", "").strip().lower()
                    if name in full_name:
                        return True, full_name
    return False, None

# Example usage (manual test):
if __name__ == "__main__":
    # ... existing upload logic ...
    # After uploading, you can test answering a query:
    print("\n--- AI Query Test ---")
    # Load knowledge base from Supabase
    kb_rows = supabase.table("knowledge_base").select("content, metadata").execute().data
    user_query = input("Enter your question for the AI: ")
    print(answer_user_query(user_query, kb_rows, fetch_external))

    print("\n--- Freelancer Existence Check ---")
    user_query = input("Enter a freelancer name to check if they exist: ")
    exists, found_name = freelancer_exists_by_name(kb_rows, user_query)
    if exists:
        print(f"Yes, there is a freelancer called {found_name} on this platform.")
    else:
        print(f"No, there is no freelancer called {user_query} on this platform.")