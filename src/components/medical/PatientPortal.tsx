import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Clock } from 'lucide-react';
import { secureDB } from '@/lib/secureDatabase';
import { tokenizationService } from '@/lib/dataTokenization';
import { ToastService } from '@/components/ui/toast-notification';

export function PatientPortal() {
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      ToastService.show('Please enter your symptoms', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const patientData = {
        name: 'New Patient ' + Date.now(),
        age: 30,
        phone: '9853224433', // Using the test number
        symptoms: symptoms.split(',').map(s => s.trim()),
        medicalHistory: medicalHistory,
        reports: [],
        status: 'PENDING' as const
      };
      
      // Tokenize sensitive data
      const token = tokenizationService.tokenizePatientData(patientData);
      const assignedDoctor = tokenizationService.getAssignedDoctor(token);
      
      // Add patient to database with tokenized reference
      const newPatient = secureDB.addPatient({
        ...patientData,
        assignedDoctor,
        dataToken: token
      });
      
      const doctorName = secureDB.getDoctors().find(d => d.id === assignedDoctor)?.name || 'Available Doctor';
      
      ToastService.show(
        `Data submitted successfully! Assigned to: ${doctorName}. Token: ${token.substr(0, 12)}...`, 
        'success', 
        8000
      );
      
      setSymptoms('');
      setMedicalHistory('');
    } catch (error) {
      ToastService.show('Error submitting information. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewReport = (reportId: string) => {
    alert(`Viewing report ${reportId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Symptoms</label>
            <Textarea 
              placeholder="Describe your symptoms in detail..."
              className="mt-1"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Medical History</label>
            <Textarea 
              placeholder="Previous conditions, medications, allergies..."
              className="mt-1"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Upload Reports</label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop medical reports
              </p>
              <Input type="file" className="mt-2" accept=".pdf,.jpg,.png" />
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Information'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Medical Report - Jan 15, 2024</p>
                <p className="text-sm text-gray-600">Dr. Smith - General Consultation</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => viewReport('r1')}>
                View Report
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Lab Results - Jan 10, 2024</p>
                <p className="text-sm text-gray-600">Dr. Johnson - Blood Work</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => viewReport('r2')}>
                View Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your submitted information is being reviewed by Dr. Chen. 
            You will receive a notification when the review is complete.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}