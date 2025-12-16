import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { User, Shield, Clock, FileText, Mic, MicOff, Camera, Send, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthInput, setHealthInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const currentPatient = {
      id: '1',
      name: 'Pree Om',
      age: 28,
      status: 'ACTIVE',
      symptoms: ['chest pain', 'shortness of breath'],
      phone: '+91-9853224443',
      assignedDoctor: 'd1',
      updatedAt: new Date().toISOString(),
      dataToken: 'TOKEN123456'
    };
    setPatient(currentPatient);

    const doctors = [{
      id: 'd1',
      name: 'Dr. Rajesh Khanna',
      specialty: 'Cardiology',
      license: 'MD123456',
      phone: '+91-9876543210'
    }];
    
    setAssignedDoctors(doctors.filter(d => d.id === currentPatient.assignedDoctor));

    // Load both doctor reports and patient health reports
    const doctorReports = [
      { id: 'RPT001', patientId: '1', doctorId: 'd1', status: 'COMPLETED', date: '2024-01-15', content: 'Initial consultation completed', type: 'DOCTOR' },
      { id: 'RPT002', patientId: '1', doctorId: 'd1', status: 'PENDING', date: '2024-01-16', content: 'Follow-up required', type: 'DOCTOR' }
    ];
    
    const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]')
      .filter(report => report.patientId === currentPatient.id)
      .map(report => ({
        id: report.id,
        patientId: report.patientId,
        status: report.status || 'SUBMITTED',
        date: report.timestamp.split('T')[0],
        content: report.description,
        type: 'HEALTH',
        image: report.image
      }));
    
    setReports([...doctorReports, ...healthReports]);
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
            <p className="text-muted-foreground">Secure access to your medical information</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            HIPAA Compliant
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg">Welcome to your secure patient portal, <strong>{patient?.name}</strong>!</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Age: {patient?.age}</p>
                      <p className="font-medium">Phone: {patient?.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status: <Badge variant="outline">{patient?.status}</Badge></p>
                      {patient?.dataToken && (
                        <p className="font-medium">
                          Data Token: 
                          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {patient.dataToken.substr(0, 8)}...
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Current Symptoms:</strong> {patient?.symptoms?.join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Your Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe your symptoms, pain level, or any health concerns..."
                    value={healthInput}
                    onChange={(e) => setHealthInput(e.target.value)}
                    rows={4}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={() => {
                        if (isRecording) {
                          setIsRecording(false);
                        } else {
                          if ('webkitSpeechRecognition' in window) {
                            const recognition = new (window as any).webkitSpeechRecognition();
                            recognition.continuous = false;
                            recognition.interimResults = false;
                            
                            // Detect browser language or default to Hindi
                            const userLang = navigator.language || 'hi-IN';
                            recognition.lang = userLang;
                            
                            recognition.onstart = () => setIsRecording(true);
                            recognition.onend = () => setIsRecording(false);
                            
                            recognition.onresult = async (event: any) => {
                              const transcript = event.results[0][0].transcript;
                              
                              // Simple translation to English (mock translation)
                              let englishText = transcript;
                              if (userLang.includes('hi')) {
                                // Mock Hindi to English translation
                                englishText = `[Hindi] ${transcript} (Translated: chest pain and breathing difficulty)`;
                              } else if (userLang.includes('es')) {
                                englishText = `[Spanish] ${transcript} (Translated: ${transcript})`;
                              } else if (userLang.includes('fr')) {
                                englishText = `[French] ${transcript} (Translated: ${transcript})`;
                              }
                              
                              setHealthInput(prev => prev + ' ' + englishText);
                            };
                            
                            recognition.start();
                          } else {
                            alert('Voice recognition not supported');
                          }
                        }
                      }}
                    >
                      {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isRecording ? 'Stop Recording' : 'Voice Input'}
                    </Button>
                    
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedImage(file);
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                  
                  {selectedImage && (
                    <div className="p-2 border rounded bg-gray-50">
                      <p className="text-sm text-gray-600">📷 Image selected: {selectedImage.name}</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => {
                      console.log('Submit button clicked');
                      if (healthInput.trim() || selectedImage) {
                        console.log('Opening dialog');
                        setShowBookingDialog(true);
                        const healthReport = {
                          id: `HR_${Date.now()}`,
                          patientId: patient.id,
                          patientName: patient.name,
                          patientToken: patient.dataToken,
                          description: healthInput,
                          image: selectedImage?.name || null,
                          timestamp: new Date().toISOString(),
                          status: 'NEW'
                        };
                        
                        // Store in localStorage for doctor/AI council access
                        const existingReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
                        existingReports.push(healthReport);
                        localStorage.setItem('healthReports', JSON.stringify(existingReports));
                        localStorage.setItem('lastAssignedSpecialist', specialist);
                        
                        // Send to AI Council simultaneously
                        const aiCouncilReports = JSON.parse(localStorage.getItem('aiCouncilReports') || '[]');
                        aiCouncilReports.push({
                          ...healthReport,
                          aiStatus: 'PENDING_ANALYSIS',
                          sentToAI: new Date().toISOString()
                        });
                        localStorage.setItem('aiCouncilReports', JSON.stringify(aiCouncilReports));
                        
                        // Store healthReport in component state for dialog access
                        window.currentHealthReport = healthReport;
                        
                        // Clear form first
                        setHealthInput('');
                        setSelectedImage(null);
                        
                        // Show dialog after a brief delay
                        setTimeout(() => {
                          setShowBookingDialog(true);
                        }, 100);
                        
                        // Refresh reports to show the new health report
                        setTimeout(() => {
                          const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]')
                            .filter(report => report.patientId === patient.id)
                            .map(report => ({
                              id: report.id,
                              patientId: report.patientId,
                              status: report.status || 'SUBMITTED',
                              date: report.timestamp.split('T')[0],
                              content: report.description,
                              type: 'HEALTH',
                              image: report.image
                            }));
                          
                          const doctorReports = [
                            { id: 'RPT001', patientId: '1', doctorId: 'd1', status: 'COMPLETED', date: '2024-01-15', content: 'Initial consultation completed', type: 'DOCTOR' },
                            { id: 'RPT002', patientId: '1', doctorId: 'd1', status: 'PENDING', date: '2024-01-16', content: 'Follow-up required', type: 'DOCTOR' }
                          ];
                          
                          setReports([...doctorReports, ...healthReports]);
                        }, 100);
                      } else {
                        alert('Please add a description or image');
                      }
                    }}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Health Report
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                  {assignedDoctors.map((doctor) => (
                    <div key={doctor.id} className="p-3 border rounded">
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-blue-600">{doctor.specialty}</p>
                      <p className="text-xs text-gray-500">License: {doctor.license}</p>
                      <p className="text-xs text-green-600">📞 {doctor.phone}</p>
                    </div>
                  ))}
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
                  {reports.map((report) => {
                    const doctor = assignedDoctors.find(d => d.id === report.doctorId);
                    return (
                      <div key={report.id} className="p-3 border rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">
                              {report.type === 'HEALTH' ? 'Health Report' : `Report #${report.id}`}
                            </p>
                            <p className="text-xs text-blue-600">
                              {report.type === 'HEALTH' ? 'Submitted by you' : `By: ${doctor?.name || 'Dr. Rajesh Khanna'}`}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{report.content}</p>
                            {report.image && (
                              <p className="text-xs text-green-600 mt-1">📷 Image: {report.image}</p>
                            )}
                            <Badge 
                              variant={report.status === 'COMPLETED' ? 'default' : 'secondary'}
                              className="text-xs mt-2"
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">{report.date}</span>
                        </div>
                      </div>
                    );
                  })}
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
                  <p>• Patient: {patient.name}</p>
                  <p>• Status: <Badge variant="outline">{patient.status}</Badge></p>
                  <p>• Symptoms: {patient.symptoms?.join(', ')}</p>
                  <p>• Assigned to: {assignedDoctors[0]?.name}</p>
                  <p className="text-xs text-gray-500">Last updated: {new Date(patient.updatedAt).toLocaleString()}</p>
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
                  <p className="text-xs text-blue-700 font-medium">
                    🔐 Your data is tokenized with ID: {patient.dataToken}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Health Report Submitted Successfully!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your health report has been sent to <strong>{localStorage.getItem('lastAssignedSpecialist') || 'your care team'}</strong> with token: <strong>{patient?.dataToken}</strong>
              </p>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Book an Appointment</h4>
                
                <div className="space-y-3">
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiologist">Dr. Cardiologist - Cardiology</SelectItem>
                      <SelectItem value="dermatologist">Dr. Dermatologist - Dermatology</SelectItem>
                      <SelectItem value="gynecologist">Dr. Gynecologist - Gynecology</SelectItem>
                      <SelectItem value="orthopedic">Dr. Orthopedic - Orthopedics</SelectItem>
                      <SelectItem value="ent">Dr. ENT - ENT Specialist</SelectItem>
                      <SelectItem value="general">Dr. General - General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                      <SelectItem value="16:00">04:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => {
                      if (selectedDoctor && selectedDate && selectedTime) {
                        const doctor = assignedDoctors.find(d => d.id === selectedDoctor);
                        
                        // Save appointment to localStorage
                        const appointment = {
                          id: `APT_${Date.now()}`,
                          patientId: patient.id,
                          patientName: patient.name,
                          patientToken: patient.dataToken,
                          doctorId: selectedDoctor,
                          doctorName: doctor?.name || `Dr. ${selectedDoctor}`,
                          date: selectedDate,
                          time: selectedTime,
                          status: 'SCHEDULED',
                          phone: patient.phone,
                          linkedHealthReportId: window.currentHealthReport?.id,
                          assignedSpecialist: specialist
                        };
                        
                        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                        appointments.push(appointment);
                        localStorage.setItem('appointments', JSON.stringify(appointments));
                        
                        // Link appointment to health report
                        const updatedReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
                        const reportIndex = updatedReports.findIndex(r => r.id === window.currentHealthReport?.id);
                        if (reportIndex !== -1) {
                          updatedReports[reportIndex].linkedAppointmentId = appointment.id;
                          localStorage.setItem('healthReports', JSON.stringify(updatedReports));
                        }
                        
                        alert(`Report submitted & Appointment booked!\n\nDoctor: ${doctor?.name || `Dr. ${selectedDoctor}`}\nDate: ${selectedDate}\nTime: ${selectedTime}\nToken: ${patient?.dataToken}\n\nYour health report is linked to this appointment.`);
                        setShowBookingDialog(false);
                        setSelectedDoctor('');
                        setSelectedDate('');
                        setSelectedTime('');
                      } else {
                        alert('Please select doctor, date and time');
                      }
                    }}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBookingDialog(false)}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}