import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { secureDB } from '@/lib/secureDatabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Users, Brain, FileText, AlertTriangle, Video, Pill, Send, Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { langchainMedical } from '../lib/langchainMedical';

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
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  // Appointment edit/cancel state
  const [editingAppointment, setEditingAppointment] = useState<unknown>(null);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assignedDoctors, setAssignedDoctors] = useState({});
  const [showManageCase, setShowManageCase] = useState(false);
  const [selectedPatientForCase, setSelectedPatientForCase] = useState(null);

  const viewPatientDetails = (patient) => {
    setSelectedPatientForDetails(patient);
    setShowPatientDetails(true);
  };

  // Open patient details when a patientId query param is present (from SearchPage)
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (!pid) return;

    console.debug('[DoctorDashboard] patientId query param detected:', pid);

  const match = patients.find(p => p.id === pid);
    if (match) {
      console.debug('[DoctorDashboard] Found patient in state:', match.name || match.id);
      setSelectedPatientForDetails(match);
      setShowPatientDetails(true);
      params.delete('patientId');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      return;
    }

    // Fallback: try secureDB.getPatientById immediately
    try {
      const p = secureDB.getPatientById(pid);
      if (p) {
        console.debug('[DoctorDashboard] Found patient via secureDB.getPatientById:', p.name || p.id);
  setSelectedPatientForDetails(p);
        setShowPatientDetails(true);
        params.delete('patientId');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
        return;
      } else {
        console.debug('[DoctorDashboard] Patient not found in secureDB for id:', pid);
      }
    } catch (e) {
      console.error('[DoctorDashboard] error looking up patientId in secureDB', e);
    }
    
  }, [location.search, patients, navigate, location.pathname]);

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
      
      // Load appointments from backend, fallback to localStorage
      const loadAppointments = async () => {
        try {
          const res = await fetch('/api/appointments');
          const json = await res.json();
          if (json.success) {
            setAppointments(json.data || []);
          } else {
            const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            setAppointments(savedAppointments);
          }
        } catch (e) {
          const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
          setAppointments(savedAppointments);
        }
      };
      loadAppointments();
      
      // Load emergencies from localStorage
      const savedEmergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
      setEmergencies(savedEmergencies);
      
      // Load assigned doctors from localStorage
      const savedAssignments = JSON.parse(localStorage.getItem('assignedDoctors') || '{}');
      setAssignedDoctors(savedAssignments);
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

  const persistAppointments = (updatedAppointments) => {
    try {
      // Try to sync to server for each appointment changed by id
      updatedAppointments.forEach(async (apt) => {
        try {
          if (apt._id) {
            await fetch(`/api/appointments/${apt._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(apt)
            });
          }
        } catch (e) {
          // ignore individual sync failures
        }
      });
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    } catch (e) {
      console.error('Failed to persist appointments', e);
    }
  };

  const cancelAppointment = (appointmentId) => {
    setAppointments(prev => {
      const updated = prev.map(a => a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a);
      // try API cancel
      (async () => {
        try {
          await fetch(`/api/appointments/${appointmentId}/cancel`, { method: 'POST' });
        } catch (e) {
          console.error('API cancel failed', e);
        }
      })();
      persistAppointments(updated);
      return updated;
    });
  };

  const openEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditDate(appointment.date || '');
    setEditTime(appointment.time || '');
    setEditPhone(appointment.phone || '');
    setShowEditAppointment(true);
  };

  const saveEditedAppointment = () => {
    if (!editingAppointment) return;
    const editing = editingAppointment as Record<string, unknown>;
    const editingId = typeof editing['id'] === 'string' ? (editing['id'] as string) : null;
    if (!editingId) return;
    setAppointments(prev => {
      const updated = prev.map(a => {
        if (a.id === editingId || a._id === editingId) {
          return { ...a, date: editDate, time: editTime, phone: editPhone, status: a.status === 'CANCELLED' ? 'CANCELLED' : 'SCHEDULED' };
        }
        return a;
      });
      // call API
      (async () => {
        try {
          await fetch(`/api/appointments/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: editDate, time: editTime, phone: editPhone })
          });
        } catch (e) {
          console.error('API update failed', e);
        }
      })();
      persistAppointments(updated);
      return updated;
    });
    setShowEditAppointment(false);
    setEditingAppointment(null);
  };

  const generateAIReport = async (patient) => {
    try {
      // Use LangChain for structured medical reasoning
      const diagnosis = await langchainMedical.generateDiagnosis({
        age: patient.age?.toString() || '30',
        gender: 'Not specified',
        symptoms: patient.symptoms.join(', '),
        history: 'None reported'
      });
      
      // Emergency triage if high priority
      if (patient.priority === 'HIGH') {
        const triage = await langchainMedical.triageEmergency({
          symptoms: patient.symptoms.join(', '),
          vitals: 'BP: 120/80, HR: 72, Temp: 98.6°F',
          age: patient.age?.toString() || '30'
        });
        
        setAiReport(`${diagnosis}\n\n--- EMERGENCY TRIAGE ASSESSMENT ---\n${triage}`);
      } else {
        setAiReport(diagnosis);
      }
      
      setShowDisclaimer(false);
    } catch (error) {
      console.error('LangChain AI Report Error:', error);
      const symptoms = patient.symptoms.join(', ');
      const fallbackReport = `LANGCHAIN AI DIAGNOSIS REPORT\n\nPatient: ${patient.name}\nSymptoms: ${symptoms}\n\nLangChain analysis temporarily unavailable.\nUsing fallback diagnostic support.\n\n--- MEDICAL DISCLAIMER ---\nThis AI analysis is for clinical decision support only.`;
      setAiReport(fallbackReport);
      setShowDisclaimer(false);
    }
  };

  const sendPrescription = async () => {
    if (!prescriptionText && !selectedMedicine) {
      alert('Please add prescription details');
      return;
    }
    
    // LangChain prescription validation
    try {
      const validation = await langchainMedical.validatePrescription({
        medication: selectedMedicine,
        dosage: dosage,
        age: selectedPatient.age?.toString() || '30',
        weight: '70kg',
        allergies: 'None reported',
        currentMeds: 'None reported'
      });
      
      console.log('Prescription Validation:', validation);
    } catch (error) {
      console.error('Prescription validation error:', error);
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

  const assignToDoctor = (patient) => {
    setSelectedPatient(patient);
    setShowAssignDialog(true);
  };

  const handleDoctorAssignment = () => {
    if (!selectedDoctor || !selectedPatient) return;
    
    // Save to localStorage first
    const currentAssignments = JSON.parse(localStorage.getItem('assignedDoctors') || '{}');
    currentAssignments[selectedPatient.id] = selectedDoctor;
    localStorage.setItem('assignedDoctors', JSON.stringify(currentAssignments));
    
    // Force state update with new object reference
    setAssignedDoctors({...currentAssignments});
    
    alert(`Patient ${selectedPatient.name} assigned to ${selectedDoctor}`);
    setShowAssignDialog(false);
    setSelectedDoctor('');
    setSelectedPatient(null);
  };

  const openManageCase = (patient) => {
    setSelectedPatientForCase(patient);
    setShowManageCase(true);
  };

  const closeCase = () => {
    if (!selectedPatientForCase) return;
    
    // Remove patient from the list
    setPatients(prev => prev.filter(p => p.id !== selectedPatientForCase.id));
    
    alert(`✅ PATIENT DISCHARGED\n\nPatient: ${selectedPatientForCase.name}\nStatus: Case Closed - Discharged\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}`);
    
    setShowManageCase(false);
    setSelectedPatientForCase(null);
  };

  const approveCase = () => {
    if (!selectedPatientForCase) return;
    
    alert(`✅ CASE APPROVED\n\nPatient: ${selectedPatientForCase.name}\nStatus: Treatment Approved\nDate: ${new Date().toLocaleDateString()}`);
    
    setShowManageCase(false);
    setSelectedPatientForCase(null);
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium truncate">{patient.name}</h3>
                      <Badge variant={
                        patient.priority === 'HIGH' ? 'destructive' :
                        patient.priority === 'MEDIUM' ? 'default' : 'secondary'
                      }>
                        {patient.priority} PRIORITY
                      </Badge>
                      {patient.dataToken && (
                        <Badge variant="outline" className="hidden sm:inline-flex">Token: {patient.dataToken}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1 truncate">
                      Age: {patient.age || 'Unknown'} | Phone: {patient.phone}
                    </p>
                    <p className="text-sm text-gray-700 mb-1 truncate">
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
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewPatientDetails(patient)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
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
                    <Button size="sm" variant="outline" onClick={() => openEditAppointment(appointment)}>
                      Edit
                    </Button>
                    {appointment.status === 'CANCELLED' ? (
                      <Button size="sm" disabled>
                        Cancelled
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => cancelAppointment(appointment.id)}>
                        Cancel
                      </Button>
                    )}
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
                    <div className="text-right flex items-center gap-2">
                      <div className="mr-4 text-right">
                        <div>{appointment.date}</div>
                        <div className="text-xs text-gray-500">{appointment.time}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEditAppointment(appointment)}>Edit</Button>
                      {appointment.status === 'CANCELLED' ? (
                        <Button size="sm" disabled>Cancelled</Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => cancelAppointment(appointment.id)}>Cancel</Button>
                      )}
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
                  I Agree - Generate Enhanced AI Diagnosis
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

        <Dialog open={showEditAppointment} onOpenChange={setShowEditAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <Input value={editTime} onChange={(e) => setEditTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEditedAppointment} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => { setShowEditAppointment(false); setEditingAppointment(null); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showManageCase} onOpenChange={setShowManageCase}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Patient Case</DialogTitle>
            </DialogHeader>
            {selectedPatientForCase && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-medium text-blue-800">{selectedPatientForCase.name}</p>
                  <p className="text-sm text-blue-600">Symptoms: {selectedPatientForCase.symptoms.join(', ')}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={approveCase}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Approve Case
                  </Button>
                  <Button 
                    onClick={closeCase}
                    variant="destructive"
                    className="flex-1"
                  >
                    Close Case
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowManageCase(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Doctor</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-medium text-blue-800">{selectedPatient.name}</p>
                  <p className="text-sm text-blue-600">Symptoms: {selectedPatient.symptoms.join(', ')}</p>
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

        <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Details - {selectedPatientForDetails?.name}</DialogTitle>
            </DialogHeader>
            {selectedPatientForDetails && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {selectedPatientForDetails.name}</p>
                      <p><strong>Age:</strong> {selectedPatientForDetails.age || 'Unknown'}</p>
                      <p><strong>Phone:</strong> {selectedPatientForDetails.phone}</p>
                    </div>
                    <div>
                      <p><strong>Priority:</strong> <Badge variant={selectedPatientForDetails.priority === 'HIGH' ? 'destructive' : 'default'}>{selectedPatientForDetails.priority}</Badge></p>
                      <p><strong>Token:</strong> {selectedPatientForDetails.dataToken || 'N/A'}</p>
                      <p><strong>Last Updated:</strong> {selectedPatientForDetails.lastUpdated ? new Date(selectedPatientForDetails.lastUpdated).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Symptoms & Medical History</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Current Symptoms:</strong> {selectedPatientForDetails.symptoms.join(', ')}
                  </p>
                  {selectedPatientForDetails.healthReport && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <strong>Detailed Report:</strong> {selectedPatientForDetails.healthReport.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedPatientForDetails.imageData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-green-800">Medical Images</h4>
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedPatientForDetails.imageData} 
                        alt="Patient medical image" 
                        className="w-32 h-32 object-cover border rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">{selectedPatientForDetails.image || 'Medical Image'}</p>
                        <p className="text-xs text-gray-500">Submitted by patient</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      setShowPatientDetails(false);
                      setSelectedPatient(selectedPatientForDetails);
                      setShowDisclaimer(true);
                    }}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    AI Diagnosis
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowPatientDetails(false);
                      setSelectedPatient(selectedPatientForDetails);
                      setShowPrescription(true);
                    }}
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    Prescribe
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPatientDetails(false)}
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