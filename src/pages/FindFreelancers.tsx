import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  MessageCircle,
  Heart,
  Users,
  Award,
  TrendingUp
} from "lucide-react";

interface Freelancer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: string;
  skills: string[];
  description: string;
  availability: string;
  completedJobs: number;
  responseTime: string;
  compatibility: number;
  badges: string[];
}

const freelancers: Freelancer[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    title: "Senior React Developer & UI/UX Designer",
    location: "San Francisco, CA",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: "$85",
    skills: ["React", "TypeScript", "Node.js", "Figma", "UI/UX"],
    description: "Experienced full-stack developer with 5+ years specializing in React ecosystems and modern web applications.",
    availability: "Available now",
    completedJobs: 89,
    responseTime: "1 hour",
    compatibility: 95,
    badges: ["Top Rated", "Rising Talent"]
  },
  {
    id: "2", 
    name: "Marcus Rodriguez",
    avatar: "/avatars/marcus.jpg",
    title: "Mobile App Developer & Designer",
    location: "Austin, TX",
    rating: 4.8,
    reviewCount: 94,
    hourlyRate: "$70",
    skills: ["React Native", "Flutter", "iOS", "Android", "Design"],
    description: "Mobile-first developer creating beautiful, performant apps for startups and enterprises.",
    availability: "Available in 2 days",
    completedJobs: 67,
    responseTime: "30 minutes",
    compatibility: 88,
    badges: ["Top Rated"]
  },
  {
    id: "3",
    name: "Elena Popov",
    avatar: "/avatars/elena.jpg", 
    title: "Full-Stack Python Developer",
    location: "Remote (EU)",
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: "$75",
    skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker"],
    description: "Backend specialist with expertise in scalable web applications and cloud infrastructure.",
    availability: "Available now",
    completedJobs: 134,
    responseTime: "2 hours",
    compatibility: 82,
    badges: ["Top Rated", "Expert Vetted"]
  }
];

export default function FindFreelancers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("best-match");
  const [filterSkill, setFilterSkill] = useState("");

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSkill = !filterSkill || freelancer.skills.includes(filterSkill);
    
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Find Freelancers</h1>
          <p className="text-muted-foreground">Discover talented professionals for your projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Skills</SelectItem>
                <SelectItem value="React">React</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Flutter">Flutter</SelectItem>
                <SelectItem value="UI/UX">UI/UX</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-match">Best Match</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredFreelancers.length} freelancers found
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>3,247 active this week</span>
        </div>
      </div>

      {/* Freelancer Cards */}
      <div className="grid gap-6">
        {filteredFreelancers.map((freelancer) => (
          <Card key={freelancer.id} className="shadow-medium hover:shadow-large transition-smooth group">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Profile Section */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {freelancer.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-smooth">
                          {freelancer.name}
                        </h3>
                        <p className="text-muted-foreground">{freelancer.title}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-smooth">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {freelancer.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs bg-primary/10 text-primary">
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Location and Rating */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {freelancer.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-warning" />
                        {freelancer.rating} ({freelancer.reviewCount} reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Responds in {freelancer.responseTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 lg:border-l lg:pl-6">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {freelancer.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {freelancer.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-accent/50 rounded-lg">
                      <div className="font-semibold text-primary">{freelancer.completedJobs}</div>
                      <div className="text-xs text-muted-foreground">Jobs completed</div>
                    </div>
                    <div className="text-center p-2 bg-accent/50 rounded-lg">
                      <div className="font-semibold text-primary">{freelancer.compatibility}%</div>
                      <div className="text-xs text-muted-foreground">Match score</div>
                    </div>
                    <div className="text-center p-2 bg-accent/50 rounded-lg">
                      <div className="font-semibold text-primary">{freelancer.hourlyRate}/hr</div>
                      <div className="text-xs text-muted-foreground">Hourly rate</div>
                    </div>
                    <div className="text-center p-2 bg-accent/50 rounded-lg">
                      <div className="font-semibold text-primary">{freelancer.availability}</div>
                      <div className="text-xs text-muted-foreground">Availability</div>
                    </div>
                  </div>

                  {/* Compatibility Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Compatibility Score</span>
                      <span className="text-sm text-primary font-medium">{freelancer.compatibility}%</span>
                    </div>
                    <Progress value={freelancer.compatibility} className="h-2" />
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex flex-col gap-2 lg:w-32">
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          <TrendingUp className="mr-2 h-4 w-4" />
          Load More Freelancers
        </Button>
      </div>
    </div>
  );
}