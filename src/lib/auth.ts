import { User, UserRole } from '@/types/medical';
import { SecurityService } from './security';
import { ErrorHandler } from './errorHandler';
import { googleAuth } from './googleAuth';
import { adminService } from './adminService';

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  async login(email: string, password: string, role?: 'patient' | 'doctor' | 'pharmacy' | 'admin'): Promise<User> {
    // Enhanced validation
    if (!email || !password) {
      throw new Error('Email and password required');
    }

    if (!ErrorHandler.validateInput(email, 'email')) {
      throw new Error('Invalid email format');
    }

    // Sanitize inputs
    email = SecurityService.sanitizeInput(email);
    password = SecurityService.sanitizeInput(password);

    // Check for Google OAuth
    if (password === 'google_auth' && role === 'patient') {
      const googleUser = googleAuth.getCurrentGoogleUser();
      if (googleUser && googleUser.email === email) {
        const mockUser: User = {
          id: googleUser.id,
          email: googleUser.email,
          role: 'PATIENT',
          verified: true
        };
        this.currentUser = mockUser;
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('isLoggedIn', 'true');
        SecurityService.initializeSession();
        SecurityService.auditLog('GOOGLE_LOGIN', mockUser.id, { email: mockUser.email });
        this.notifyListeners();
        return mockUser;
      }
    }

    // Admin authentication
    if (role === 'admin') {
      const admin = adminService.authenticateAdmin(email, password);
      if (admin) {
        const mockUser: User = {
          id: admin.id,
          email: admin.email,
          role: 'DOCTOR', // Use DOCTOR role for admin in User type
          verified: true
        };
        this.currentUser = mockUser;
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', 'true');
        SecurityService.initializeSession();
        SecurityService.auditLog('ADMIN_LOGIN', mockUser.id, { email: mockUser.email });
        this.notifyListeners();
        return mockUser;
      }
    }

    // Mock authentication with proper role detection
    let userRole: UserRole = 'PATIENT';
    if (role === 'doctor' || email.includes('doctor') || email.includes('dr.')) {
      userRole = 'DOCTOR';
    } else if (role === 'pharmacy' || email.includes('pharmacy') || email.includes('pharm')) {
      userRole = 'PHARMACY';
    }

    // Allow demo login for testing (in production, enable verification check)
    // if ((userRole === 'DOCTOR' || userRole === 'PHARMACY') && !this.isVerifiedProvider(email)) {
    //   throw new Error('Account pending admin verification');
    // }

    const mockUser: User = {
      id: Date.now().toString(),
      email,
      role: userRole,
      licenseNumber: userRole === 'DOCTOR' ? 'MD' + Math.random().toString().substr(2, 6) : undefined,
      verified: true
    };
    
    this.currentUser = mockUser;
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Initialize security session
    SecurityService.initializeSession();
    SecurityService.auditLog('LOGIN', mockUser.id, { email: mockUser.email, role: mockUser.role });
    
    this.notifyListeners();
    return mockUser;
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('user');
      this.currentUser = stored ? JSON.parse(stored) : null;
    }
    return this.currentUser;
  }

  onUserChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  isDoctor(): boolean {
    return this.getCurrentUser()?.role === 'DOCTOR';
  }

  requireDoctor(): void {
    if (!this.isDoctor()) {
      throw new Error('UNAUTHORIZED: Doctor access required');
    }
  }

  logout(): void {
    const userId = this.currentUser?.id;
    SecurityService.auditLog('LOGOUT', userId || 'unknown', {});
    
    this.currentUser = null;
    localStorage.clear();
    this.notifyListeners();
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true' && this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  private isVerifiedProvider(email: string): boolean {
    // Check if doctor/pharmacy is in approved list
    const approvedEmails = [
      'doctor@test.com',
      'pharmacy@test.com'
    ];
    return approvedEmails.includes(email);
  }

  loginWithGoogle(): Promise<User> {
    return this.login('pree.om@gmail.com', 'google_auth', 'patient');
  }
}

export const authService = new AuthService();