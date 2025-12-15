import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  User,
  Database,
  Shield,
  Lock,
  Key,
  LogOut,
  RefreshCw,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const dataSources = [
  { id: 1, name: "PubMed API", status: "active", lastSync: "2 min ago", enabled: true },
  { id: 2, name: "ClinicalTrials.gov", status: "active", lastSync: "5 min ago", enabled: true },
  { id: 3, name: "USPTO Patents", status: "active", lastSync: "15 min ago", enabled: true },
];

export default function Settings() {
  const [sources, setSources] = useState(dataSources);
  const [editing, setEditing] = useState(false);
  const [org, setOrg] = useState("BreakThrough Biotech");
  const [role, setRole] = useState("Research Lead");
  const [email, setEmail] = useState("sarah.chen@company.com");

  // toast imported from hooks; call toast({ title, description }) on save

  const toggleSource = (id: number) => {
    setSources(sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const activeSessions = [
    { id: 1, device: "Chrome — Windows", location: "San Francisco, US", lastActive: "2 hours ago" },
    { id: 2, device: "Safari — iPhone", location: "London, UK", lastActive: "1 day ago" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage profile, data sources, and security settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <Database className="h-4 w-4" />
            Data Sources
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Profile</h3>
              <div className="flex items-center gap-2">
                {!editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground">Organization</label>
                {editing ? (
                  <Input value={org} onChange={(e) => setOrg((e.target as HTMLInputElement).value)} />
                ) : (
                  <p className="font-medium">{org}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Role</label>
                {editing ? (
                  <Input value={role} onChange={(e) => setRole((e.target as HTMLInputElement).value)} />
                ) : (
                  <p className="font-medium">{role}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground">Email</label>
                {editing ? (
                  <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} />
                ) : (
                  <p className="font-medium">{email}</p>
                )}
              </div>

              {editing && (
                <div className="sm:col-span-2 flex items-center gap-2">
                  <Button
                    variant="gradient"
                    onClick={() => {
                      setEditing(false);
                      toast({ title: "Profile saved", description: "Your profile changes have been saved." });
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // reset to previous values for demo (no persistence)
                      setOrg("BreakThrough Biotech");
                      setRole("Research Lead");
                      setEmail("sarah.chen@company.com");
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <div className="rounded-xl border border-border bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Connected Data Sources</h3>
                <p className="text-sm text-muted-foreground">Manage API connections and sync status</p>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Source
              </Button>
            </div>
            <div className="divide-y divide-border">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-muted-foreground">Last sync: {source.lastSync}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Switch checked={source.enabled} onCheckedChange={() => toggleSource(source.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Change Password</h3>
              <p className="text-sm text-muted-foreground mb-4">Update your account password</p>
              <div className="space-y-3">
                <input type="password" placeholder="Current password" className="w-full rounded-md border border-border p-2 bg-transparent" />
                <input type="password" placeholder="New password" className="w-full rounded-md border border-border p-2 bg-transparent" />
                <Button>Update Password</Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for account sign-ins</p>
                </div>
                <Switch />
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Active Sessions</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.device}</TableCell>
                        <TableCell className="text-muted-foreground">{s.location}</TableCell>
                        <TableCell className="text-muted-foreground">{s.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Revoke</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
