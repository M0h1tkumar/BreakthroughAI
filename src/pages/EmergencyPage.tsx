import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Phone, Clock, User } from 'lucide-react';

export default function EmergencyPage() {
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    const savedEmergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
    setEmergencies(savedEmergencies);
  }, []);

  const handleCallPatient = (phone) => {
    alert(`Calling patient at ${phone}...`);
  };

  const handleDispatchAmbulance = (location) => {
    alert(`Ambulance dispatched to location: ${location}`);
  };

  const resolveEmergency = (emergencyId) => {
    const updatedEmergencies = emergencies.map(emergency => 
      emergency.id === emergencyId 
        ? { ...emergency, status: 'RESOLVED' }
        : emergency
    );
    setEmergencies(updatedEmergencies);
    localStorage.setItem('emergencies', JSON.stringify(updatedEmergencies));
  };

  const activeEmergencies = emergencies.filter(e => e.status === 'ACTIVE');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-700">Emergency Management</h1>
            <p className="text-muted-foreground">Monitor and respond to emergency alerts</p>
          </div>
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            {activeEmergencies.length} Active Emergencies
          </Badge>
        </div>

        {activeEmergencies.length === 0 ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-800">No Current Emergencies</h3>
                  <p className="text-green-700 mt-2">
                    All emergency situations have been resolved. The system is monitoring for new alerts.
                  </p>
                </div>
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-green-800 mb-2">Emergency Response Protocol:</p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Emergency alerts appear instantly on this dashboard</li>
                    <li>• Patient location is automatically detected via GPS</li>
                    <li>• Direct call and ambulance dispatch options available</li>
                    <li>• All emergency data is logged for medical records</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeEmergencies.map((emergency) => (
              <Card key={emergency.id} className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    🚨 ACTIVE EMERGENCY - {emergency.id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white border border-red-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Emergency Details</h4>
                          <p className="text-sm text-gray-700 mb-3">{emergency.details}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                Reported: {new Date(emergency.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Contact: {emergency.phone}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Patient Location</h4>
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">GPS Coordinates</p>
                                <p className="text-sm text-blue-700">{emergency.location}</p>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="mt-2"
                                  onClick={() => window.open(`https://maps.google.com/?q=${emergency.location}`, '_blank')}
                                >
                                  View on Map
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleCallPatient(emergency.phone)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Patient Now
                      </Button>
                      <Button 
                        onClick={() => handleDispatchAmbulance(emergency.location)}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Dispatch Ambulance
                      </Button>
                      <Button 
                        onClick={() => resolveEmergency(emergency.id)}
                        variant="secondary"
                      >
                        Mark as Resolved
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Emergencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {emergencies.length}
              </div>
              <p className="text-sm text-gray-600">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {activeEmergencies.length}
              </div>
              <p className="text-sm text-gray-600">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {emergencies.filter(e => e.status === 'RESOLVED').length}
              </div>
              <p className="text-sm text-gray-600">Successfully handled</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}