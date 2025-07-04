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
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground shadow-large">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-primary-foreground/80 mb-4">
              Ready to find your next amazing freelancer?
            </p>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">4.8</div>
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
            <div className="text-2xl font-bold text-primary">2</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
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
            <div className="text-2xl font-bold text-primary">20</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
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
            <div className="text-2xl font-bold text-primary">$12,450</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
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
            <div className="text-2xl font-bold text-primary">4.8</div>
            <p className="text-xs text-muted-foreground">
              From 15 completed projects
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
            {activeJobs.map((job) => (
              <div key={job.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-smooth">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{job.title}</h3>
                  <Badge 
                    variant={job.status === "active" ? "default" : job.status === "in_progress" ? "secondary" : "outline"}
                    className="capitalize"
                  >
                    {job.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {job.applications} applications
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {job.budget}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due {job.deadline}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Matches */}
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
            {topMatches.map((match) => (
              <div key={match.id} className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-smooth">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                      {match.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{match.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-current text-warning" />
                        {match.rating} • {match.hourlyRate}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {match.compatibility}% match
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {match.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{match.availability}</span>
                  <Progress value={match.compatibility} className="w-16 h-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}