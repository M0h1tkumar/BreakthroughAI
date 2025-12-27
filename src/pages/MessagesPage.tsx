import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mic, MicOff, Camera, Send, Calendar, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MessagesPage() {
  const [healthInput, setHealthInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  const patient = {
    id: '1',
    name: 'Pree Om',
    dataToken: 'TOKEN123456'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = navigator.language || 'en-US';
        
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setHealthInput(prev => prev + ' ' + transcript);
        };
        
        recognition.start();
      } else {
        alert('Voice recognition not supported');
      }
    }
  };

  const handleSubmit = () => {
    if (!healthInput.trim() && !selectedImage) {
      alert('Please add a description or image');
      return;
    }

    const healthReport = {
      id: `HR_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientToken: patient.dataToken,
      description: healthInput,
      image: selectedImage?.name || null,
      imageData: imagePreview,
      timestamp: new Date().toISOString(),
      status: 'NEW'
    };

    // Store in localStorage
    const existingReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
    existingReports.push(healthReport);
    localStorage.setItem('healthReports', JSON.stringify(existingReports));

    // Basic specialist routing
    let specialist = 'General Medicine';
    const symptoms = healthInput.toLowerCase();
    if (symptoms.includes('heart') || symptoms.includes('chest')) specialist = 'Cardiology';
    else if (symptoms.includes('skin') || symptoms.includes('rash')) specialist = 'Dermatology';
    else if (symptoms.includes('bone') || symptoms.includes('joint')) specialist = 'Orthopedics';
    else if (symptoms.includes('stomach') || symptoms.includes('digest')) specialist = 'Gastroenterology';
    
    localStorage.setItem('lastAssignedSpecialist', specialist);

    // Store for global access
    window.currentHealthReport = healthReport;

    // Clear form and show success
    setHealthInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditing(false);
    setShowBookingDialog(true);
  };

  const handleEditAgain = () => {
    setIsEditing(true);
    setShowBookingDialog(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Health Messages</h1>
            <p className="text-muted-foreground">Report your symptoms and health concerns</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Secure Messaging
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Report Your Health Status</span>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEditAgain}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Again
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Describe Your Symptoms</h3>
                  <Textarea
                    placeholder="Describe your symptoms, pain level, or any health concerns in detail..."
                    value={healthInput}
                    onChange={(e) => setHealthInput(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={handleVoiceInput}
                    className="flex-1"
                  >
                    {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isRecording ? 'Stop Recording' : 'Voice Input'}
                  </Button>
                  
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
                
                {selectedImage && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Attached Image</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">📷 {selectedImage.name}</p>
                      {imagePreview && (
                        <img 
                          src={imagePreview} 
                          alt="Health report" 
                          className="max-w-full h-auto max-h-64 rounded border"
                        />
                      )}
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Health Report
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">✅ Report Submitted Successfully!</h3>
                  <p className="text-sm text-green-700">
                    Your health report has been sent to <strong>{localStorage.getItem('lastAssignedSpecialist') || 'your care team'}</strong>
                  </p>
                </div>

                {healthInput && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Your Message</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm">{healthInput}</p>
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Attached Image</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <img 
                        src={imagePreview} 
                        alt="Health report" 
                        className="max-w-full h-auto max-h-64 rounded border"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Token:</strong> {patient.dataToken} | <strong>Status:</strong> Under Review
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
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
                <h4 className="font-medium mb-3">Book an Appointment (Optional)</h4>
                
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
                        const appointment = {
                          id: `APT_${Date.now()}`,
                          patientId: patient.id,
                          patientName: patient.name,
                          patientToken: patient.dataToken,
                          doctorId: selectedDoctor,
                          doctorName: `Dr. ${selectedDoctor}`,
                          date: selectedDate,
                          time: selectedTime,
                          status: 'SCHEDULED',
                          linkedHealthReportId: window.currentHealthReport?.id
                        };
                        
                        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                        appointments.push(appointment);
                        localStorage.setItem('appointments', JSON.stringify(appointments));
                        
                        alert(`Appointment booked successfully!\\n\\nDoctor: Dr. ${selectedDoctor}\\nDate: ${selectedDate}\\nTime: ${selectedTime}`);
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