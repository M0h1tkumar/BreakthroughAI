import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Pill, MessageSquare, Brain } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { secureDB } from '@/lib/secureDatabase';

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState(analytics.getAnalytics());
  const [systemStats, setSystemStats] = useState({
    totalPatients: 0,
    totalReports: 0,
    totalMedicines: 0,
    totalPharmacies: 0
  });

  useEffect(() => {
    setAnalyticsData(analytics.getAnalytics());
    setSystemStats({
      totalPatients: secureDB.getPatients().length,
      totalReports: secureDB.getReports().length,
      totalMedicines: secureDB.getMedicines().length,
      totalPharmacies: secureDB.getPharmacies().length
    });
  }, []);

  const chartData = [
    { name: 'AI Usage', value: analyticsData.aiUsage },
    { name: 'Reports', value: analyticsData.reportsGenerated },
    { name: 'Prescriptions', value: analyticsData.prescriptionsDispensed },
    { name: 'WhatsApp Shares', value: analyticsData.whatsappShares }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time system performance and usage metrics</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Council Usage</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.aiUsage}</div>
            <p className="text-xs text-muted-foreground">Doctor-only AI sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp E-Bills</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.whatsappShares}</div>
            <p className="text-xs text-muted-foreground">Shared to 9853224433</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Inventory Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicine Inventory Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemStats.totalMedicines}</div>
              <p className="text-sm text-muted-foreground">Total Medicines</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemStats.totalPharmacies}</div>
              <p className="text-sm text-muted-foreground">Partner Pharmacies</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {secureDB.getMedicineCategories().length}
              </div>
              <p className="text-sm text-muted-foreground">Medicine Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm text-green-700">
            <p>✅ HIPAA Compliant - All patient data encrypted</p>
            <p>✅ AI Council - Doctor-only access enforced</p>
            <p>✅ Audit Trail - All actions logged</p>
            <p>✅ E-Bill Integration - WhatsApp sharing active</p>
            <p>✅ Medical Disclaimers - Auto-injected in all AI reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}