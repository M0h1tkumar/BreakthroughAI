import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, UserCheck, Building, FileText, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '@/lib/adminService';

export default function AdminDashboard() {
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setVerifications(adminService.getAllVerifications());
    setStats(adminService.getAdminStats());
  }, []);

  const handleApprove = (verificationId: string) => {
    const success = adminService.approveVerification(verificationId, 'admin_1', 'License verified and approved');
    if (success) {
      setVerifications(adminService.getAllVerifications());
      setStats(adminService.getAdminStats());
      alert('✅ License approved! User account created.');
    }
  };

  const handleReject = (verificationId: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      const success = adminService.rejectVerification(verificationId, 'admin_1', reason);
      if (success) {
        setVerifications(adminService.getAllVerifications());
        setStats(adminService.getAdminStats());
        alert('❌ License rejected.');
      }
    }
  };

  const pendingVerifications = verifications.filter(v => v.status === 'PENDING');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">License verification and system management</p>
          </div>
          <Badge variant="destructive" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Administrator
          </Badge>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingVerifications}</div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.approvedVerifications}</div>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.rejectedVerifications}</div>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending Verifications ({pendingVerifications.length})</TabsTrigger>
            <TabsTrigger value="all">All Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  License Verifications Pending Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVerifications.length > 0 ? (
                    pendingVerifications.map((verification) => (
                      <div key={verification.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{verification.applicantName}</h3>
                              <Badge variant={verification.role === 'DOCTOR' ? 'default' : 'secondary'}>
                                {verification.role === 'DOCTOR' ? (
                                  <UserCheck className="h-3 w-3 mr-1" />
                                ) : (
                                  <Building className="h-3 w-3 mr-1" />
                                )}
                                {verification.role}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>📧 {verification.applicantEmail}</p>
                              <p>🆔 License: {verification.licenseNumber}</p>
                              {verification.specialty && <p>🏥 Specialty: {verification.specialty}</p>}
                              <p>📄 Documents: {verification.documents.join(', ')}</p>
                              <p>📅 Submitted: {new Date(verification.submittedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(verification.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(verification.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No pending verifications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  All License Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verifications.map((verification) => (
                    <div key={verification.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{verification.applicantName}</span>
                          <Badge variant={verification.role === 'DOCTOR' ? 'default' : 'secondary'}>
                            {verification.role}
                          </Badge>
                          <Badge 
                            variant={
                              verification.status === 'APPROVED' ? 'default' :
                              verification.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }
                          >
                            {verification.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          License: {verification.licenseNumber} | {verification.applicantEmail}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(verification.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}