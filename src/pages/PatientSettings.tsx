import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Shield, Bell, Key, Download, Phone } from 'lucide-react';
import { authService } from '@/lib/auth';
import { ToastService } from '@/components/ui/toast-notification';

export default function PatientSettings() {
  const user = authService.getCurrentUser();
  const [privacySettings, setPrivacySettings] = useState({
    shareDataWithDoctors: true,
    allowEmergencyAccess: true,
    dataRetention: true,
    anonymousAnalytics: false
  });

  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    reportReady: true,
    prescriptionUpdates: true,
    healthTips: false
  });

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    ToastService.show(`Privacy setting updated: ${setting}`, 'success');
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [setting]: value }));
    ToastService.show('Notification preference updated', 'success');
  };

  const exportPatientData = () => {
    const exportData = {
      patient: user,
      privacySettings,
      notifications,
      exportDate: new Date().toISOString(),
      dataRights: 'GDPR Compliant Export'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patient_data_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ToastService.show('Patient data exported successfully', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Settings</h1>
            <p className="text-muted-foreground">Manage your health profile and privacy preferences</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            HIPAA Protected
          </Badge>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input defaultValue="Pree Om" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date of Birth</label>
                    <Input type="date" defaultValue="1990-01-01" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue={user?.email} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input defaultValue="9853224443" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Emergency Contact</label>
                    <Input defaultValue="+91 9876543210" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Blood Group</label>
                    <Input defaultValue="O+" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input defaultValue="123 Health Street, Medical City, MC 12345" />
                </div>

                <div>
                  <label className="text-sm font-medium">Known Allergies</label>
                  <Input placeholder="List any known allergies..." />
                </div>

                <Button>Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share Data with Doctors</p>
                    <p className="text-sm text-gray-600">Allow your assigned doctors to access your medical history</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareDataWithDoctors}
                    onCheckedChange={(checked) => handlePrivacyChange('shareDataWithDoctors', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Emergency Access</p>
                    <p className="text-sm text-gray-600">Allow emergency medical access to your data</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowEmergencyAccess}
                    onCheckedChange={(checked) => handlePrivacyChange('allowEmergencyAccess', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Retention</p>
                    <p className="text-sm text-gray-600">Keep medical records for future reference</p>
                  </div>
                  <Switch
                    checked={privacySettings.dataRetention}
                    onCheckedChange={(checked) => handlePrivacyChange('dataRetention', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Anonymous Analytics</p>
                    <p className="text-sm text-gray-600">Help improve healthcare with anonymized data</p>
                  </div>
                  <Switch
                    checked={privacySettings.anonymousAnalytics}
                    onCheckedChange={(checked) => handlePrivacyChange('anonymousAnalytics', checked)}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Data Rights (GDPR)</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">You have the right to:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Access your personal data</li>
                      <li>Correct inaccurate data</li>
                      <li>Delete your data (right to be forgotten)</li>
                      <li>Port your data to another service</li>
                      <li>Object to data processing</li>
                    </ul>
                  </div>
                </div>

                <Button>Save Privacy Settings</Button>
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
                        {key === 'appointmentReminders' && 'Get reminded about upcoming appointments'}
                        {key === 'reportReady' && 'Notification when medical reports are ready'}
                        {key === 'prescriptionUpdates' && 'Updates on prescription status'}
                        {key === 'healthTips' && 'Receive personalized health tips and advice'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                    />
                  </div>
                ))}

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Notification Methods</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Email notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">SMS notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">WhatsApp notifications</span>
                    </div>
                  </div>
                </div>

                <Button>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Security & Account
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
                  <h3 className="font-medium mb-3">Data Export</h3>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={exportPatientData} className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download My Medical Data
                    </Button>
                    <p className="text-xs text-gray-600">
                      Export all your medical records, reports, and account data
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Account Security</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Account created: {new Date().toLocaleDateString()}</p>
                    <p>• Last login: {new Date().toLocaleString()}</p>
                    <p>• Two-factor authentication: Recommended</p>
                    <p>• Data encryption: AES-256 (Active)</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 text-red-600">Danger Zone</h3>
                  <Button variant="destructive" className="w-full">
                    Delete My Account
                  </Button>
                  <p className="text-xs text-gray-600 mt-2">
                    This will permanently delete your account and all medical data. This action cannot be undone.
                  </p>
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