import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PatientPortal } from '@/components/medical/PatientPortal';
import { ComplianceAlert } from '@/components/medical/ComplianceAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Clock, FileText } from 'lucide-react';
import { secureDB } from '@/lib/secureDatabase';

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current patient (Pree Om)
    const currentPatient = secureDB.getPatients().find(p => p.name === 'Pree Om');
    setPatient(currentPatient);

    if (currentPatient) {
      // Get assigned doctors
      const doctors = secureDB.getDoctors();
      const patientDoctors = currentPatient.assignedDoctor 
        ? doctors.filter(d => d.id === currentPatient.assignedDoctor)
        : [];
      setAssignedDoctors(patientDoctors);

      // Get patient reports
      const patientReports = secureDB.getAllReports().filter(r => r.patientId === currentPatient.id);
      setReports(patientReports);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Portal</h1>
            <p className="text-muted-foreground">
              Secure access to your medical information
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            HIPAA Compliant
          </Badge>
        </div>

        <ComplianceAlert type="patient_privacy" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PatientPortal />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Care Team ({assignedDoctors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignedDoctors.length > 0 ? (
                    assignedDoctors.map((doctor) => (
                      <div key={doctor.id} className="p-3 border rounded">
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-blue-600">{doctor.specialty}</p>
                        <p className="text-xs text-gray-500">License: {doctor.license}</p>
                        <p className="text-xs text-green-600">📞 {doctor.phone}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 border rounded bg-gray-50">
                      <p className="text-sm text-gray-600">No doctor assigned yet</p>
                      <p className="text-xs text-gray-500">A doctor will be assigned based on your symptoms</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Reports ({reports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.length > 0 ? (
                    reports.slice(0, 3).map((report) => {
                      const doctor = secureDB.getDoctors().find(d => d.id === report.doctorId);
                      return (
                        <div key={report.id} className="p-2 border rounded text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">Report #{report.id}</p>
                              <p className="text-xs text-blue-600">By: {doctor?.name}</p>
                              <Badge 
                                variant={report.status === 'LOCKED' ? 'default' : 'secondary'}
                                className="text-xs mt-1"
                              >
                                {report.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">{report.date}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 border rounded bg-gray-50">
                      <p className="text-sm text-gray-600">No reports available yet</p>
                      <p className="text-xs text-gray-500">Reports will appear here after doctor consultation</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {patient ? (
                    <>
                      <p>• Patient: {patient.name}</p>
                      <p>• Status: <Badge variant="outline">{patient.status}</Badge></p>
                      <p>• Symptoms: {patient.symptoms.join(', ')}</p>
                      {patient.assignedDoctor && (
                        <p>• Assigned to: {assignedDoctors[0]?.name}</p>
                      )}
                      <p className="text-xs text-gray-500">Last updated: {new Date(patient.updatedAt).toLocaleString()}</p>
                    </>
                  ) : (
                    <p>• No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto" />
                  <h3 className="font-medium">Privacy Protected</h3>
                  <p className="text-xs text-gray-600">
                    Your data is encrypted and only accessible to your authorized care team.
                    No AI systems have direct access to your information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}