import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  Calendar,
  Globe,
  Filter,
  BookOpen,
  FlaskConical,
  FileText,
  Scale,
  TrendingUp,
  ChevronDown,
  Save,
  Play,
  Settings2,
  Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const therapeuticAreas = [
  "Oncology",
  "Neurology",
  "Cardiology",
  "Immunology",
  "Rare Diseases",
  "Infectious Diseases",
  "Metabolic Disorders",
];

const dataSources = [
  { id: "journals", name: "Scientific Journals", icon: BookOpen, enabled: true },
  { id: "clinical", name: "Clinical Trials", icon: FlaskConical, enabled: true },
  { id: "patents", name: "Patents", icon: FileText, enabled: true },
  { id: "regulatory", name: "Regulatory", icon: Scale, enabled: true },
  { id: "market", name: "Market Data", icon: TrendingUp, enabled: false },
];

export default function NewQuery() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [dateRange, setDateRange] = useState("1-year");
  const [geography, setGeography] = useState("global");
  const [sources, setSources] = useState(dataSources);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const toggleSource = (id: string) => {
    setSources(
      sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const enabledSources = sources.filter((s) => s.enabled);

  const handleRunQuery = () => {
    navigate("/queries/results");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            New Research Query
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask anything about pharmaceutical research, and our AI agents will search across multiple sources.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Research Question — e.g., "What are the latest developments in CAR-T cell therapy for multiple myeloma?" Be as specific as possible for better results.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Query Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Your Query</span>
              </div>
              <Textarea
                placeholder="Ask anything, e.g. 'Find emerging oncology drug molecules from last 3 years' or 'Compare GLP-1 receptor agonists in Phase III trials'"
                className="min-h-[150px] resize-none text-base border-0 bg-secondary/30 focus-visible:ring-1"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {[
                  "CAR-T therapy developments",
                  "mRNA vaccine patents",
                  "Alzheimer's biomarkers",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="text-xs text-accent hover:underline"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Filters</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Therapeutic Area */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    Therapeutic Area
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Focus your search on specific therapeutic areas
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="All areas" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapeuticAreas.map((area) => (
                        <SelectItem key={area} value={area.toLowerCase()}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date Range
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">Last 1 year</SelectItem>
                      <SelectItem value="3-years">Last 3 years</SelectItem>
                      <SelectItem value="5-years">Last 5 years</SelectItem>
                      <SelectItem value="10-years">Last 10 years</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Geography */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Geography
                  </label>
                  <Select value={geography} onValueChange={setGeography}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="asia">Asia Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Data Sources</span>
                  <Badge variant="secondary" className="text-xs">
                    {enabledSources.length} active
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 transition-colors cursor-pointer",
                      source.enabled
                        ? "border-accent/50 bg-accent/5"
                        : "border-border bg-secondary/20 opacity-60"
                    )}
                    onClick={() => toggleSource(source.id)}
                  >
                    <div className="flex items-center gap-2">
                      <source.icon
                        className={cn(
                          "h-4 w-4",
                          source.enabled ? "text-accent" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={() => toggleSource(source.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Advanced Options
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      advancedOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 rounded-xl border border-border bg-card p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Max Results
                    </label>
                    <Select defaultValue="500">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 results</SelectItem>
                        <SelectItem value="250">250 results</SelectItem>
                        <SelectItem value="500">500 results</SelectItem>
                        <SelectItem value="1000">1000 results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Sort By
                    </label>
                    <Select defaultValue="relevance">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="citations">Most Cited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                disabled={!query.trim()}
                onClick={handleRunQuery}
              >
                <Play className="mr-2 h-4 w-4" />
                Run Query
              </Button>
            </div>
          </div>

          {/* Right Sidebar - Query Summary */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Query Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Will Search
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {enabledSources.map((source) => (
                      <Badge key={source.id} variant="secondary" className="text-xs">
                        {source.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Time Period
                  </p>
                  <p className="text-sm">
                    {dateRange === "all" ? "All time" : `Last ${dateRange.replace("-", " ")}`}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Region
                  </p>
                  <p className="text-sm capitalize">{geography}</p>
                </div>

                {selectedArea && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Therapeutic Area
                    </p>
                    <p className="text-sm capitalize">{selectedArea}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Estimated processing time
                  </p>
                  <p className="text-2xl font-bold text-accent">~45 sec</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
