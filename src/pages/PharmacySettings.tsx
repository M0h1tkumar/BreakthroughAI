import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, Shield, Database, Pill, Save } from 'lucide-react';

export default function PharmacySettings() {
  const [settings, setSettings] = useState({
    pharmacyName: 'Apollo Pharmacy',
    licenseNumber: 'PH123456789',
    address: '123 Main Street, Delhi',
    phone: '9876543300',
    email: 'apollo@pharmacy.com',
    whatsappNumber: '9853224443',
    autoDispense: false,
    stockAlerts: true,
    lowStockThreshold: 50,
    notifications: {
      prescriptions: true,
      stockAlerts: true,
      eBills: true,
      whatsapp: true
    },
    inventory: {
      autoReorder: false,
      reorderThreshold: 100,
      maxStock: 1000
    }
  });

  const handleSave = () => {
    localStorage.setItem('pharmacySettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pharmacy Settings</h1>
            <p className="text-muted-foreground">Configure your pharmacy preferences and operations</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Pill className="h-4 w-4" />
            Pharmacy Portal
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pharmacy Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input
                    id="pharmacyName"
                    value={settings.pharmacyName}
                    onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={settings.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Reorder</Label>
                    <p className="text-sm text-gray-600">Automatically reorder medicines when stock is low</p>
                  </div>
                  <Switch
                    checked={settings.inventory.autoReorder}
                    onCheckedChange={(checked) => handleNestedChange('inventory', 'autoReorder', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reorderThreshold">Reorder Threshold</Label>
                  <Input
                    id="reorderThreshold"
                    type="number"
                    value={settings.inventory.reorderThreshold}
                    onChange={(e) => handleNestedChange('inventory', 'reorderThreshold', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxStock">Maximum Stock Level</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={settings.inventory.maxStock}
                    onChange={(e) => handleNestedChange('inventory', 'maxStock', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Prescriptions</Label>
                    <p className="text-sm text-gray-600">Get notified when new prescriptions arrive</p>
                  </div>
                  <Switch
                    checked={settings.notifications.prescriptions}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'prescriptions', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stock Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified when medicines are running low</p>
                  </div>
                  <Switch
                    checked={settings.notifications.stockAlerts}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'stockAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>E-Bill Generation</Label>
                    <p className="text-sm text-gray-600">Get notified when e-bills are generated</p>
                  </div>
                  <Switch
                    checked={settings.notifications.eBills}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'eBills', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Sharing</Label>
                    <p className="text-sm text-gray-600">Auto-share e-bills via WhatsApp</p>
                  </div>
                  <Switch
                    checked={settings.notifications.whatsapp}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'whatsapp', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Dispense</Label>
                    <p className="text-sm text-gray-600">Automatically dispense ready prescriptions</p>
                  </div>
                  <Switch
                    checked={settings.autoDispense}
                    onCheckedChange={(checked) => handleInputChange('autoDispense', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stock Monitoring</Label>
                    <p className="text-sm text-gray-600">Enable real-time stock monitoring</p>
                  </div>
                  <Switch
                    checked={settings.stockAlerts}
                    onCheckedChange={(checked) => handleInputChange('stockAlerts', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number (E-Bills)</Label>
                  <Input
                    id="whatsappNumber"
                    value={settings.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    placeholder="9853224443"
                  />
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Compliance Status</h4>
                  <div className="text-sm text-blue-700 mt-1 space-y-1">
                    <p>✅ Pharmacy License Valid</p>
                    <p>✅ Drug Controller Approved</p>
                    <p>✅ GST Registration Active</p>
                    <p>✅ HIPAA Compliant</p>
                    <p>✅ WhatsApp: {settings.whatsappNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Pill className="h-8 w-8 text-green-600 mx-auto" />
                  <h3 className="font-medium">System Status</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Inventory System: Online</p>
                    <p>• E-Bill Service: Active</p>
                    <p>• WhatsApp Integration: Connected</p>
                    <p>• Prescription Sync: Real-time</p>
                  </div>
                  <Button onClick={handleSave} className="w-full mt-4">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}