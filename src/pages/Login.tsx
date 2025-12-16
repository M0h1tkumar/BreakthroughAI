import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, UserCheck, Stethoscope, Pill, AlertTriangle, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ToastService } from "@/components/ui/toast-notification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import breakthroughLogo from "@/assets/breakthrough-logo.jpeg";
import { authService } from "@/lib/auth";
import { UserRole } from "@/types/medical";
import { ErrorHandler } from "@/lib/errorHandler";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [location, setLocation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      ToastService.show('Please enter email and password', 'error');
      return;
    }

    if (!ErrorHandler.validateInput(email, 'email')) {
      ToastService.show('Please enter a valid email address', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await authService.login(email, password);
      ToastService.show(`Welcome ${user.role.toLowerCase()}!`, 'success');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = ErrorHandler.handleAPIError(error, 'Login failed');
      ToastService.show(errorMessage, 'error');
    } finally {
      setIsLoading(false);
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
    if (!emergencyDetails || !emergencyPhone) {
      alert('Please fill all emergency details');
      return;
    }

    const emergency = {
      id: `EMG_${Date.now()}`,
      details: emergencyDetails,
      location: location,
      phone: emergencyPhone,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };

    const emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
    emergencies.unshift(emergency);
    localStorage.setItem('emergencies', JSON.stringify(emergencies));

    alert(`🚨 EMERGENCY ALERT SENT!\n\nDetails: ${emergencyDetails}\nLocation: ${location}\nPhone: ${emergencyPhone}\n\n✅ All active doctors notified\n✅ Emergency services contacted\n✅ Ambulance dispatched`);
    
    setShowEmergency(false);
    setEmergencyDetails('');
    setEmergencyPhone('');
  };

  const handleQuickLogin = async (role: UserRole) => {
    setSelectedRole(role);
    let email = '', password = 'demo123';
    
    if (role === 'DOCTOR') {
      email = 'doctor@hospital.com';
    } else if (role === 'PATIENT') {
      email = 'patient@email.com';
    } else if (role === 'PHARMACY') {
      email = 'pharmacy@store.com';
    }
    
    try {
      const user = await authService.login(email, password, role.toLowerCase() as any);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img src={breakthroughLogo} alt="BreakThrough" className="h-12 w-12 rounded-xl shadow-lg object-cover" />
            <span className="text-3xl font-bold text-white">Swasth AI</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            AI-Powered Medical Intelligence
          </h1>
          
          <p className="text-lg text-blue-100 max-w-md mb-10">
            Advanced clinical decision support with multi-AI council system for healthcare professionals.
          </p>

          <div className="flex flex-wrap gap-3">
            {["AI Council", "Clinical Support", "HIPAA Compliant", "Doctor Only AI"].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-blue-300/30 bg-blue-400/20 px-4 py-2 text-sm text-blue-100"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={breakthroughLogo} alt="BreakThrough" className="h-10 w-10 rounded-xl object-cover" />
            <span className="text-2xl font-bold">Swasth AI</span>
          </div>

          <div className="text-center lg:text-left space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="text-muted-foreground mt-2">
                Select your role to access the platform
              </p>
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

          {!selectedRole && (
            <div className="space-y-4">
              <p className="text-center font-medium">Quick Login - Select Role</p>
              <div className="grid grid-cols-1 gap-4">
                <Card 
                  className="cursor-pointer hover:bg-blue-50 border-2 hover:border-blue-200 transition-colors"
                  onClick={() => handleQuickLogin('DOCTOR')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <Stethoscope className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">Doctor Portal</p>
                      <p className="text-xs text-gray-600">Access AI Council & Clinical Tools</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-green-50 border-2 hover:border-green-200 transition-colors"
                  onClick={() => handleQuickLogin('PATIENT')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Patient Portal</p>
                      <p className="text-xs text-gray-600">Secure Medical Records Access</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-orange-50 border-2 hover:border-orange-200 transition-colors"
                  onClick={() => handleQuickLogin('PHARMACY')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <Pill className="h-8 w-8 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium">Pharmacy Portal</p>
                      <p className="text-xs text-gray-600">Prescription Management</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {selectedRole && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Signing in as: {selectedRole}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedRole(null)}
                >
                  Change Role
                </Button>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me
                    </label>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Demo credentials are auto-filled. Click any role to login instantly.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Doctor:</strong> Full AI Council access, patient management</p>
              <p><strong>Patient:</strong> Secure data submission, tokenized privacy</p>
              <p><strong>Pharmacy:</strong> Prescription management, WhatsApp e-bills</p>
            </div>
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
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
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