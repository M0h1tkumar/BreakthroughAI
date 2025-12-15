import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Shield, Brain, Bell, Key, Download } from 'lucide-react';
import { authService } from '@/lib/auth';
import { analytics } from '@/lib/analytics';
import { ToastService } from '@/components/ui/toast-notification';

export default function DoctorSettings() {
  const user = authService.getCurrentUser();
  const [aiSettings, setAiSettings] = useState({
    autoAnalysis: true,
    confidenceThreshold: 0.8,
    riskAlerts: true,
    complianceMode: true
  });

  const [notifications, setNotifications] = useState({
    newPatients: true,
    aiInsights: true,
    prescriptionUpdates: true,
    systemAlerts: true
  });

  const handleAISettingChange = (setting: string, value: boolean | number) => {
    setAiSettings(prev => ({ ...prev, [setting]: value }));
    ToastService.show(`AI setting updated: ${setting}`, 'success');
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [setting]: value }));
    ToastService.show(`Notification setting updated`, 'success');
  };

  const exportData = () => {
    const analyticsData = analytics.getAnalytics();
    const exportData = {
      doctor: user,
      analytics: analyticsData,
      settings: { ai: aiSettings, notifications },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doctor_data_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ToastService.show('Doctor data exported successfully', 'success');
  };

  const resetAISettings = () => {
    setAiSettings({
      autoAnalysis: true,
      confidenceThreshold: 0.8,
      riskAlerts: true,
      complianceMode: true
    });
    ToastService.show('AI settings reset to defaults', 'info');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Settings</h1>
            <p className="text-muted-foreground">Manage your medical practice preferences and AI configurations</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Medical Professional
          </Badge>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="ai">AI Council</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Doctor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input defaultValue="Dr. Sunita Chen" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Medical License</label>
                    <Input defaultValue={user?.licenseNumber || 'MD123456'} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Specialty</label>
                    <Input defaultValue="General Medicine" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hospital/Clinic</label>
                    <Input defaultValue="City General Hospital" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue={user?.email} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input defaultValue="+91 9876543200" />
                  </div>
                </div>
                <Button>Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Council Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto AI Analysis</p>
                    <p className="text-sm text-gray-600">Automatically run AI analysis on new patients</p>
                  </div>
                  <Switch
                    checked={aiSettings.autoAnalysis}
                    onCheckedChange={(checked) => handleAISettingChange('autoAnalysis', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confidence Threshold: {(aiSettings.confidenceThreshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={aiSettings.confidenceThreshold}
                    onChange={(e) => handleAISettingChange('confidenceThreshold', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">Minimum confidence for AI recommendations</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Risk Alerts</p>
                    <p className="text-sm text-gray-600">Show high-priority risk flags prominently</p>
                  </div>
                  <Switch
                    checked={aiSettings.riskAlerts}
                    onCheckedChange={(checked) => handleAISettingChange('riskAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compliance Mode</p>
                    <p className="text-sm text-gray-600">Enforce medical disclaimers and audit logging</p>
                  </div>
                  <Switch
                    checked={aiSettings.complianceMode}
                    onCheckedChange={(checked) => handleAISettingChange('complianceMode', checked)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={resetAISettings} variant="outline">Reset to Defaults</Button>
                  <Button>Save AI Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm text-gray-600">
                        {key === 'newPatients' && 'Get notified when new patients are assigned'}
                        {key === 'aiInsights' && 'Receive AI analysis completion alerts'}
                        {key === 'prescriptionUpdates' && 'Updates on prescription status from pharmacy'}
                        {key === 'systemAlerts' && 'Important system and security notifications'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                    />
                  </div>
                ))}
                <Button>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Current Password</label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">New Password</label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Data Management</h3>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={exportData} className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data (GDPR Compliance)
                    </Button>
                    <p className="text-xs text-gray-600">
                      Download all your data including analytics, settings, and audit logs
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Session Security</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Session timeout: 30 minutes</p>
                    <p>• Two-factor authentication: Enabled</p>
                    <p>• Last login: {new Date().toLocaleString()}</p>
                    <p>• IP Address: 192.168.1.100 (Secure)</p>
                  </div>
                </div>

                <Button>Update Security Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}