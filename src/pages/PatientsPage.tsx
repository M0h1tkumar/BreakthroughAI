import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Phone, Calendar, FileText, Eye, Edit } from 'lucide-react';
import { secureDB } from '@/lib/secureDatabase';
import { tokenizationService } from '@/lib/dataTokenization';
import { ToastService } from '@/components/ui/toast-notification';
import { authService } from '@/lib/auth';

export default function PatientsPage() {
  const [patients, setPatients] = useState(secureDB.getPatients());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    if (!authService.isDoctor()) {
      window.location.href = '/login';
    }
    refreshPatients();
  }, []);

  const refreshPatients = () => {
    const allPatients = secureDB.getPatients();
    setPatients(allPatients);
    setFilteredPatients(allPatients);
  };

  const handleSearch = () => {
    let filtered = patients;
    
    if (searchTerm.trim()) {
      filtered = secureDB.searchPatients(searchTerm);
    }
    
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    setFilteredPatients(filtered);
    ToastService.show(`Found ${filtered.length} patients`, 'info');
  };

  const viewPatientDetails = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    let details = `PATIENT DETAILS\n\n`;
    details += `Name: ${patient.name}\n`;
    details += `Age: ${patient.age}\n`;
    details += `Phone: ${patient.phone}\n`;
    details += `Status: ${patient.status}\n`;
    details += `Symptoms: ${patient.symptoms.join(', ')}\n`;
    details += `Reports: ${patient.reports.length}\n`;
    details += `Created: ${new Date(patient.createdAt).toLocaleString()}\n`;
    
    if (patient.dataToken) {
      details += `\n🔐 TOKENIZED DATA:\n`;
      details += `Token: ${patient.dataToken}\n`;
      details += `Assigned Doctor: ${patient.assignedDoctor}\n`;
      
      const tokenData = tokenizationService.getTokenizedData(patient.dataToken);
      if (tokenData) {
        details += `Tokenized: ${tokenData.timestamp}\n`;
      }
    }

    alert(details);
  };

  const assignToDoctor = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const doctors = secureDB.getDoctors();
    const doctorList = doctors.map((d, idx) => `${idx + 1}. ${d.name} (${d.specialty})`).join('\n');
    
    const selection = prompt(`Assign patient to doctor:\n\n${doctorList}\n\nEnter doctor number:`);
    const doctorIndex = parseInt(selection || '0') - 1;
    
    if (doctorIndex >= 0 && doctorIndex < doctors.length) {
      const selectedDoctor = doctors[doctorIndex];
      secureDB.updatePatientStatus(patientId, 'UNDER_REVIEW', selectedDoctor.id);
      ToastService.show(`Patient assigned to ${selectedDoctor.name}`, 'success');
      refreshPatients();
    }
  };

  const updatePatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newName = prompt('Update patient name:', patient.name);
    if (!newName || newName === patient.name) return;

    const newPhone = prompt('Update patient phone:', patient.phone);
    if (!newPhone || newPhone === patient.phone) return;

    const newSymptoms = prompt('Update symptoms (comma-separated):', patient.symptoms.join(', '));
    if (!newSymptoms) return;

    const updates = {
      name: newName.trim(),
      phone: newPhone.trim(),
      symptoms: newSymptoms.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };

    const updatedPatient = secureDB.updatePatient(patientId, updates);
    if (updatedPatient) {
      ToastService.show(`Patient ${updatedPatient.name} updated successfully!`, 'success');
      refreshPatients();
    } else {
      ToastService.show('Failed to update patient', 'error');
    }
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
                  onChange={(e) => setSelectedStatus(e.target.value)}
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
                      {patient.assignedDoctor && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Assigned: {secureDB.getDoctors().find(d => d.id === patient.assignedDoctor)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewPatientDetails(patient.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updatePatient(patient.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                    {patient.status === 'PENDING' && (
                      <Button size="sm" onClick={() => assignToDoctor(patient.id)}>
                        Assign Doctor
                      </Button>
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

        <div className="grid gap-6 lg:grid-cols-3">
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
        </div>
      </div>
    </DashboardLayout>
  );
}