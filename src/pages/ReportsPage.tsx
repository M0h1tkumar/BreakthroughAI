import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Search, Download, Eye, Calendar, Plus } from 'lucide-react';
import { secureDB } from '@/lib/secureDatabase';

export default function ReportsPage() {
  const [reports, setReports] = useState(secureDB.getReports());
  const [patients] = useState(secureDB.getPatients());
  const [doctors] = useState(secureDB.getDoctors());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState(reports);

  useEffect(() => {
    setReports(secureDB.getReports());
    setFilteredReports(secureDB.getReports());
  }, []);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Unknown Doctor';
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = reports.filter(report => 
        getPatientName(report.patientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDoctorName(report.doctorId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  };

  const viewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const patient = getPatientName(report.patientId);
      const doctor = getDoctorName(report.doctorId);
      
      alert(`MEDICAL REPORT\n\nReport ID: ${report.id}\nPatient: ${patient}\nDoctor: ${doctor}\nDate: ${report.date}\nStatus: ${report.status}\n\n--- CONTENT ---\n${report.content}\n\n--- COMPLIANCE ---\nThis report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.`);
    }
  };

  const downloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const patient = getPatientName(report.patientId);
      const doctor = getDoctorName(report.doctorId);
      
      const content = `MEDICAL REPORT\n\nReport ID: ${report.id}\nPatient: ${patient}\nDoctor: ${doctor}\nDate: ${report.date}\nStatus: ${report.status}\n\n--- CONTENT ---\n${report.content}\n\n--- COMPLIANCE DISCLAIMER ---\nThis report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.\n\nGenerated on: ${new Date().toLocaleString()}`;
      
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `medical_report_${reportId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const generateNewReport = () => {
    const availablePatients = patients.filter(p => p.status === 'PENDING');
    
    if (availablePatients.length === 0) {
      alert('No pending patients available for new reports');
      return;
    }

    const patientList = availablePatients.map((p, idx) => `${idx + 1}. ${p.name} (${p.symptoms.join(', ')})`).join('\n');
    const selection = prompt(`Select a patient for new report:\n\n${patientList}\n\nEnter patient number:`);
    
    const patientIndex = parseInt(selection || '0') - 1;
    if (patientIndex >= 0 && patientIndex < availablePatients.length) {
      const selectedPatient = availablePatients[patientIndex];
      
      const newReport = secureDB.addReport({
        patientId: selectedPatient.id,
        doctorId: 'd1', // Default doctor
        content: `New Medical Report\n\nPatient: ${selectedPatient.name}\nAge: ${selectedPatient.age}\nSymptoms: ${selectedPatient.symptoms.join(', ')}\n\nAssessment:\n[To be completed by doctor]\n\nDiagnosis:\n[To be completed by doctor]\n\nTreatment Plan:\n[To be completed by doctor]`,
        status: 'DRAFT',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Update patient status
      secureDB.updatePatientStatus(selectedPatient.id, 'UNDER_REVIEW', 'd1');
      
      alert(`New report created successfully! Report ID: ${newReport.id}`);
      setReports(secureDB.getReports());
      setFilteredReports(secureDB.getReports());
    } else {
      alert('Invalid selection');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Medical Reports</h1>
            <p className="text-muted-foreground">View and manage all patient reports</p>
          </div>
          <Button onClick={generateNewReport}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Reports ({filteredReports.length})
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search reports, patients, doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{getPatientName(report.patientId)}</h3>
                      <Badge variant={
                        report.status === 'DOCTOR_APPROVED' ? 'default' :
                        report.status === 'AI_ASSISTED' ? 'secondary' :
                        report.status === 'DRAFT' ? 'outline' : 'destructive'
                      }>
                        {report.status.replace('_', ' ')}
                      </Badge>
                      {report.approvedAt && (
                        <Badge variant="outline" className="text-green-600">
                          LOCKED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Doctor: {getDoctorName(report.doctorId)} | {report.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      <span>Report ID: {report.id}</span>
                      {report.approvedAt && (
                        <span>Approved: {new Date(report.approvedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewReport(report.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadReport(report.id)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reports found</p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setFilteredReports(reports);
                    }} className="mt-2">
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
              </div>
              <p className="text-sm text-gray-600">New reports generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {reports.filter(r => r.status === 'DRAFT' || r.status === 'AI_ASSISTED').length}
              </div>
              <p className="text-sm text-gray-600">Awaiting doctor approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approved Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'DOCTOR_APPROVED').length}
              </div>
              <p className="text-sm text-gray-600">Doctor approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
              <p className="text-sm text-gray-600">All patient reports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}