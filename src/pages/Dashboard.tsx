import { Clock, TrendingUp, Search, FileText, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentQueries } from "@/components/dashboard/RecentQueries";
import { TherapeuticChart } from "@/components/dashboard/TherapeuticChart";
import { AgentStatus } from "@/components/dashboard/AgentStatus";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Dr. Chen</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your research intelligence
          </p>
        </div>
        <Button variant="gradient" onClick={() => navigate("/queries/new")}>
          <Sparkles className="mr-2 h-4 w-4" />
          New Query
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Time Saved"
          value="847 hrs"
          description="This quarter"
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 23, label: "vs last quarter" }}
        />
        <StatsCard
          title="Queries Run"
          value="1,234"
          description="Total queries"
          icon={<Search className="h-5 w-5" />}
          trend={{ value: 12, label: "vs last month" }}
        />
        <StatsCard
          title="Reports Generated"
          value="89"
          description="This month"
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8, label: "vs last month" }}
        />
        <StatsCard
          title="Insights Discovered"
          value="2.4K"
          description="Actionable insights"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 34, label: "vs last quarter" }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Queries - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentQueries />
        </div>

        {/* Agent Status */}
        <div>
          <AgentStatus />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TherapeuticChart />

        {/* Quick Actions Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="h-auto flex-col items-start p-4 text-left"
              onClick={() => navigate("/queries/new")}
            >
              <Search className="h-5 w-5 mb-2 text-accent" />
              <span className="font-medium">Start New Query</span>
              <span className="text-xs text-muted-foreground mt-1">
                Ask anything about pharma data
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto flex-col items-start p-4 text-left"
              onClick={() => navigate("/reports")}
            >
              <FileText className="h-5 w-5 mb-2 text-accent" />
              <span className="font-medium">View Reports</span>
              <span className="text-xs text-muted-foreground mt-1">
                Access generated insights
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto flex-col items-start p-4 text-left"
            >
              <TrendingUp className="h-5 w-5 mb-2 text-accent" />
              <span className="font-medium">Market Analysis</span>
              <span className="text-xs text-muted-foreground mt-1">
                Competitive intelligence
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto flex-col items-start p-4 text-left"
            >
              <Clock className="h-5 w-5 mb-2 text-accent" />
              <span className="font-medium">Scheduled Queries</span>
              <span className="text-xs text-muted-foreground mt-1">
                Manage recurring searches
              </span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
