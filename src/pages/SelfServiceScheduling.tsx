import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Send, Bell } from 'lucide-react';

export default function SelfServiceScheduling() {
  const [appointment, setAppointment] = useState({
    patientName: '',
    phone: '',
    visitType: '',
    date: '',
    time: '',
    symptoms: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const generateSlots = (date, visitType) => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of ['00', '30']) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute}`;
        slots.push({
          time: timeSlot,
          doctor: getAssignedDoctor(visitType)
        });
      }
    }
    return slots.slice(0, 8);
  };

  const getAssignedDoctor = (visitType) => {
    const doctors = {
      'Primary Care': 'Dr. Rajesh Kumar - General Medicine',
      'Weight Loss': 'Dr. Priya Sharma - Endocrinology',
      'Pain Management': 'Dr. Amit Singh - Pain Medicine',
      'Cardiology': 'Dr. Rajesh Kumar - Cardiologist',
      'Dermatology': 'Dr. Priya Sharma - Dermatologist'
    };
    return doctors[visitType] || 'Dr. Rajesh Kumar - General Medicine';
  };

  const handleDateChange = (date) => {
    setAppointment(prev => ({ ...prev, date }));
    if (date && appointment.visitType) {
      setAvailableSlots(generateSlots(date, appointment.visitType));
    }
  };

  const scheduleAppointment = () => {
    if (!appointment.patientName || !appointment.phone || !appointment.date || !appointment.time) {
      alert('Please fill all required fields');
      return;
    }

    const newAppointment = {
      id: `APT_${Date.now()}`,
      patientId: `P_${Date.now()}`,
      patientName: appointment.patientName,
      patientToken: `TOKEN${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      doctorName: getAssignedDoctor(appointment.visitType),
      date: appointment.date,
      time: appointment.time,
      visitType: appointment.visitType,
      phone: appointment.phone,
      symptoms: appointment.symptoms,
      status: 'SCHEDULED',
      assignedSpecialist: appointment.visitType,
      bookedAt: new Date().toISOString()
    };

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Setup automated reminders
    setupReminders(newAppointment);
    
    setShowConfirmation(true);
  };

  const setupReminders = (apt) => {
    const aptDateTime = new Date(`${apt.date}T${apt.time}`);
    const now = new Date();
    
    // 24-hour reminder
    const reminder24h = aptDateTime.getTime() - (24 * 60 * 60 * 1000);
    if (reminder24h > now.getTime()) {
      setTimeout(() => {
        sendReminder(apt, '24-hour');
      }, reminder24h - now.getTime());
    }
    
    // 2-hour reminder
    const reminder2h = aptDateTime.getTime() - (2 * 60 * 60 * 1000);
    if (reminder2h > now.getTime()) {
      setTimeout(() => {
        sendReminder(apt, '2-hour');
      }, reminder2h - now.getTime());
    }
  };

  const sendReminder = (apt, type) => {
    const messages = {
      '24-hour': `🏥 Appointment tomorrow at ${apt.time} with ${apt.doctorName}. Please arrive 15 minutes early.`,
      '2-hour': `⏰ Your appointment is in 2 hours at ${apt.time}. Location: Swasth AI Clinic.`
    };
    
    console.log(`📱 SMS to ${apt.phone}: ${messages[type]}`);
    
    if (Notification.permission === 'granted') {
      new Notification('Appointment Reminder', {
        body: messages[type],
        icon: '/favicon.ico'
      });
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800">Appointment Scheduled!</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <p className="text-sm"><strong>Patient:</strong> {appointment.patientName}</p>
                <p className="text-sm"><strong>Date:</strong> {appointment.date}</p>
                <p className="text-sm"><strong>Time:</strong> {appointment.time}</p>
                <p className="text-sm"><strong>Doctor:</strong> {getAssignedDoctor(appointment.visitType)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800 mb-2">📱 Automated Reminders Set:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 24-hour reminder via SMS</li>
                  <li>• 2-hour reminder with location</li>
                </ul>
              </div>
              <Button onClick={() => window.location.href = '/patient-dashboard'} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Self-Service Appointment Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800">🏥 Smart Scheduling System</p>
            <p className="text-xs text-blue-700">AI automatically assigns you to the right specialist based on your visit type.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Patient Name *</label>
              <Input 
                value={appointment.patientName}
                onChange={(e) => setAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number *</label>
              <Input 
                value={appointment.phone}
                onChange={(e) => setAppointment(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91-9876543210"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Visit Type *</label>
            <Select 
              value={appointment.visitType} 
              onValueChange={(value) => {
                setAppointment(prev => ({ ...prev, visitType: value }));
                if (appointment.date) {
                  setAvailableSlots(generateSlots(appointment.date, value));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary Care">Primary Care Consultation</SelectItem>
                <SelectItem value="Weight Loss">Weight Loss Management</SelectItem>
                <SelectItem value="Pain Management">Pain Management</SelectItem>
                <SelectItem value="Cardiology">Cardiology Consultation</SelectItem>
                <SelectItem value="Dermatology">Dermatology Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Preferred Date *</label>
              <Input 
                type="date"
                value={appointment.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Available Time Slots</label>
              <Select 
                value={appointment.time} 
                onValueChange={(value) => setAppointment(prev => ({ ...prev, time: value }))}
                disabled={!appointment.date || !appointment.visitType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      {slot.time} - {slot.doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Symptoms/Reason for Visit</label>
            <Input 
              value={appointment.symptoms}
              onChange={(e) => setAppointment(prev => ({ ...prev, symptoms: e.target.value }))}
              placeholder="Brief description of symptoms"
            />
          </div>
          
          {appointment.visitType && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800">
                🎯 Assigned: {getAssignedDoctor(appointment.visitType)}
              </p>
            </div>
          )}
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 mb-2">📱 Automated Reminders:</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• 24-hour reminder via SMS</li>
              <li>• 2-hour reminder with location</li>
              <li>• Instant confirmation with token</li>
            </ul>
          </div>
          
          <Button 
            onClick={scheduleAppointment}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}