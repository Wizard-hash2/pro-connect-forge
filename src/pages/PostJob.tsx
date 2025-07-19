import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  DollarSign, 
  Clock,
  Users,
  CheckCircle
} from "lucide-react";
import { useUserProfile } from '@/context/UserProfileContext';
import { createJobPost } from '@/services/jobPostsService';
import axios from 'axios';

interface JobFormData {
  title: string;
  description: string;
  skills: string[];
  budgetType: "hourly" | "fixed";
  budgetMin: number;
  budgetMax: number;
  duration: string;
  experience: string;
  teamSize: string;
}

const skillSuggestions = [
  "React", "TypeScript", "Node.js", "Python", "JavaScript", "HTML/CSS",
  "UI/UX Design", "Figma", "Adobe Creative Suite", "WordPress",
  "SEO", "Content Writing", "Social Media", "Marketing",
  "Data Analysis", "SQL", "Machine Learning", "AWS"
];

const AI_QUESTIONS = [
  { field: "title", question: "What is the title of your job post?" },
  { field: "description", question: "Please describe the job in detail." },
  { field: "skills", question: "What skills are required? (List up to 6)" },
  { field: "budget_min", question: "What is the minimum budget for this job?" },
  { field: "budget_max", question: "What is the maximum budget for this job?" },
  { field: "deadline", question: "What is the deadline for this job? (YYYY-MM-DD)" },
  { field: "required_experience_level", question: "What experience level do you require? (junior, mid, senior, expert)" },
];

function AIJobPostHelper({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chat, setChat] = useState([
    { from: "ai", text: "Let's create your job post! I'll ask you a few questions." }
  ]);
  const [loading, setLoading] = useState(false);
  const [polished, setPolished] = useState(null);

  const handleUserInput = async (input) => {
    const field = AI_QUESTIONS[step].field;
    const newAnswers = { ...answers, [field]: input };
    setAnswers(newAnswers);
    setChat([...chat, { from: "user", text: input }]);
    if (step < AI_QUESTIONS.length - 1) {
      setStep(step + 1);
      setChat((c) => [...c, { from: "ai", text: AI_QUESTIONS[step + 1].question }]);
    } else {
      setLoading(true);
      try {
        // Call your backend LLM endpoint (replace URL as needed)
        const res = await axios.post("/api/polish-job-post", newAnswers);
        setPolished(res.data.summary);
        setChat((c) => [
          ...c,
          { from: "ai", text: "Here's your polished job post overview:" },
          { from: "ai", text: res.data.summary }
        ]);
        if (onComplete) onComplete(newAnswers, res.data.summary);
      } catch (err) {
        setChat((c) => [
          ...c,
          { from: "ai", text: "Sorry, something went wrong with the AI summary." }
        ]);
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <div className="mb-4">
        {chat.map((msg, idx) => (
          <div key={idx} className={msg.from === "ai" ? "text-blue-700" : "text-black"}>
            <b>{msg.from === "ai" ? "AI" : "You"}:</b> {msg.text}
          </div>
        ))}
      </div>
      {!polished && !loading && (
        <form
          onSubmit={e => {
            e.preventDefault();
            const input = e.target.elements.input.value;
            if (input.trim()) handleUserInput(input.trim());
            e.target.reset();
          }}
        >
          <input
            name="input"
            className="w-full border rounded px-3 py-2"
            autoFocus
            placeholder="Type your answer..."
          />
        </form>
      )}
      {loading && <div>Polishing your job post...</div>}
      {polished && (
        <div className="mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => onComplete && onComplete(answers, polished)}
          >
            Use This Job Post
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostJob() {
  const [currentStep, setCurrentStep] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    skills: [],
    budgetType: "hourly",
    budgetMin: 25,
    budgetMax: 100,
    duration: "",
    experience: "",
    teamSize: "1"
  });
  const { profile } = useUserProfile();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [useAIHelper, setUseAIHelper] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleBudgetChange = (values: number[], index: number) => {
    if (index === 0) {
      setFormData(prev => ({ ...prev, budgetMin: values[0] }));
    } else {
      setFormData(prev => ({ ...prev, budgetMax: values[0] }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!profile) {
      setSubmitError('You must be logged in to post a job.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    const { data, error } = await createJobPost({
      client_id: profile.id,
      title: formData.title,
      description: formData.description,
      budget_min: formData.budgetMin,
      budget_max: formData.budgetMax,
      required_experience_level: formData.experience as any,
      status: 'open',
      deadline: null, // You can add a deadline field to the form if needed
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
    } else {
      setSubmitSuccess(true);
      setFormData({
        title: "",
        description: "",
        skills: [],
        budgetType: "hourly",
        budgetMin: 25,
        budgetMax: 100,
        duration: "",
        experience: "",
        teamSize: "1"
      });
      setCurrentStep(1);
    }
  };

  const handleAIComplete = (data, summary) => {
    setFormData(prev => ({
      ...prev,
      title: data.title || "",
      description: summary || data.description || "",
      skills: data.skills ? data.skills.split(/,|;/).map(s => s.trim()).filter(Boolean) : [],
      budgetMin: Number(data.budget_min) || 0,
      budgetMax: Number(data.budget_max) || 0,
      duration: data.deadline || "",
      experience: data.required_experience_level || "",
      teamSize: "1"
    }));
    setUseAIHelper(false);
    setTimeout(() => handleSubmit(), 100); // submit after state update
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tell us about your project</h2>
              <p className="text-muted-foreground">Start with a strong title and clear description</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Build a modern React dashboard"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project requirements, goals, and any specific details..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2 min-h-32"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What skills are required?</h2>
              <p className="text-muted-foreground">Add skills to help us match you with the right freelancers</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Add Skills</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addSkill(skillInput)}
                    disabled={!skillInput}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formData.skills.length > 0 && (
                <div>
                  <Label>Selected Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="pr-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Suggested Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillSuggestions
                    .filter(skill => !formData.skills.includes(skill))
                    .slice(0, 12)
                    .map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => addSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Set your budget</h2>
              <p className="text-muted-foreground">Choose how you'd like to pay and set your budget range</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Payment Type</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Card 
                    className={`cursor-pointer transition-smooth ${formData.budgetType === 'hourly' ? 'ring-2 ring-primary bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setFormData(prev => ({ ...prev, budgetType: 'hourly' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Hourly Rate</h3>
                      <p className="text-sm text-muted-foreground">Pay by the hour</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-smooth ${formData.budgetType === 'fixed' ? 'ring-2 ring-primary bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setFormData(prev => ({ ...prev, budgetType: 'fixed' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Fixed Price</h3>
                      <p className="text-sm text-muted-foreground">Pay a set amount</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>
                    {formData.budgetType === 'hourly' ? 'Hourly Rate Range' : 'Project Budget Range'}
                  </Label>
                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Minimum: ${formData.budgetMin}</span>
                        <span className="text-sm">Maximum: ${formData.budgetMax}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Slider
                            value={[formData.budgetMin]}
                            onValueChange={(values) => handleBudgetChange(values, 0)}
                            max={200}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Slider
                            value={[formData.budgetMax]}
                            onValueChange={(values) => handleBudgetChange(values, 1)}
                            max={200}
                            min={formData.budgetMin + 10}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Market Rate Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on similar projects: ${formData.budgetType === 'hourly' ? '40-80/hr' : '2,000-8,000'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Project details</h2>
              <p className="text-muted-foreground">Help freelancers understand your timeline and requirements</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="duration">Project Duration</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">Less than 1 week</SelectItem>
                    <SelectItem value="1-month">1-4 weeks</SelectItem>
                    <SelectItem value="3-months">1-3 months</SelectItem>
                    <SelectItem value="6-months">3-6 months</SelectItem>
                    <SelectItem value="ongoing">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={formData.experience} onValueChange={val => setFormData(prev => ({ ...prev, experience: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Individual freelancer</SelectItem>
                    <SelectItem value="2-3">Small team (2-3 people)</SelectItem>
                    <SelectItem value="4-6">Medium team (4-6 people)</SelectItem>
                    <SelectItem value="7+">Large team (7+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{formData.title || "Untitled Project"}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.description || "No description provided"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Budget:</span> ${formData.budgetMin}-${formData.budgetMax} {formData.budgetType === 'hourly' ? '/hr' : 'total'}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Card className="shadow-large">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Post a New Job</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">{Math.round(progress)}% Complete</div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="flex justify-end mb-4">
            <Button variant={useAIHelper ? "secondary" : "default"} onClick={() => setUseAIHelper(v => !v)}>
              {useAIHelper ? "Switch to Form" : "Try AI Job Post Helper"}
            </Button>
          </div>
          {useAIHelper ? (
            <AIJobPostHelper onComplete={handleAIComplete} />
          ) : (
            <div>{renderStep()}</div>
          )}

          <Separator className="my-8" />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} disabled={submitting}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {submitError && <div className="text-red-500 mt-2">{submitError}</div>}
          {submitSuccess && <div className="text-green-600 mt-2">Job posted successfully!</div>}
        </CardContent>
      </Card>
    </div>
  );
}