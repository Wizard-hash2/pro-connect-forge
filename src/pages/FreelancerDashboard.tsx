import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  DollarSign, 
  Star, 
  TrendingUp,
  Clock,
  Briefcase,
  User,
  ArrowRight,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from '@/context/UserProfileContext';
import { useJobPosts } from '@/hooks/useJobPosts';
import { useApplications } from '@/hooks/useApplications';
import { createApplication } from '@/services/applicationsService';
import { useState } from 'react';

interface JobListing {
  id: string;
  title: string;
  client: string;
  budget: string;
  posted: string;
  skills: string[];
  description: string;
  type: "hourly" | "fixed";
}

interface Application {
  id: string;
  jobTitle: string;
  status: "pending" | "accepted" | "rejected";
  appliedDate: string;
  proposedRate: string;
}

const recommendedJobs: JobListing[] = [
  {
    id: "1",
    title: "Senior React Developer for SaaS Platform",
    client: "TechCorp Inc.",
    budget: "$75-85/hr",
    posted: "2 hours ago",
    skills: ["React", "TypeScript", "Node.js"],
    description: "We're looking for an experienced React developer to help build our next-generation SaaS platform...",
    type: "hourly"
  },
  {
    id: "2",
    title: "Mobile App UI/UX Design",
    client: "StartupXYZ",
    budget: "$3,000-5,000",
    posted: "5 hours ago", 
    skills: ["Figma", "Mobile Design", "Prototyping"],
    description: "Design a beautiful and intuitive mobile app interface for our fitness tracking application...",
    type: "fixed"
  }
];

const recentApplications: Application[] = [
  {
    id: "1",
    jobTitle: "Full-Stack Developer for E-commerce Site",
    status: "pending",
    appliedDate: "2024-01-10",
    proposedRate: "$80/hr"
  },
  {
    id: "2", 
    jobTitle: "React Dashboard Development",
    status: "accepted",
    appliedDate: "2024-01-08",
    proposedRate: "$75/hr"
  }
];

export default function FreelancerDashboard() {
  const { profile, loading, error } = useUserProfile();
  const { data: jobs, loading: jobsLoading, error: jobsError } = useJobPosts();
  const { data: applications, loading: applicationsLoading, error: applicationsError } = useApplications();
  const [applyState, setApplyState] = useState({}); // { [jobId]: { loading, error, success } }

  if (loading || jobsLoading || applicationsLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (jobsError) return <div className="text-red-500">Error loading jobs: {jobsError}</div>;
  if (applicationsError) return <div className="text-red-500">Error loading applications: {applicationsError}</div>;
  if (!profile) return <div>Please log in.</div>;

  // Filter applications for this freelancer
  const myApplications = applications?.filter(app => app.freelancer_id === profile.id) || [];
  // Active projects: jobs where this freelancer has an accepted application
  const activeProjects = myApplications.filter(app => app.status === 'accepted').length;
  // Earnings: sum of proposedRate for accepted applications (if available)
  // This assumes proposedRate is a string like "$1000" or "$80/hr"
  const earnings = myApplications
    .filter(app => app.status === 'accepted')
    .reduce((sum, app) => {
      const match = app.proposed_rate?.match(/\d+/g);
      if (match) {
        return sum + parseInt(match[0], 10);
      }
      return sum;
    }, 0);
  // Success rate: accepted / total applications
  const successRate = myApplications.length > 0 ? Math.round((myApplications.filter(app => app.status === 'accepted').length / myApplications.length) * 100) : 0;

  // For recommended jobs, just show the first few jobs for now
  const recommendedJobs = jobs?.slice(0, 2) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground shadow-large">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Hello, {profile.full_name}!</h1>
            <p className="text-primary-foreground/80 mb-4">
              Ready to discover your next opportunity?
            </p>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/20">
              <Search className="mr-2 h-4 w-4" />
              Browse Jobs
            </Button>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">$2,450</div>
            <div className="text-sm text-primary-foreground/80">This Month</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeProjects > 0 ? activeProjects : '—'}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +1 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{myApplications.length > 0 ? myApplications.length : '—'}</div>
            <p className="text-xs text-muted-foreground">
              {myApplications.filter(app => app.status === 'pending').length} pending responses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{earnings > 0 ? `$${earnings}` : '—'}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{myApplications.length > 0 ? `${successRate}%` : '—'}</div>
            <p className="text-xs text-muted-foreground">
              From {myApplications.length} applications
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Jobs */}
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recommended for You</CardTitle>
              <Link to="/browse-jobs">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedJobs.length === 0 ? (
              <div className="text-muted-foreground">No jobs found.</div>
            ) : (
              recommendedJobs.map((job) => {
                const state = applyState[job.id] || {};
                const alreadyApplied = myApplications.some(app => app.job_id === job.id);
                const handleApply = async () => {
                  if (!profile) return;
                  setApplyState(s => ({ ...s, [job.id]: { loading: true, error: null, success: false } }));
                  const { error } = await createApplication({
                    job_id: job.id,
                    freelancer_id: profile.id,
                    proposed_rate: '', // Optionally prompt for this
                    status: 'pending',
                  });
                  if (error) {
                    setApplyState(s => ({ ...s, [job.id]: { loading: false, error, success: false } }));
                  } else {
                    setApplyState(s => ({ ...s, [job.id]: { loading: false, error: null, success: true } }));
                  }
                };
                return (
                  <div key={job.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-smooth group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm group-hover:text-primary transition-smooth">{job.title}</h3>
                      <Badge variant={job.status === "open" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {/* Skills can be added here if available */}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        onClick={handleApply}
                        disabled={state.loading || alreadyApplied}
                        variant={alreadyApplied ? 'outline' : 'default'}
                      >
                        {alreadyApplied ? 'Applied' : state.loading ? 'Applying...' : 'Apply'}
                      </Button>
                      {state.error && <span className="text-red-500 text-xs ml-2">{state.error}</span>}
                      {state.success && <span className="text-green-600 text-xs ml-2">Applied!</span>}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <Link to="/applications">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {myApplications.map((app) => (
              <div key={app.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-smooth">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{app.jobTitle}</h3>
                  <Badge 
                    variant={app.status === "accepted" ? "default" : app.status === "pending" ? "secondary" : "outline"}
                    className={
                      app.status === "accepted" ? "bg-success text-success-foreground" :
                      app.status === "rejected" ? "bg-destructive text-destructive-foreground" : ""
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {app.proposedRate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Applied {app.appliedDate}
                  </span>
                </div>
                {app.status === "accepted" && (
                  <div className="mt-2">
                    <Progress value={100} className="h-1" />
                    <p className="text-xs text-success mt-1">Congratulations! Project starting soon.</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}