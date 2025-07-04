-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for freelancer_profiles
CREATE POLICY "Anyone can view freelancer profiles" ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own freelancer profile" ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own freelancer profile" ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for freelancer_skills
CREATE POLICY "Anyone can view freelancer skills" ON public.freelancer_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their own freelancer skills" ON public.freelancer_skills FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.freelancer_profiles WHERE id = freelancer_id)
);

-- Create policies for job_posts
CREATE POLICY "Anyone can view job posts" ON public.job_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own job posts" ON public.job_posts FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update their own job posts" ON public.job_posts FOR UPDATE USING (auth.uid() = client_id);

-- Create policies for job_skills
CREATE POLICY "Anyone can view job skills" ON public.job_skills FOR SELECT USING (true);
CREATE POLICY "Job owners can manage job skills" ON public.job_skills FOR ALL USING (
  auth.uid() IN (SELECT client_id FROM public.job_posts WHERE id = job_id)
);

-- Create policies for matches
CREATE POLICY "Users can view their own matches" ON public.matches FOR SELECT USING (
  auth.uid() IN (SELECT client_id FROM public.job_posts WHERE id = job_id) OR
  auth.uid() = freelancer_id
);
CREATE POLICY "System can create matches" ON public.matches FOR INSERT WITH CHECK (true);

-- Create policies for skills (public reference data)
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);

-- Insert some sample skills
INSERT INTO public.skills (id, name, category, description) VALUES
  (gen_random_uuid(), 'React', 'Frontend', 'JavaScript library for building user interfaces'),
  (gen_random_uuid(), 'TypeScript', 'Frontend', 'Typed superset of JavaScript'),
  (gen_random_uuid(), 'Node.js', 'Backend', 'JavaScript runtime for server-side development'),
  (gen_random_uuid(), 'Python', 'Backend', 'High-level programming language'),
  (gen_random_uuid(), 'UI/UX Design', 'Design', 'User interface and user experience design'),
  (gen_random_uuid(), 'Figma', 'Design', 'Interface design and prototyping tool'),
  (gen_random_uuid(), 'Flutter', 'Mobile', 'Cross-platform mobile development framework'),
  (gen_random_uuid(), 'Django', 'Backend', 'Python web framework'),
  (gen_random_uuid(), 'PostgreSQL', 'Database', 'Open-source relational database'),
  (gen_random_uuid(), 'AWS', 'Cloud', 'Amazon Web Services cloud platform')
ON CONFLICT (id) DO NOTHING;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')::user_type_enum
  );
  
  -- If user is a freelancer, create freelancer profile
  IF NEW.raw_user_meta_data->>'user_type' = 'freelancer' THEN
    INSERT INTO public.freelancer_profiles (id, bio, hourly_rate, experience_level)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'bio',
      COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::numeric, 50),
      COALESCE(NEW.raw_user_meta_data->>'experience_level', 'mid')::experience_level_enum
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();