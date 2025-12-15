import { useState } from "react";
import {
  Database,
  Users,
  Settings,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const dataSources = [
  { id: 1, name: "PubMed API", status: "active", lastSync: "2 min ago", enabled: true },
  { id: 2, name: "ClinicalTrials.gov", status: "active", lastSync: "5 min ago", enabled: true },
  { id: 3, name: "USPTO Patents", status: "active", lastSync: "15 min ago", enabled: true },
  { id: 4, name: "FDA Regulatory", status: "error", lastSync: "Failed", enabled: true },
  { id: 5, name: "EMA Database", status: "active", lastSync: "1 hour ago", enabled: false },
  { id: 6, name: "IQVIA Market Data", status: "active", lastSync: "30 min ago", enabled: true },
];

const users = [
  { id: 1, name: "Dr. Sarah Chen", email: "sarah.chen@company.com", role: "Admin", status: "Active" },
  { id: 2, name: "Dr. Michael Park", email: "michael.park@company.com", role: "Researcher", status: "Active" },
  { id: 3, name: "Dr. Emily Watson", email: "emily.watson@company.com", role: "Researcher", status: "Active" },
  { id: 4, name: "Dr. James Liu", email: "james.liu@company.com", role: "Viewer", status: "Invited" },
];

export default function Admin() {
  const [sources, setSources] = useState(dataSources);

  const toggleSource = (id: number) => {
    setSources(
      sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage data sources, users, and system configuration
        </p>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="sources" className="gap-2">
            <Database className="h-4 w-4" />
            Data Sources
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Data Sources Tab */}
        <TabsContent value="sources">
          <div className="rounded-xl border border-border bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Connected Data Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Manage API connections and sync status
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Source
              </Button>
            </div>
            <div className="divide-y divide-border">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        source.status === "active"
                          ? "bg-accent/10 text-accent"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        {source.status === "active" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-accent" />
                            <span className="text-muted-foreground">
                              Last sync: {source.lastSync}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-destructive" />
                            <span className="text-destructive">
                              {source.lastSync}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={() => toggleSource(source.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="rounded-xl border border-border bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Team Members</h3>
                <p className="text-sm text-muted-foreground">
                  Manage user access and permissions
                </p>
              </div>
              <Button variant="gradient" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "Admin" ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          user.role === "Admin" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          user.status === "Active"
                            ? "border-accent text-accent"
                            : "border-chart-4 text-chart-4"
                        )}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for completed queries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-save Queries</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically save query history
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Get a weekly summary of insights
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">
                      Limit API calls per minute
                    </p>
                  </div>
                  <Badge variant="secondary">100/min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cache Duration</p>
                    <p className="text-sm text-muted-foreground">
                      How long to cache results
                    </p>
                  </div>
                  <Badge variant="secondary">24 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Debug Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Enable verbose logging
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
