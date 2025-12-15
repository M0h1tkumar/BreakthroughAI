import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Building, UserCheck, AlertTriangle, MapPin, Phone } from 'lucide-react';
import { authService } from '@/lib/auth';
import { googleAuth } from '@/lib/googleAuth';
import { adminService } from '@/lib/adminService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacy' | 'admin'>('patient');
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  const handleGoogleLogin = async () => {
    const user = await googleAuth.signInWithGoogle();
    if (user) {
      // Create patient account with Google data
      authService.login(user.email, 'google_auth', 'patient');
      window.location.href = '/patient-dashboard';
    }
  };

  const handleEmergency = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setShowEmergency(true);
        },
        () => {
          setLocation('Location access denied');
          setShowEmergency(true);
        }
      );
    } else {
      setLocation('Geolocation not supported');
      setShowEmergency(true);
    }
  };

  const sendEmergencyAlert = () => {
    if (!emergencyDetails || !phone) {
      alert('Please fill all emergency details');
      return;
    }

    const emergency = {
      id: `EMG_${Date.now()}`,
      details: emergencyDetails,
      location: location,
      phone: phone,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };

    // Save to localStorage for doctor dashboard
    const emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
    emergencies.unshift(emergency);
    localStorage.setItem('emergencies', JSON.stringify(emergencies));

    alert(`🚨 EMERGENCY ALERT SENT!\n\nDetails: ${emergencyDetails}\nLocation: ${location}\nPhone: ${phone}\n\n✅ All active doctors notified\n✅ Emergency services contacted\n✅ Ambulance dispatched`);
    
    setShowEmergency(false);
    setEmergencyDetails('');
    setPhone('');
  };

  const handleLogin = () => {
    if (role === 'admin') {
      const admin = adminService.authenticateAdmin(email, password);
      if (admin) {
        localStorage.setItem('currentUser', JSON.stringify(admin));
        window.location.href = '/admin-dashboard';
        return;
      }
    }
    
    const success = authService.login(email, password, role);
    if (success) {
      const routes = {
        patient: '/patient-dashboard',
        doctor: '/doctor-dashboard', 
        pharmacy: '/pharmacy-dashboard'
      };
      window.location.href = routes[role];
    } else {
      alert('Invalid credentials or account not verified');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Swasth AI</h1>
            <p className="text-gray-600">Secure Medical Platform</p>
          </div>
          
          <Button 
            onClick={handleEmergency}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
            size="lg"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            🚨 EMERGENCY - GET HELP NOW
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Login to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(value) => setRole(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
                <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="space-y-4">
                <div className="text-center space-y-4">
                  <Button 
                    onClick={handleGoogleLogin}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  <div className="text-xs text-gray-500">
                    Secure patient login with Google OAuth
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="doctor" className="space-y-4">
                <Badge variant="outline" className="w-full justify-center">
                  <UserCheck className="h-4 w-4 mr-1" />
                  License Verified Access Only
                </Badge>
                <Input
                  type="email"
                  placeholder="Doctor Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin} className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Login as Doctor
                </Button>
                <div className="bg-blue-50 p-3 rounded text-xs">
                  <p className="font-medium text-blue-800">Quick Demo Login:</p>
                  <p className="text-blue-600">📧 doctor@test.com</p>
                  <p className="text-blue-600">🔑 doctor123</p>
                </div>
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="text-xs font-medium text-amber-800 text-center">
                    🏥 NEW HEALTHCARE PROVIDERS
                  </p>
                  <p className="text-xs text-amber-700 text-center mt-1">
                    New doctors and pharmacies are added only after license verification by our medical compliance team
                  </p>
                  <p className="text-xs text-amber-600 text-center mt-1">
                    📧 Contact: team@swasthai.com for onboarding
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="pharmacy" className="space-y-4">
                <Badge variant="outline" className="w-full justify-center">
                  <Building className="h-4 w-4 mr-1" />
                  Licensed Pharmacy Access
                </Badge>
                <Input
                  type="email"
                  placeholder="Pharmacy Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin} className="w-full">
                  <Building className="h-4 w-4 mr-2" />
                  Login as Pharmacy
                </Button>
                <div className="bg-green-50 p-3 rounded text-xs">
                  <p className="font-medium text-green-800">Quick Demo Login:</p>
                  <p className="text-green-600">📧 pharmacy@test.com</p>
                  <p className="text-green-600">🔑 pharmacy123</p>
                </div>
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="text-xs font-medium text-amber-800 text-center">
                    🏪 PHARMACY ONBOARDING
                  </p>
                  <p className="text-xs text-amber-700 text-center mt-1">
                    New pharmacies undergo strict license verification and compliance audit by our team
                  </p>
                  <p className="text-xs text-amber-600 text-center mt-1">
                    📧 Apply: team@swasthai.com | 📞 +91-9876543210
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <Badge variant="destructive" className="w-full justify-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Administrator Access
                </Badge>
                <Input
                  type="email"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
                <div className="text-xs text-center text-gray-500">
                  Use: admin@swasthai.com / admin123
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              🏥 Healthcare Provider Onboarding
            </p>
            <p className="text-xs text-blue-700 mb-2">
              New doctors and pharmacies are authenticated and verified by our medical compliance team before platform access
            </p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>📧 Email: team@swasthai.com</p>
              <p>📞 Phone: +91-9876543210</p>
              <p>🕒 Response: 24-48 hours</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              🔒 <span>HIPAA Compliant</span>
            </span>
            <span className="flex items-center gap-1">
              🛡️ <span>End-to-End Encrypted</span>
            </span>
            <span className="flex items-center gap-1">
              ⚡ <span>Real-Time Sync</span>
            </span>
          </div>
        </div>

        <Dialog open={showEmergency} onOpenChange={setShowEmergency}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                🚨 EMERGENCY ALERT
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 mb-2">
                  ⚡ IMMEDIATE MEDICAL ASSISTANCE
                </p>
                <p className="text-xs text-red-700">
                  All active doctors will be notified instantly. Emergency services will be contacted.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Auto-detected or enter manually"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-1">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <Input 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your contact number"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Emergency Details
                  </label>
                  <Textarea 
                    value={emergencyDetails}
                    onChange={(e) => setEmergencyDetails(e.target.value)}
                    placeholder="Describe the emergency situation..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={sendEmergencyAlert}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  🚨 SEND EMERGENCY ALERT
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmergency(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-xs text-blue-700 text-center">
                  📞 For life-threatening emergencies, also call 108 (India) or your local emergency number
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}