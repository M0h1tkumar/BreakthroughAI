import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, UserCheck, Stethoscope, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ToastService } from "@/components/ui/toast-notification";
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

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Auto-fill credentials for demo
    if (role === 'DOCTOR') {
      setEmail('doctor@hospital.com');
      setPassword('password123');
    } else if (role === 'PATIENT') {
      setEmail('patient@email.com');
      setPassword('password123');
    } else if (role === 'PHARMACY') {
      setEmail('pharmacy@store.com');
      setPassword('password123');
    } else {
      // Admin or other roles
      setEmail('admin@system.com');
      setPassword('password123');
    }
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
      
      // Navigate based on role
      switch (user.role) {
        case 'DOCTOR':
          navigate('/doctor');
          break;
        case 'PATIENT':
          navigate('/patient');
          break;
        case 'PHARMACY':
          navigate('/pharmacy');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = ErrorHandler.handleAPIError(error, 'Login failed');
      ToastService.show(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    handleRoleSelect(role);
    // Auto-login after role selection
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
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

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Select your role to access the platform
            </p>
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
      </div>
    </div>
  );
}