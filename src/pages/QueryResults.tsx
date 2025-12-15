import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  BookOpen,
  FlaskConical,
  FileText,
  Scale,
  TrendingUp,
  Download,
  Share2,
  Bookmark,
  ExternalLink,
  Filter,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const agents = [
  { id: "regulatory", name: "Regulatory", icon: Scale, status: "completed", results: 23 },
  { id: "clinical", name: "Clinical Trials", icon: FlaskConical, status: "completed", results: 156 },
  { id: "journals", name: "Journals", icon: BookOpen, status: "running", results: 0 },
  { id: "patents", name: "Patents", icon: FileText, status: "pending", results: 0 },
  { id: "market", name: "Market", icon: TrendingUp, status: "pending", results: 0 },
];

const summaryPoints = [
  "CAR-T therapy shows 78% response rate in refractory B-cell lymphomas, with emerging applications in solid tumors showing early promise.",
  "Major regulatory approvals in 2023-2024 include 3 new CAR-T products from Novartis, Kite/Gilead, and Bristol Myers Squibb.",
  "Key patent filings focus on next-generation CAR constructs with improved persistence and reduced cytokine release syndrome.",
  "Market projected to reach $22.8B by 2028, with CAGR of 34.2% driven by expanded indications and improved manufacturing.",
];

const clinicalTrials = [
  {
    id: "NCT05123456",
    title: "Phase III Study of CAR-T in Relapsed/Refractory Multiple Myeloma",
    phase: "Phase III",
    status: "Recruiting",
    sponsor: "Novartis",
    location: "Multi-center, Global",
  },
  {
    id: "NCT05234567",
    title: "CAR-T Cell Therapy Combined with Checkpoint Inhibitor in Solid Tumors",
    phase: "Phase II",
    status: "Active",
    sponsor: "Bristol Myers Squibb",
    location: "United States",
  },
  {
    id: "NCT05345678",
    title: "Allogeneic CAR-T for B-Cell Acute Lymphoblastic Leukemia",
    phase: "Phase I/II",
    status: "Recruiting",
    sponsor: "Allogene Therapeutics",
    location: "United States, Europe",
  },
];

const statusConfig = {
  completed: { icon: CheckCircle2, className: "text-accent", label: "Completed" },
  running: { icon: Loader2, className: "text-chart-2 animate-spin", label: "Running" },
  pending: { icon: AlertCircle, className: "text-muted-foreground", label: "Pending" },
};

export default function QueryResults() {
  const [activeTab, setActiveTab] = useState("overview");

  const completedAgents = agents.filter((a) => a.status === "completed").length;
  const totalAgents = agents.length;
  const progressPercent = (completedAgents / totalAgents) * 100;

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Panel - Agent Timeline */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-4">Agent Progress</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{completedAgents}/{totalAgents}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="space-y-2">
              {agents.map((agent) => {
                const status = statusConfig[agent.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={agent.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      agent.status === "completed"
                        ? "bg-accent/5"
                        : agent.status === "running"
                        ? "bg-chart-2/5"
                        : "bg-secondary/30"
                    )}
                  >
                    <div className={cn("flex-shrink-0", status.className)}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <agent.icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">{agent.name}</span>
                      </div>
                      {agent.status === "completed" && (
                        <span className="text-xs text-muted-foreground">
                          {agent.results} results
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Query Info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-medium mb-3">Query Details</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Query</p>
                <p className="font-medium mt-1">CAR-T cell therapy developments in solid tumors 2023-2024</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Started</p>
                <p className="mt-1">2 minutes ago</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Sources</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">Journals</Badge>
                  <Badge variant="secondary" className="text-xs">Clinical</Badge>
                  <Badge variant="secondary" className="text-xs">Patents</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">Query Results</h1>
              <p className="text-sm text-muted-foreground">
                Found 179 results across 3 sources
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="gradient" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="overview">Overview Summary</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Trials</TabsTrigger>
              <TabsTrigger value="papers">Scientific Papers</TabsTrigger>
              <TabsTrigger value="patents">Patents</TabsTrigger>
              <TabsTrigger value="market">Market Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* AI Summary */}
              <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-accent text-lg">✨</span>
                  </div>
                  <h3 className="font-semibold">AI-Generated Summary</h3>
                </div>
                <ul className="space-y-3">
                  {summaryPoints.map((point, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Metrics */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-accent">156</p>
                  <p className="text-sm text-muted-foreground">Clinical Trials</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-chart-2">847</p>
                  <p className="text-sm text-muted-foreground">Publications</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-chart-3">234</p>
                  <p className="text-sm text-muted-foreground">Patents</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-chart-4">$22.8B</p>
                  <p className="text-sm text-muted-foreground">Market Size 2028</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Showing 156 clinical trials</p>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <div className="space-y-3">
                {clinicalTrials.map((trial) => (
                  <div
                    key={trial.id}
                    className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              trial.status === "Recruiting" && "bg-accent/10 text-accent"
                            )}
                          >
                            {trial.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {trial.phase}
                          </Badge>
                        </div>
                        <h4 className="font-medium group-hover:text-accent transition-colors">
                          {trial.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{trial.id}</span>
                          <span>•</span>
                          <span>{trial.sponsor}</span>
                          <span>•</span>
                          <span>{trial.location}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Load More Results
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </TabsContent>

            <TabsContent value="papers" className="mt-6">
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Scientific Papers</h3>
                <p className="text-sm text-muted-foreground">
                  847 papers found. Agent still processing...
                </p>
              </div>
            </TabsContent>

            <TabsContent value="patents" className="mt-6">
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Patent Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Waiting for Patents agent to complete...
                </p>
              </div>
            </TabsContent>

            <TabsContent value="market" className="mt-6">
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Market Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Waiting for Market agent to complete...
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
