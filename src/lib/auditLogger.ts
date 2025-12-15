interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

class AuditLogger {
  private logs: AuditLog[] = [];

  log(action: string, resource: string, details: any = {}, userId?: string): void {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: userId || this.getCurrentUserId(),
      action,
      resource,
      details,
      ipAddress: 'localhost',
      userAgent: navigator.userAgent
    };

    this.logs.push(auditLog);
    this.persistLog(auditLog);
    
    console.log(`🔍 AUDIT: ${action} on ${resource} by ${auditLog.userId}`);
  }

  private getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.id || 'anonymous';
  }

  private persistLog(log: AuditLog): void {
    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.push(log);
    
    // Keep only last 1000 logs
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs));
  }

  getLogs(): AuditLog[] {
    return JSON.parse(localStorage.getItem('auditLogs') || '[]');
  }

  getLogsByUser(userId: string): AuditLog[] {
    return this.getLogs().filter(log => log.userId === userId);
  }

  getLogsByAction(action: string): AuditLog[] {
    return this.getLogs().filter(log => log.action === action);
  }

  clearLogs(): void {
    localStorage.removeItem('auditLogs');
    this.logs = [];
  }
}

export const auditLogger = new AuditLogger();