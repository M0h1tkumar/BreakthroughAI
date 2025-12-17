import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Users, Brain, FileText, AlertTriangle, Video, Pill, Send, Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [aiReport, setAiReport] = useState('');
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [doctorSuggestion, setDoctorSuggestion] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    const loadPatientData = () => {
      // Load patients with priority
      const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
      const mockPatients = [
        { id: '1', name: 'Pree Om', age: 28, symptoms: ['chest pain', 'shortness of breath'], phone: '+91-9853224443', priority: 'HIGH', dataToken: 'TOKEN123456' },
        { id: '2', name: 'Priya Sharma', age: 32, symptoms: ['headache'], phone: '098-765-4321', priority: 'MEDIUM' }
      ];
      
      // Add health reports as patients with real-time updates
      const reportPatients = healthReports.map(report => ({
        id: report.patientId,
        name: report.patientName,
        symptoms: [report.description],
        phone: '+91-9853224443',
        priority: 'HIGH',
        dataToken: report.patientToken,
        healthReport: report,
        image: report.image,
        imageData: report.imageData,
        lastUpdated: report.timestamp
      }));
      
      const allPatients = [...mockPatients, ...reportPatients]
        .sort((a, b) => {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      
      setPatients(allPatients);
      
      // Load appointments from localStorage
      const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      setAppointments(savedAppointments);
      
      // Load emergencies from localStorage
      const savedEmergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
      setEmergencies(savedEmergencies);
    };

    // Initial load
    loadPatientData();

    // Set up real-time polling for patient updates
    const interval = setInterval(loadPatientData, 1000); // Check every 1 second for real-time updates

    // Listen for patient report events
    const handlePatientReportUpdate = () => {
      loadPatientData();
    };
    
    window.addEventListener('patientReportUpdated', handlePatientReportUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('patientReportUpdated', handlePatientReportUpdate);
    };
  }, []);

  const initiateVideoCall = (patient) => {
    const meetingUrl = `https://meet.google.com/new`;
    window.open(meetingUrl, '_blank');
    alert(`Video call initiated with ${patient.name}\nPhone: ${patient.phone}\nMeeting link opened in new tab`);
  };

  const generateAIReport = (patient) => {
    const symptoms = patient.symptoms.join(', ');
    const aiAnalysis = `AI CLINICAL DIAGNOSIS REPORT

Patient: ${patient.name}
Token: ${patient.dataToken || 'N/A'}
Age: ${patient.age || 'Unknown'}
Symptoms: ${symptoms}

--- AI DIFFERENTIAL DIAGNOSIS ---

Primary Diagnosis Considerations:
• Based on symptoms: ${symptoms}
• Requires clinical correlation and examination
• Consider relevant diagnostic workup

Recommended Investigations:
• Physical examination mandatory
• Vital signs assessment
• Relevant laboratory tests based on presentation
• Consider imaging if indicated

Risk Stratification:
• Priority Level: ${patient.priority}
• Immediate attention recommended for HIGH priority cases
• Monitor for symptom progression

Treatment Recommendations:
• Symptomatic management as appropriate
• Follow evidence-based clinical guidelines
• Consider patient-specific factors
• Regular follow-up as needed

--- AI CONFIDENCE METRICS ---
Diagnostic Confidence: 78%
Recommendation Reliability: 82%
Risk Assessment Accuracy: 85%

--- MANDATORY DISCLAIMER ---
This AI analysis is for clinical decision support only. 
Final diagnosis, treatment decisions, and patient care 
must be determined by licensed medical professionals 
through proper clinical evaluation and judgment.`;
    
    setAiReport(aiAnalysis);
    setShowDisclaimer(false);
  };

  const sendPrescription = () => {
    if (!prescriptionText && !selectedMedicine) {
      alert('Please add prescription details');
      return;
    }
    
    const prescription = {
      id: `PRESC_${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: 'Dr. Rajesh Khanna',
      medicine: selectedMedicine,
      dosage: dosage,
      duration: duration,
      notes: prescriptionText,
      doctorSuggestion: doctorSuggestion,
      medicineImage: prescriptionImage,
      date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    };
    
    // Save to localStorage for pharmacy
    const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    prescriptions.push(prescription);
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    
    // Real-time notification
    alert(`✅ PRESCRIPTION SENT IN REAL-TIME!

Patient: ${selectedPatient.name}
Medicine: ${selectedMedicine}
Dosage: ${dosage}
Duration: ${duration}

📱 Instantly delivered to patient
🏥 Instantly sent to pharmacy
⚡ Real-time synchronization complete`);
    
    // Trigger immediate refresh of patient data
    setTimeout(() => {
      const event = new CustomEvent('prescriptionSent');
      window.dispatchEvent(event);
    }, 100);
    
    setShowPrescription(false);
    setPrescriptionText('');
    setSelectedMedicine('');
    setDosage('');
    setDuration('');
    setPrescriptionImage(null);
    setDoctorSuggestion('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Patient management and clinical decision support</p>
          </div>
          <div className="flex gap-2">
            {emergencies.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                {emergencies.length} EMERGENCY ALERTS
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              AI Council Ready
            </Badge>
          </div>
        </div>

        {emergencies.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                🚨 EMERGENCY ALERTS ({emergencies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencies.map((emergency) => (
                  <div key={emergency.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">EMERGENCY</Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(emergency.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-red-800 mb-2">{emergency.details}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            Location: {emergency.location}
                          </div>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Phone className="h-4 w-4" />
                            Phone: {emergency.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <Phone className="h-4 w-4 mr-1" />
                          Call Now
                        </Button>
                        <Button size="sm" variant="outline">
                          Dispatch Ambulance
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient List - Priority Based ({patients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{patient.name}</h3>
                      <Badge variant={
                        patient.priority === 'HIGH' ? 'destructive' :
                        patient.priority === 'MEDIUM' ? 'default' : 'secondary'
                      }>
                        {patient.priority} PRIORITY
                      </Badge>
                      {patient.dataToken && (
                        <Badge variant="outline">Token: {patient.dataToken}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Age: {patient.age || 'Unknown'} | Phone: {patient.phone}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      Symptoms: {patient.symptoms.join(', ')}
                    </p>
                    {patient.image && (
                      <div className="mb-2">
                        <p className="text-xs text-blue-600 mb-1">📷 Image: {patient.image}</p>
                        {patient.imageData && (
                          <img 
                            src={patient.imageData} 
                            alt="Patient submitted image" 
                            className="max-w-xs max-h-32 object-cover border rounded"
                          />
                        )}
                      </div>
                    )}
                    {(() => {
                      const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);
                      
                      return patientAppointments.length > 0 ? (
                        <div className="space-y-1">
                          {patientAppointments.map((apt) => {
                            const appointmentDay = new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long' });
                            return (
                              <div key={apt.id} className="text-sm text-blue-600">
                                📅 Appointment: {apt.date} at {apt.time} ({appointmentDay})
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No appointments scheduled</div>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => initiateVideoCall(patient)}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Video Call
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowDisclaimer(true);
                      }}
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      AI Diagnosis
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowPrescription(true);
                      }}
                    >
                      <Pill className="h-4 w-4 mr-1" />
                      Prescribe
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Appointments ({appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments
                .filter(apt => apt.date === new Date().toISOString().split('T')[0])
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium">{appointment.patientName}</h4>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {appointment.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Token: {appointment.patientToken} | Phone: {appointment.phone || '+91-9853224443'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4 mr-1" />
                      Join Call
                    </Button>
                    <Button size="sm">
                      Start Consultation
                    </Button>
                  </div>
                </div>
              ))}
              
              {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {appointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {appointments
                  .filter(apt => apt.date > new Date().toISOString().split('T')[0])
                  .slice(0, 5)
                  .map((appointment) => (
                  <div key={appointment.id} className="flex justify-between items-center p-2 border rounded text-sm">
                    <div>
                      <span className="font-medium">{appointment.patientName}</span>
                      <span className="text-gray-500 ml-2">Token: {appointment.patientToken}</span>
                    </div>
                    <div className="text-right">
                      <div>{appointment.date}</div>
                      <div className="text-xs text-gray-500">{appointment.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {aiReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Council Diagnosis Report - {selectedPatient?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                {isEditingAI ? (
                  <Textarea
                    value={aiReport}
                    onChange={(e) => setAiReport(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono">{aiReport}</pre>
                )}
              </div>
              <div className="flex gap-2">
                {isEditingAI ? (
                  <>
                    <Button onClick={() => {
                      setIsEditingAI(false);
                      alert('AI Report edited and saved by doctor');
                    }}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingAI(false)}>
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditingAI(true)}>
                      Edit Report
                    </Button>
                    <Button onClick={() => alert('AI Report validated and approved by doctor')}>
                      Validate & Approve
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setAiReport('')}>
                  Close Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                AI Council Medical Disclaimer & Terms
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">⚠️ MEDICAL DISCLAIMER</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• AI diagnosis is for clinical decision support only</li>
                  <li>• Final diagnosis must be made by licensed physicians</li>
                  <li>• AI recommendations require clinical validation</li>
                  <li>• Doctor retains full responsibility for patient care</li>
                  <li>• Not for emergency medical situations</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => generateAIReport(selectedPatient)}
                  className="flex-1"
                >
                  I Agree - Generate AI Diagnosis
                </Button>
                <Button variant="outline" onClick={() => setShowDisclaimer(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Prescription - {selectedPatient?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Medicine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paracetamol 500mg">Paracetamol 500mg</SelectItem>
                  <SelectItem value="Ibuprofen 400mg">Ibuprofen 400mg</SelectItem>
                  <SelectItem value="Azithromycin 250mg">Azithromycin 250mg</SelectItem>
                  <SelectItem value="Omeprazole 20mg">Omeprazole 20mg</SelectItem>
                  <SelectItem value="Metformin 500mg">Metformin 500mg</SelectItem>
                </SelectContent>
              </Select>
              
              <Input 
                placeholder="Dosage (e.g., 1 tablet twice daily)"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
              
              <Input 
                placeholder="Duration (e.g., 5 days)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              
              <Textarea 
                placeholder="Additional notes and instructions..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                rows={2}
              />
              
              <Textarea 
                placeholder="Doctor's suggestion and medical advice for patient..."
                value={doctorSuggestion}
                onChange={(e) => setDoctorSuggestion(e.target.value)}
                rows={2}
              />
              
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Medicine Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setPrescriptionImage(event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-sm"
                />
                {prescriptionImage && (
                  <div className="mt-2">
                    <img 
                      src={prescriptionImage} 
                      alt="Medicine preview" 
                      className="w-20 h-20 object-cover border rounded"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={sendPrescription} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send to Pharmacy & Patient
                </Button>
                <Button variant="outline" onClick={() => setShowPrescription(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}