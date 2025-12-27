import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Download, Eye, Calendar, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dataService } from '@/lib/dataService';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newReport, setNewReport] = useState({
    reportId: '',
    patientName: '',
    date: '',
    status: 'DRAFT',
    doctor: '',
    approvedDate: '',
    reportContent: '',
    medicalDisclaimer: 'This report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.'
  });

  useEffect(() => {
    // Load reports from localStorage and mock data
    const savedReports = JSON.parse(localStorage.getItem('medicalReports') || '[]');
    const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
    const mockReports = [
      {
        id: 'RPT001',
        patientId: '1',
        patientName: 'Pree Om',
        doctorId: 'd1',
        doctorName: 'Dr. Rajesh Khanna',
        content: 'Patient presented with chest pain and shortness of breath. ECG shows normal sinus rhythm. Recommended follow-up in 2 weeks.',
        status: 'DOCTOR_APPROVED',
        date: '2024-01-15',
        approvedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: 'RPT002',
        patientId: '2',
        patientName: 'Jane Smith',
        content: 'Headache and fatigue symptoms. Blood pressure elevated. Prescribed medication and lifestyle changes.',
        doctorName: 'Dr. Priya Malhotra',
        status: 'DRAFT',
        date: '2024-01-16'
      }
    ];

    // Convert health reports to report format
    const convertedHealthReports = healthReports.map(hr => ({
      id: hr.id,
      patientId: hr.patientId,
      patientName: hr.patientName,
      doctorName: 'Pending Assignment',
      content: hr.description,
      status: 'SUBMITTED',
      date: hr.timestamp.split('T')[0],
      type: 'HEALTH_REPORT',
      image: hr.image
    }));

    const allReports = [...savedReports, ...mockReports, ...convertedHealthReports];
    setReports(allReports);
    setFilteredReports(allReports);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = reports.filter(report => 
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  };

  const createNewReport = () => {
    if (!newReport.reportId || !newReport.patientName || !newReport.date || !newReport.doctor || !newReport.reportContent) {
      alert('Please fill all required fields');
      return;
    }

    // Check if patient exists by matching report ID or patient name
    const patients = dataService.getPatients();
    const matchingPatient = patients.find(p => 
      p.id === newReport.reportId || 
      p.name.toLowerCase() === newReport.patientName.toLowerCase()
    );

    if (!matchingPatient) {
      alert(`❌ ERROR: No patient found matching Report ID "${newReport.reportId}" or Patient Name "${newReport.patientName}".\n\nPlease verify the patient exists in the system first.`);
      return;
    }

    const report = {
      id: newReport.reportId,
      patientId: matchingPatient.id,
      patientName: newReport.patientName,
      doctorName: newReport.doctor,
      content: newReport.reportContent,
      status: newReport.status,
      date: newReport.date,
      approvedAt: newReport.approvedDate ? new Date(newReport.approvedDate).toISOString() : null,
      medicalDisclaimer: newReport.medicalDisclaimer,
      createdAt: new Date().toISOString()
    };

    // Add report to patient's records
    const updatedPatient = {
      ...matchingPatient,
      reports: [...(matchingPatient.reports || []), report]
    };
    dataService.updatePatient(matchingPatient.id, updatedPatient);

    const updatedReports = [report, ...reports];
    setReports(updatedReports);
    setFilteredReports(updatedReports);
    
    // Save to localStorage for persistence
    const existingReports = JSON.parse(localStorage.getItem('medicalReports') || '[]');
    existingReports.unshift(report);
    localStorage.setItem('medicalReports', JSON.stringify(existingReports));

    alert(`✅ REPORT CREATED & LINKED\n\nReport ID: ${report.id}\nPatient: ${report.patientName}\nStatus: ${report.status}\nLinked to Patient ID: ${matchingPatient.id}`);
    
    setShowCreateDialog(false);
    setNewReport({
      reportId: '',
      patientName: '',
      date: '',
      status: 'DRAFT',
      doctor: '',
      approvedDate: '',
      reportContent: '',
      medicalDisclaimer: 'This report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.'
    });
  };

  const viewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setShowReportDialog(true);
    }
  };

  const downloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const content = `MEDICAL REPORT\n\nReport ID: ${report.id}\nPatient: ${report.patientName}\nDoctor: ${report.doctorName}\nDate: ${report.date}\nStatus: ${report.status}\n\n--- CONTENT ---\n${report.content}\n\n${report.image ? `Image: ${report.image}\n\n` : ''}--- COMPLIANCE DISCLAIMER ---\nThis report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.\n\nGenerated on: ${new Date().toLocaleString()}`;
      
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `medical_report_${reportId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
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
          <Button onClick={() => setShowCreateDialog(true)}>
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
                      <h3 className="font-medium">{report.patientName}</h3>
                      <Badge variant={
                        report.status === 'DOCTOR_APPROVED' ? 'default' :
                        report.status === 'SUBMITTED' ? 'secondary' :
                        report.status === 'DRAFT' ? 'outline' : 'destructive'
                      }>
                        {report.status.replace('_', ' ')}
                      </Badge>
                      {report.type === 'HEALTH_REPORT' && (
                        <Badge variant="outline" className="text-blue-600">
                          PATIENT REPORT
                        </Badge>
                      )}
                      {report.approvedAt && (
                        <Badge variant="outline" className="text-green-600">
                          LOCKED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Doctor: {report.doctorName} | {report.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      <span>Report ID: {report.id}</span>
                      {report.image && <span>📷 Image attached</span>}
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

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Medical Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report ID *</label>
                  <Input 
                    value={newReport.reportId}
                    onChange={(e) => setNewReport({...newReport, reportId: e.target.value})}
                    placeholder="RPT001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Patient Name *</label>
                  <Input 
                    value={newReport.patientName}
                    onChange={(e) => setNewReport({...newReport, patientName: e.target.value})}
                    placeholder="Patient full name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date *</label>
                  <Input 
                    type="date"
                    value={newReport.date}
                    onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={newReport.status} onValueChange={(value) => setNewReport({...newReport, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="DOCTOR_APPROVED">Doctor Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Doctor *</label>
                  <Select value={newReport.doctor} onValueChange={(value) => setNewReport({...newReport, doctor: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Rajesh Kumar - Cardiologist">Dr. Rajesh Kumar - Cardiologist</SelectItem>
                      <SelectItem value="Dr. Priya Sharma - Dermatologist">Dr. Priya Sharma - Dermatologist</SelectItem>
                      <SelectItem value="Dr. Amit Singh - Orthopedic">Dr. Amit Singh - Orthopedic</SelectItem>
                      <SelectItem value="Dr. Sunita Patel - Gynecologist">Dr. Sunita Patel - Gynecologist</SelectItem>
                      <SelectItem value="Dr. Ravi Gupta - ENT Specialist">Dr. Ravi Gupta - ENT Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Approved Date</label>
                  <Input 
                    type="date"
                    value={newReport.approvedDate}
                    onChange={(e) => setNewReport({...newReport, approvedDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Report Content *</label>
                <Textarea 
                  value={newReport.reportContent}
                  onChange={(e) => setNewReport({...newReport, reportContent: e.target.value})}
                  placeholder="Enter detailed medical report content..."
                  rows={6}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Medical Disclaimer</label>
                <Textarea 
                  value={newReport.medicalDisclaimer}
                  onChange={(e) => setNewReport({...newReport, medicalDisclaimer: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createNewReport} className="flex-1">
                  Create Report
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Medical Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Report ID:</strong> {selectedReport.id}</p>
                      <p><strong>Patient:</strong> {selectedReport.patientName}</p>
                      <p><strong>Doctor:</strong> {selectedReport.doctorName}</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {selectedReport.date}</p>
                      <p><strong>Status:</strong> 
                        <Badge className="ml-2" variant={
                          selectedReport.status === 'DOCTOR_APPROVED' ? 'default' :
                          selectedReport.status === 'SUBMITTED' ? 'secondary' : 'outline'
                        }>
                          {selectedReport.status.replace('_', ' ')}
                        </Badge>
                      </p>
                      {selectedReport.approvedAt && (
                        <p><strong>Approved:</strong> {new Date(selectedReport.approvedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Report Content</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedReport.content}
                  </div>
                </div>
                
                {selectedReport.image && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-green-800">Attached Image</h4>
                    <p className="text-sm text-green-700">📷 {selectedReport.image}</p>
                  </div>
                )}
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-800 font-medium">⚠️ MEDICAL DISCLAIMER</p>
                  <p className="text-xs text-orange-700 mt-1">
                    This report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => downloadReport(selectedReport.id)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReportDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}