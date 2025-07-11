import { useState, useEffect } from "react";
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
  Users,
  TrendingUp
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

export default function FindFreelancers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("best-match");
  const [filterSkill, setFilterSkill] = useState("all");
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [freelancerProjects, setFreelancerProjects] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'freelancer');
      setFreelancers(data || []);
      setError(error?.message || null);
      setLoading(false);
    };
    fetchFreelancers();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!freelancers) return;
      const projectsMap: Record<string, any[]> = {};
      for (const freelancer of freelancers) {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('profile_id', freelancer.id);
        projectsMap[freelancer.id] = data || [];
      }
      setFreelancerProjects(projectsMap);
    };
    fetchProjects();
  }, [freelancers]);

  const filteredFreelancers = (freelancers || []).filter(freelancer => {
    const matchesSearch = (freelancer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      || (freelancer.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      || (freelancer.experience_level?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesSkill = filterSkill === "all" || (freelancer.bio?.toLowerCase().includes(filterSkill.toLowerCase()) ?? false);
    return matchesSearch && matchesSkill;
  });

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    if (sortBy === 'rate-low') {
      return (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0);
    }
    if (sortBy === 'rate-high') {
      return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0);
    }
    return 0;
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
                <SelectItem value="all">All Skills</SelectItem>
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
          {loading ? 'Loading...' : error ? `Error: ${error}` : `${sortedFreelancers.length} freelancers found`}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{freelancers ? freelancers.length : 0} active this week</span>
        </div>
      </div>

      {/* Freelancer Cards */}
      <div className="grid gap-6">
        {loading ? (
          <div>Loading freelancers...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : sortedFreelancers.length === 0 ? (
          <div className="text-muted-foreground">No freelancers found.</div>
        ) : (
          sortedFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="shadow-medium hover:shadow-large transition-smooth group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {freelancer.full_name?.slice(0, 2).toUpperCase() || 'FR'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-bold">{freelancer.full_name || 'Freelancer'}</h2>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="h-4 w-4 text-yellow-400" />
                            {freelancer.rating ?? '—'}
                          </div>
                        </div>
                        <div className="text-primary font-semibold text-lg">
                          ${freelancer.hourly_rate ?? '—'}/hr
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {freelancer.experience_level || '—'}
                      </div>
                      {/* Projects List */}
                      <div className="mt-2">
                        <span className="font-semibold text-sm">Projects:</span>
                        {freelancerProjects[freelancer.id] && freelancerProjects[freelancer.id].length > 0 ? (
                          <ul className="list-disc ml-5 text-sm">
                            {freelancerProjects[freelancer.id].map(project => (
                              <li key={project.id}>{project.title}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="ml-2 text-gray-400">No projects</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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