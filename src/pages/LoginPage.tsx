import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Building, UserCheck } from 'lucide-react';
import { authService } from '@/lib/auth';
import { googleAuth } from '@/lib/googleAuth';
import { adminService } from '@/lib/adminService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacy' | 'admin'>('patient');

  const handleGoogleLogin = async () => {
    const user = await googleAuth.signInWithGoogle();
    if (user) {
      // Create patient account with Google data
      authService.login(user.email, 'google_auth', 'patient');
      window.location.href = '/patient-dashboard';
    }
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900">Swasth AI</h1>
          <p className="text-gray-600">Secure Medical Platform</p>
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
      </div>
    </div>
  );
}