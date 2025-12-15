class SecurityService {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static sessionTimer: NodeJS.Timeout | null = null;

  static initializeSession() {
    this.resetSessionTimer();
    this.setupSecurityHeaders();
  }

  static resetSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    this.sessionTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.SESSION_TIMEOUT);
  }

  private static handleSessionTimeout() {
    alert('Session expired for security. Please login again.');
    localStorage.clear();
    window.location.href = '/login';
  }

  private static setupSecurityHeaders() {
    // Prevent clickjacking
    if (window.self !== window.top) {
      window.top!.location = window.self.location;
    }
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential XSS
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .trim();
  }

  static encryptSensitiveData(data: string): string {
    // Simple obfuscation for demo - use proper encryption in production
    return btoa(data);
  }

  static decryptSensitiveData(encryptedData: string): string {
    try {
      return atob(encryptedData);
    } catch {
      return '';
    }
  }

  static validateMedicalAccess(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'PATIENT': 1,
      'PHARMACY': 2,
      'DOCTOR': 3,
      'ADMIN': 4
    };

    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  }

  static auditLog(action: string, userId: string, details: any) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      details,
      ip: 'client-side', // In production, get from server
      userAgent: navigator.userAgent
    };
    
    console.log('AUDIT:', auditEntry);
    // In production, send to secure audit service
  }
}

export { SecurityService };