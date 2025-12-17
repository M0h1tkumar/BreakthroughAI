import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, MapPin } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Add mock appointments if none exist
    const mockAppointments = [
      {
        id: 'APT_001',
        patientId: '1',
        patientName: 'Pree Om',
        patientToken: 'TOKEN123456',
        doctorId: 'cardiologist',
        doctorName: 'Dr. Rajesh Kumar - Cardiologist',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'SCHEDULED',
        phone: '+91-9853224443',
        assignedSpecialist: 'Cardiology'
      },
      {
        id: 'APT_002',
        patientId: '2',
        patientName: 'Priya Sharma',
        patientToken: 'TOKEN789012',
        doctorId: 'dermatologist',
        doctorName: 'Dr. Priya Sharma - Dermatologist',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '14:00',
        status: 'SCHEDULED',
        phone: '098-765-4321',
        assignedSpecialist: 'Dermatology'
      }
    ];
    
    const allAppointments = savedAppointments.length > 0 ? savedAppointments : [...savedAppointments, ...mockAppointments];
    setAppointments(allAppointments);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  const groupAppointmentsByDate = () => {
    const grouped = {};
    appointments.forEach(apt => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });
    return grouped;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage patient appointments and schedules</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </Button>
          </div>
        </div>

        {viewMode === 'table' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Appointments ({appointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Patient</th>
                      <th className="text-left p-3">Doctor</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Time</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Contact</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500">Token: {appointment.patientToken}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{appointment.doctorName}</p>
                          <p className="text-xs text-blue-600">{appointment.assignedSpecialist}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{appointment.date}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{appointment.time}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{appointment.phone}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive">
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments scheduled</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'calendar' && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupAppointmentsByDate()).map(([date, dayAppointments]) => (
                    <div key={date} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3 text-blue-800">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {dayAppointments.map((appointment) => (
                          <div key={appointment.id} className="border rounded p-3 bg-blue-50">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={getStatusColor(appointment.status)} className="text-xs">
                                {appointment.status}
                              </Badge>
                              <span className="text-sm font-medium">{appointment.time}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">{appointment.patientName}</span>
                              </div>
                              <p className="text-xs text-gray-600">{appointment.doctorName}</p>
                              <p className="text-xs text-blue-600">{appointment.assignedSpecialist}</p>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{appointment.phone}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(groupAppointmentsByDate()).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No appointments scheduled</p>
                      <p className="text-sm">Appointments will appear here when patients book them</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}
              </div>
              <p className="text-sm text-gray-600">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {appointments.filter(apt => {
                  const aptDate = new Date(apt.date);
                  const today = new Date();
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return aptDate >= today && aptDate <= weekFromNow;
                }).length}
              </div>
              <p className="text-sm text-gray-600">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {appointments.filter(apt => apt.status === 'COMPLETED').length}
              </div>
              <p className="text-sm text-gray-600">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {appointments.filter(apt => apt.status === 'CANCELLED').length}
              </div>
              <p className="text-sm text-gray-600">Total cancelled</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}