import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Users, Brain, Lock, Globe, Award, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-blue-900">Swasth AI</span>
          </div>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
          🏆 Industry-Leading Medical AI Platform
        </Badge>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Next-Generation
          <span className="text-blue-600 block">Medical Intelligence</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Enterprise-grade AI-powered healthcare platform with real-time diagnostics, 
          secure patient management, and comprehensive medical workflow automation.
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/login'}>
            <Users className="h-5 w-5 mr-2" />
            Access Platform
          </Button>
          <Button size="lg" variant="outline">
            <Globe className="h-5 w-5 mr-2" />
            View Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-gray-600">Active Patients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">10+</div>
            <div className="text-sm text-gray-600">Verified Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">5000+</div>
            <div className="text-sm text-gray-600">Medicine Database</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">99.9%</div>
            <div className="text-sm text-gray-600">Uptime SLA</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Enterprise Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200">
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Council</h3>
                <p className="text-gray-600">Multi-AI diagnostic system with OpenAI, Gemini, and Perplexity integration</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">HIPAA Compliant</h3>
                <p className="text-gray-600">End-to-end encryption, audit trails, and medical-grade security</p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Real-Time Sync</h3>
                <p className="text-gray-600">Live updates across all modules with enterprise-level synchronization</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Provider Onboarding */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <Award className="h-16 w-16 mx-auto mb-6 text-blue-200" />
          <h2 className="text-3xl font-bold mb-6">Healthcare Provider Onboarding</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            New doctors and pharmacies undergo rigorous verification by our medical compliance team. 
            Only licensed, authenticated healthcare providers gain platform access.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Doctor Verification
                </h3>
                <ul className="text-left space-y-2 text-blue-100">
                  <li>• Medical license validation</li>
                  <li>• Specialty certification review</li>
                  <li>• Background verification</li>
                  <li>• Compliance audit</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Pharmacy Authentication
                </h3>
                <ul className="text-left space-y-2 text-blue-100">
                  <li>• Pharmacy license verification</li>
                  <li>• Drug handling certification</li>
                  <li>• Regulatory compliance check</li>
                  <li>• Quality assurance audit</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 bg-white/10 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Contact Our Team</h3>
            <div className="space-y-2 text-blue-100">
              <p>📧 Email: team@swasthai.com</p>
              <p>📞 Phone: +91-9876543210</p>
              <p>⏱️ Response Time: 24-48 hours</p>
              <p>🏥 Verification Process: 3-5 business days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Lock className="h-16 w-16 text-gray-700 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Enterprise Security</h2>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">AES-256</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-2">HIPAA</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-2">GDPR</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600 mb-2">SOC 2</div>
              <div className="text-sm text-gray-600">Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold">Swasth AI</span>
          </div>
          <p className="text-gray-400 mb-4">
            Enterprise Medical Intelligence Platform
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <span>© 2024 Swasth AI</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}