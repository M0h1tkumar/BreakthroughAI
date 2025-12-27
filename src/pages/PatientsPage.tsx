import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Phone, Calendar, FileText, Eye, Edit, CheckCircle, XCircle, Download } from 'lucide-react';
import { dataService } from '@/lib/dataService';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [appointments, setAppointments] = useState([]);
  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [selectedPatientForCase, setSelectedPatientForCase] = useState(null);
  const [showPatientDetailsDialog, setShowPatientDetailsDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assignedDoctors, setAssignedDoctors] = useState({});

  useEffect(() => {
    refreshPatients();
    
    // Listen for real-time updates
    const handlePatientsUpdate = (event: any) => {
      setPatients(event.detail);
      setFilteredPatients(event.detail);
    };
    
    const handleAppointmentsUpdate = (event: any) => {
      setAppointments(event.detail);
    };
    
    const handleDoctorAssignmentsUpdate = (event: any) => {
      setAssignedDoctors(event.detail);
    };
    
    window.addEventListener('patientsUpdated', handlePatientsUpdate);
    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdate);
    window.addEventListener('doctorAssignmentsUpdated', handleDoctorAssignmentsUpdate);
    
    return () => {
      window.removeEventListener('patientsUpdated', handlePatientsUpdate);
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdate);
      window.removeEventListener('doctorAssignmentsUpdated', handleDoctorAssignmentsUpdate);
    };
  }, []);

  useEffect(() => {
    handleSearch();
  }, [selectedStatus, searchTerm, patients]);

  const refreshPatients = () => {
    // Use centralized data service
    const allPatients = dataService.getPatients();
    setPatients(allPatients);
    setFilteredPatients(allPatients);
    
    const savedAppointments = dataService.getAppointments();
    setAppointments(savedAppointments);
    
    const savedAssignments = dataService.getAssignedDoctors();
    setAssignedDoctors(savedAssignments);
  };

  const handleSearch = () => {
    let filtered = patients;
    
    if (searchTerm.trim()) {
      filtered = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    setFilteredPatients(filtered);
  };

  const viewPatientDetails = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      alert('Patient not found');
      return;
    }

    setSelectedPatientForCase(patient);
    setShowPatientDetailsDialog(true);
  };

  const downloadPatientImage = (imageUrl: string, patientName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${patientName}_medical_image.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const assignToDoctor = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setSelectedPatientForCase(patient);
    setShowAssignDialog(true);
  };

  const handleDoctorAssignment = () => {
    if (!selectedDoctor || !selectedPatientForCase) return;
    
    // Use centralized data service
    dataService.assignDoctor(selectedPatientForCase.id, selectedDoctor);
    
    alert(`Patient ${selectedPatientForCase.name} assigned to ${selectedDoctor}`);
    setShowAssignDialog(false);
    setSelectedDoctor('');
    setSelectedPatientForCase(null);
  };

  const updatePatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setSelectedPatientForCase(patient);
    setShowCaseDialog(true);
  };

  const approveCase = () => {
    if (!selectedPatientForCase) return;
    
    // Use centralized data service to update patient status
    dataService.updatePatient(selectedPatientForCase.id, { status: 'UNDER_REVIEW' });
    
    alert(`✅ CASE APPROVED\n\nPatient: ${selectedPatientForCase.name}\nStatus: Changed to Under Review\nDate: ${new Date().toLocaleDateString()}`);
    setShowCaseDialog(false);
    setSelectedPatientForCase(null);
  };

  const closeCase = () => {
    if (!selectedPatientForCase) return;
    
    // Use centralized data service to remove patient
    dataService.removePatient(selectedPatientForCase.id);
    
    alert(`❌ CASE CLOSED\n\nPatient: ${selectedPatientForCase.name}\nStatus: Case Deleted\nDate: ${new Date().toLocaleDateString()}`);
    setShowCaseDialog(false);
    setSelectedPatientForCase(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Management</h1>
            <p className="text-muted-foreground">Manage all patients and their medical records</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {filteredPatients.length} Patients
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Patients
              </CardTitle>
              <div className="flex gap-2">
                <select 
                  value={selectedStatus} 
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    handleSearch();
                  }}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <Input
                  placeholder="Search patients..."
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
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{patient.name}</h3>
                      <Badge variant={
                        patient.status === 'COMPLETED' ? 'default' :
                        patient.status === 'UNDER_REVIEW' ? 'secondary' : 'outline'
                      }>
                        {patient.status.replace('_', ' ')}
                      </Badge>
                      {patient.dataToken && (
                        <Badge variant="outline" className="text-blue-600">
                          🔐 {patient.dataToken.substr(0, 8)}...
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Symptoms: {patient.symptoms.join(', ')}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {patient.reports.length} Reports
                      </span>
                    </div>
                    {(() => {
                      const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);
                      return patientAppointments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {patientAppointments.map((apt) => (
                            <div key={apt.id} className="text-sm text-blue-600">
                              📅 Appointment: {apt.date} at {apt.time}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewPatientDetails(patient.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updatePatient(patient.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Manage Case
                    </Button>
                    {patient.status === 'PENDING' && !assignedDoctors[patient.id] && (
                      <Button size="sm" onClick={() => assignToDoctor(patient.id)}>
                        Assign Doctor
                      </Button>
                    )}
                    {assignedDoctors[patient.id] && (
                      <div className="text-sm">
                        <Badge variant="default" className="bg-green-600">
                          ✓ Doctor Assigned
                        </Badge>
                        <p className="text-xs text-green-700 mt-1">
                          {assignedDoctors[patient.id]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No patients found</p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('ALL');
                      refreshPatients();
                    }} className="mt-2">
                      Clear Filters
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
              <CardTitle>Pending Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {patients.filter(p => p.status === 'PENDING').length}
              </div>
              <p className="text-sm text-gray-600">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {patients.filter(p => p.status === 'UNDER_REVIEW').length}
              </div>
              <p className="text-sm text-gray-600">Being reviewed by doctors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patients.filter(p => p.status === 'COMPLETED').length}
              </div>
              <p className="text-sm text-gray-600">Treatment completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nearby Pharmacies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-blue-600">Apollo Pharmacy</div>
                  <div className="text-sm text-gray-600">Near ITER Campus, Bhubaneswar</div>
                  <div className="text-sm text-gray-600">Phone: 9876543300</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">MedPlus Pharmacy</div>
                  <div className="text-sm text-gray-600">Near SUM Hospital, Kalinga Nagar</div>
                  <div className="text-sm text-gray-600">Phone: 9876543301</div>
                </div>
                <div>
                  <div className="font-medium text-orange-600">Care Pharmacy</div>
                  <div className="text-sm text-gray-600">ITER Road, Siksha O Anusandhan</div>
                  <div className="text-sm text-gray-600">Phone: 9876543302</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showPatientDetailsDialog} onOpenChange={setShowPatientDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Details - {selectedPatientForCase?.name || 'Loading...'}</DialogTitle>
            </DialogHeader>
            {selectedPatientForCase ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {selectedPatientForCase.name}</p>
                      <p><strong>Age:</strong> {selectedPatientForCase.age}</p>
                      <p><strong>Phone:</strong> {selectedPatientForCase.phone}</p>
                    </div>
                    <div>
                      <p><strong>Status:</strong> {selectedPatientForCase.status}</p>
                      <p><strong>Token:</strong> {selectedPatientForCase.dataToken || 'N/A'}</p>
                      <p><strong>Created:</strong> {new Date(selectedPatientForCase.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Symptoms & Description</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Symptoms:</strong> {selectedPatientForCase.symptoms.join(', ')}
                  </p>
                  {selectedPatientForCase.reports && selectedPatientForCase.reports.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <strong>Detailed Description:</strong> {selectedPatientForCase.reports[0].content || selectedPatientForCase.reports[0].description}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedPatientForCase.reports && selectedPatientForCase.reports.some(r => r.image || r.imageData) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-green-800">Medical Images</h4>
                    <div className="space-y-3">
                      {selectedPatientForCase.reports.map((report, index) => (
                        (report.image || report.imageData) && (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                            <div className="flex items-center gap-3">
                              {report.imageData && (
                                <img 
                                  src={report.imageData} 
                                  alt="Patient medical image" 
                                  className="w-16 h-16 object-cover border rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">{report.image || 'Medical Image'}</p>
                                <p className="text-xs text-gray-500">Submitted with health report</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (report.imageData) {
                                  downloadPatientImage(report.imageData, selectedPatientForCase.name);
                                } else {
                                  alert('Image download not available');
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      setShowPatientDetailsDialog(false);
                      setShowCaseDialog(true);
                    }}
                    className="flex-1"
                  >
                    Manage Case
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPatientDetailsDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Loading patient details...</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Doctor</DialogTitle>
            </DialogHeader>
            {selectedPatientForCase && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-medium text-blue-800">{selectedPatientForCase.name}</p>
                  <p className="text-sm text-blue-600">Symptoms: {selectedPatientForCase.symptoms.join(', ')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Specialist Doctor</label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose doctor by specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Rajesh Kumar - Cardiologist">Dr. Rajesh Kumar - Cardiologist</SelectItem>
                      <SelectItem value="Dr. Priya Sharma - Dermatologist">Dr. Priya Sharma - Dermatologist</SelectItem>
                      <SelectItem value="Dr. Amit Singh - Orthopedic">Dr. Amit Singh - Orthopedic</SelectItem>
                      <SelectItem value="Dr. Sunita Patel - Gynecologist">Dr. Sunita Patel - Gynecologist</SelectItem>
                      <SelectItem value="Dr. Ravi Gupta - ENT Specialist">Dr. Ravi Gupta - ENT Specialist</SelectItem>
                      <SelectItem value="Dr. Meera Joshi - Ophthalmologist">Dr. Meera Joshi - Ophthalmologist</SelectItem>
                      <SelectItem value="Dr. Vikram Rao - Neurologist">Dr. Vikram Rao - Neurologist</SelectItem>
                      <SelectItem value="Dr. Kavita Nair - General Medicine">Dr. Kavita Nair - General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDoctorAssignment}
                    className="flex-1"
                    disabled={!selectedDoctor}
                  >
                    Assign Doctor
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAssignDialog(false);
                      setSelectedDoctor('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Patient Case</DialogTitle>
            </DialogHeader>
            {selectedPatientForCase && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-medium text-blue-800">{selectedPatientForCase.name}</p>
                  <p className="text-sm text-blue-600">Age: {selectedPatientForCase.age} | Phone: {selectedPatientForCase.phone}</p>
                  <p className="text-sm text-blue-600">Symptoms: {selectedPatientForCase.symptoms.join(', ')}</p>
                  <p className="text-sm text-blue-600">Status: {selectedPatientForCase.status}</p>
                </div>
                
                <div className="text-sm text-gray-600">
                  Choose an action for this patient case:
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={approveCase}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Case
                  </Button>
                  <Button 
                    onClick={closeCase}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Case
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowCaseDialog(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}