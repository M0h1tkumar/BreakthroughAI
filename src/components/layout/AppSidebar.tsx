import { useState, useEffect } from 'react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Search,
  Pill,
  Brain,
  LogOut,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import breakthroughLogo from '@/assets/breakthrough-logo.jpeg';

export function AppSidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  useEffect(() => {
    const unsubscribe = authService.onUserChange((user) => {
      setUser(user);
    });
    
    return unsubscribe;
  }, []);
  
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
    setShowLogoutDialog(false);
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      icon: Users, 
      label: 'Patients', 
      path: '/patients',
      roles: ['DOCTOR']
    },
    { 
      icon: FileText, 
      label: 'Reports & Diagnosis', 
      path: '/reports' 
    },
    { 
      icon: Pill, 
      label: 'My Prescriptions', 
      path: '/pharmacy-patient',
      roles: ['PATIENT']
    },
    { 
      icon: Brain, 
      label: 'AI Council', 
      path: '/ai-council',
      roles: ['DOCTOR']
    },
    { 
      icon: Search, 
      label: 'Search', 
      path: '/search' 
    },
    { 
      icon: Calendar, 
      label: 'Appointments', 
      path: '/appointments',
      roles: ['DOCTOR']
    },
    { 
      icon: Activity, 
      label: 'Lab Results', 
      path: '/lab-results',
      roles: ['DOCTOR', 'PATIENT']
    },
    { 
      icon: Activity, 
      label: 'Emergency', 
      path: '/emergency',
      roles: ['DOCTOR']
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings' 
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || 'PATIENT')
  );

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src={breakthroughLogo} 
            alt="BreakThrough" 
            className="h-10 w-10 rounded-xl object-cover" 
          />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Swasth AI</h1>
            <p className="text-xs text-sidebar-foreground/70">
              {user?.role === 'DOCTOR' ? 'Doctor Portal' :
               user?.role === 'PHARMACY' ? 'Pharmacy Portal' : 'Patient Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3">
          <p className="text-sm font-medium text-sidebar-foreground">
            {user?.role === 'DOCTOR' ? 'Dr. ' : ''}
            {user?.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs text-sidebar-foreground/70">
            {user?.role === 'DOCTOR' ? 'License: ' + (user.licenseNumber || 'N/A') : 
             user?.role === 'PHARMACY' ? 'Pharmacy Staff' : 'Patient'}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to log out? You will need to sign in again to access your account.
            </p>
            <div className="flex gap-2">
              <Button onClick={confirmLogout} variant="destructive" className="flex-1">
                Yes, Logout
              </Button>
              <Button onClick={() => setShowLogoutDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}