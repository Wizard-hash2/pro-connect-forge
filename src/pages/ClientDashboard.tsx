import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from '@/context/UserProfileContext';
import { useJobPosts } from '@/hooks/useJobPosts';
import { useFreelancerProfiles } from '@/hooks/useFreelancerProfiles';
import { useApplications } from '@/hooks/useApplications';

interface JobCard {
  id: string;
  title: string;
  applications: number;
  budget: string;
  status: "active" | "in_progress" | "completed";
  deadline: string;
}

interface MatchCard {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  rating: number;
  hourlyRate: string;
  compatibility: number;
  availability: string;
}

const activeJobs: JobCard[] = [
  {
    id: "1",
    title: "Modern React Dashboard Development",
    applications: 12,
    budget: "$3,000 - $5,000",
    status: "active",
    deadline: "2024-01-15"
  },
  {
    id: "2", 
    title: "E-commerce Mobile App Design",
    applications: 8,
    budget: "$2,500 - $4,000",
    status: "in_progress",
    deadline: "2024-01-20"
  }
];

const topMatches: MatchCard[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    skills: ["React", "TypeScript", "UI/UX"],
    rating: 4.9,
    hourlyRate: "$85/hr",
    compatibility: 95,
    availability: "Available now"
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    avatar: "/avatars/marcus.jpg", 
    skills: ["React Native", "Flutter", "Design"],
    rating: 4.8,
    hourlyRate: "$70/hr",
    compatibility: 88,
    availability: "Available in 2 days"
  }
];

export default function ClientDashboard() {
  const { profile, loading, error } = useUserProfile();
  const { data: jobs, loading: jobsLoading, error: jobsError } = useJobPosts();
  const { data: freelancers, loading: freelancersLoading, error: freelancersError } = useFreelancerProfiles();
  const { data: applications, loading: applicationsLoading, error: applicationsError } = useApplications();

  if (loading || jobsLoading || freelancersLoading || applicationsLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (jobsError) return <div className="text-red-500">Error loading jobs: {jobsError}</div>;
  if (freelancersError) return <div className="text-red-500">Error loading freelancers: {freelancersError}</div>;
  if (applicationsError) return <div className="text-red-500">Error loading applications: {applicationsError}</div>;
  if (!profile) return <div>Please log in.</div>;

  // Filter jobs for this client
  const clientJobs = jobs?.filter(job => job.client_id === profile.id) || [];
  // Applications for this client's jobs
  const clientJobIds = clientJobs.map(job => job.id);
  const clientApplications = (applications || []).filter(app => clientJobIds.includes(app.job_id));
  // Budget spent: sum of budget_max for completed jobs
  const budgetSpent = clientJobs.filter(job => job.status === 'completed').reduce((sum, job) => sum + (job.budget_max || 0), 0);
  // Avg. rating: average rating from completed jobs (if available)
  // For now, use profile.rating or '—'
  const avgRating = profile.rating ?? '—';

  // For top matches, just show the first few freelancers for now
  const topMatches = freelancers?.slice(0, 2) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground shadow-large">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {profile.full_name}!</h1>
            <p className="text-primary-foreground/80 mb-4">
              Ready to find your next amazing freelancer?
            </p>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{profile.rating ?? '—'}</div>
            <div className="text-sm text-primary-foreground/80">Client Rating</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{clientJobs.length > 0 ? clientJobs.length : '—'}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {/* Placeholder for stats */}
              +20% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{clientApplications.length > 0 ? clientApplications.length : '—'}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {/* Placeholder for stats */}
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{budgetSpent > 0 ? `$${budgetSpent}` : '—'}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {/* Placeholder for stats */}
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgRating !== '\u2014' && avgRating !== undefined && avgRating !== null ? avgRating : '—'}</div>
            <p className="text-xs text-muted-foreground">
              {/* Placeholder for completed projects count */}
              From {clientJobs.filter(job => job.status === 'completed').length} completed projects
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Jobs</CardTitle>
              <Link to="/projects">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientJobs.length === 0 ? (
              <div className="text-muted-foreground">No active jobs found.</div>
            ) : (
              clientJobs.map((job) => (
                <div key={job.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-smooth">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{job.title}</h3>
                    <Badge 
                      variant={job.status === "open" ? "default" : job.status === "in_progress" ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {job.status?.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {/* Applications count and budget info can be added if available */}
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.budget_min && job.budget_max ? `$${job.budget_min} - $${job.budget_max}` : '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Matches (Freelancers) */}
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Top Matches</CardTitle>
              <Link to="/find-freelancers">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {topMatches.length === 0 ? (
              <div className="text-muted-foreground">No matches found.</div>
            ) : (
              topMatches.map((freelancer) => (
                <div key={freelancer.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-smooth flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {/* Avatar placeholder, can use freelancer.avatar_url if available */}
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{freelancer.bio || 'Freelancer'}</div>
                    <div className="text-xs text-muted-foreground">{freelancer.experience_level || '—'} | ${freelancer.hourly_rate ?? '—'}/hr</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}