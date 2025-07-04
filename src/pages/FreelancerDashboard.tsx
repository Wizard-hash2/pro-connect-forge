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
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground shadow-large">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Hello, Alex!</h1>
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
            <div className="text-2xl font-bold text-primary">3</div>
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
            <div className="text-2xl font-bold text-primary">8</div>
            <p className="text-xs text-muted-foreground">
              2 pending responses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$2,450</div>
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
            <div className="text-2xl font-bold text-primary">85%</div>
            <p className="text-xs text-muted-foreground">
              From 20 applications
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
            {recommendedJobs.map((job) => (
              <div key={job.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-smooth group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-smooth">{job.title}</h3>
                  <Badge variant={job.type === "hourly" ? "default" : "secondary"}>
                    {job.type}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {job.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.posted}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-smooth">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
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
            {recentApplications.map((app) => (
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