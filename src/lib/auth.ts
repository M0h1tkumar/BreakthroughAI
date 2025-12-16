import { User, UserRole } from '@/types/medical';
import { SecurityService } from './security';
import { ErrorHandler } from './errorHandler';
import { googleAuth } from './googleAuth';
import { adminService } from './adminService';

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  async login(email: string, password: string, role?: 'patient' | 'doctor' | 'pharmacy' | 'admin'): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password required');
    }

    // Simple role detection
    let userRole: UserRole = 'PATIENT';
    if (email.includes('doctor') || role === 'doctor') {
      userRole = 'DOCTOR';
    } else if (email.includes('pharmacy') || role === 'pharmacy') {
      userRole = 'PHARMACY';
    }

    const mockUser: User = {
      id: Date.now().toString(),
      email,
      role: userRole,
      licenseNumber: userRole === 'DOCTOR' ? 'MD123456' : undefined,
      verified: true
    };
    
    this.currentUser = mockUser;
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isLoggedIn', 'true');
    
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