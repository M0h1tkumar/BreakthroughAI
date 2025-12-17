import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, User, Calendar, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PharmacyPatientPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    // Load prescriptions from localStorage
    const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    
    // Mock prescriptions with doctor suggestions and medicine images
    const mockPrescriptions = [
      {
        id: 'PRESC_001',
        patientName: 'Pree Om',
        doctorName: 'Dr. Rajesh Khanna',
        medicine: 'Paracetamol 500mg',
        dosage: '1 tablet twice daily',
        duration: '5 days',
        notes: 'Take after meals. Avoid alcohol consumption.',
        date: '2024-01-15',
        status: 'ACTIVE',
        doctorSuggestion: 'Patient has mild fever and body ache. Paracetamol will help reduce fever and provide pain relief. Monitor temperature and contact if fever persists beyond 3 days.',
        medicineImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBhcmFjZXRhbW9sIDUwMG1nPC90ZXh0Pjwvc3ZnPg=='
      },
      {
        id: 'PRESC_002',
        patientName: 'Pree Om',
        doctorName: 'Dr. Rajesh Khanna',
        medicine: 'Omeprazole 20mg',
        dosage: '1 capsule once daily',
        duration: '10 days',
        notes: 'Take 30 minutes before breakfast on empty stomach.',
        date: '2024-01-16',
        status: 'ACTIVE',
        doctorSuggestion: 'Patient reported acidity and stomach discomfort. Omeprazole will reduce stomach acid production and provide relief from gastric symptoms. Take consistently for best results.',
        medicineImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9tZXByYXpvbGUgMjBtZzwvdGV4dD48L3N2Zz4='
      }
    ];

    const allPrescriptions = [...savedPrescriptions, ...mockPrescriptions];
    setPrescriptions(allPrescriptions);
  }, []);

  const viewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDialog(true);
  };

  const downloadPrescription = (prescription) => {
    const content = `PRESCRIPTION\n\nPatient: ${prescription.patientName}\nDoctor: ${prescription.doctorName}\nDate: ${prescription.date}\n\nMedicine: ${prescription.medicine}\nDosage: ${prescription.dosage}\nDuration: ${prescription.duration}\n\nDoctor's Notes: ${prescription.notes}\n\nDoctor's Suggestion:\n${prescription.doctorSuggestion}\n\nGenerated on: ${new Date().toLocaleString()}`;
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `prescription_${prescription.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Prescriptions</h1>
            <p className="text-muted-foreground">View doctor prescriptions and medicine details</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Pill className="h-4 w-4" />
            {prescriptions.length} Prescriptions
          </Badge>
        </div>

        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    {prescription.medicine}
                  </CardTitle>
                  <Badge variant={prescription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {prescription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Prescribed by: <strong>{prescription.doctorName}</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Date: {prescription.date}</span>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <h4 className="font-medium text-blue-800 mb-2">Dosage Instructions</h4>
                        <p className="text-sm text-blue-700"><strong>Dosage:</strong> {prescription.dosage}</p>
                        <p className="text-sm text-blue-700"><strong>Duration:</strong> {prescription.duration}</p>
                        <p className="text-sm text-blue-700"><strong>Notes:</strong> {prescription.notes}</p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <h4 className="font-medium text-green-800 mb-2">Doctor's Suggestion</h4>
                        <p className="text-sm text-green-700">{prescription.doctorSuggestion}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-gray-50 border rounded p-3 w-full">
                      <h4 className="font-medium text-gray-800 mb-2 text-center">Medicine Image</h4>
                      <img 
                        src={prescription.medicineImage} 
                        alt={prescription.medicine}
                        className="w-full h-24 object-cover border rounded"
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => viewPrescription(prescription)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => downloadPrescription(prescription)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {prescriptions.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prescriptions available</p>
                  <p className="text-sm">Prescriptions from your doctor will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Medicine:</strong> {selectedPrescription.medicine}</p>
                      <p><strong>Patient:</strong> {selectedPrescription.patientName}</p>
                      <p><strong>Doctor:</strong> {selectedPrescription.doctorName}</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {selectedPrescription.date}</p>
                      <p><strong>Status:</strong> 
                        <Badge className="ml-2" variant={selectedPrescription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {selectedPrescription.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Medicine Image</h4>
                    <img 
                      src={selectedPrescription.medicineImage} 
                      alt={selectedPrescription.medicine}
                      className="w-full h-32 object-cover border rounded"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <h4 className="font-medium text-blue-800 mb-2">Dosage Instructions</h4>
                      <p className="text-sm text-blue-700"><strong>Dosage:</strong> {selectedPrescription.dosage}</p>
                      <p className="text-sm text-blue-700"><strong>Duration:</strong> {selectedPrescription.duration}</p>
                      <p className="text-sm text-blue-700"><strong>Notes:</strong> {selectedPrescription.notes}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Doctor's Suggestion & Advice</h4>
                  <p className="text-sm text-green-700">{selectedPrescription.doctorSuggestion}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => downloadPrescription(selectedPrescription)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Prescription
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPrescriptionDialog(false)}
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