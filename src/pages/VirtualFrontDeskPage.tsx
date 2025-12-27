import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VirtualFrontDesk } from '@/components/VirtualFrontDesk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Clock, Users, Phone } from 'lucide-react';

export default function VirtualFrontDeskPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Virtual Front Desk</h1>
            <p className="text-muted-foreground">AI-powered patient assistance available 24/7</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bot className="h-4 w-4" />
            AI Assistant Active
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <VirtualFrontDesk />
          </div>

          {/* Sidebar with stats and info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <Badge variant="outline">2.3 seconds</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Conversations</span>
                  <Badge variant="outline">12</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Appointments Scheduled Today</span>
                  <Badge variant="outline">47</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Appointment Scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Insurance Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Prescription Refills</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Specialist Routing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Wait Time Updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Emergency:</strong> 911</p>
                  <p><strong>Clinic Main:</strong> (555) 123-4567</p>
                  <p><strong>After Hours:</strong> (555) 123-4568</p>
                  <p className="text-xs text-gray-600 mt-3">
                    For medical emergencies, please call 911 or visit your nearest emergency room.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}