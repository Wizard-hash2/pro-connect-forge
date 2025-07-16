# This script generates embeddings locally using Hugging Face Transformers and uploads them to Supabase.
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
            "AFRIWORK is a modern, full-stack freelancer marketplace platform built with React, "
            "TypeScript, and Supabase. It empowers clients to post projects, discover top freelancers, "
            "and manage collaborations—all in a beautiful, intuitive interface."
        ),
        "metadata": {"category": "project", "tags": ["overview", "afriwork"]}
    },
    {
        "content": (
            "Key features: Client & Freelancer Dashboards, Project Posting, Freelancer Discovery, "
            "One-Click Applications, Secure Auth & Profiles, Live Data, Modern UI/UX."
        ),
        "metadata": {"category": "project", "tags": ["features"]}
    },
    {
        "content": (
            "The tech stack includes: Frontend (React, TypeScript, Vite, Tailwind CSS), Backend (Supabase), "
            "State & Data (React Context, Custom Hooks, Supabase Client), UI Components (Custom, accessible, and beautiful)."
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
        "content": "To reset your password in Mercy Shop, you need to write an email to the ceo: aronidengeno@gmail.com",
        "metadata": {"category": "auth", "tags": ["password", "reset"]}
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
    profile_text = (
        f"Freelancer Profile:\n"
        f"ID: {f.get('id', 'N/A')}\n"
        f"Hourly Rate: {f.get('hourly_rate', 'N/A')}\n"
        f"Availability (hours/week): {f.get('availability_hours_per_week', 'N/A')}\n"
        f"Experience Level: {f.get('experience_level', 'N/A')}\n"
        f"Bio: {f.get('bio', 'N/A')}\n"
        f"Portfolio URL: {f.get('portfolio_url', 'N/A')}"
    )
    documents.append({
        "content": profile_text,
        "metadata": {"category": "freelancer", "id": f.get('id')}
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