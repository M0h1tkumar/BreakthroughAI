interface AccessRule {
  role: string;
  resource: string;
  actions: string[];
  conditions?: (context: any) => boolean;
}

class AccessControlService {
  private rules: AccessRule[] = [
    // Patient access rules
    {
      role: 'patient',
      resource: 'patient_data',
      actions: ['read', 'update_own'],
      conditions: (context) => context.userId === context.resourceOwnerId
    },
    {
      role: 'patient',
      resource: 'reports',
      actions: ['read_own'],
      conditions: (context) => context.userId === context.resourceOwnerId
    },
    
    // Doctor access rules
    {
      role: 'doctor',
      resource: 'patient_data',
      actions: ['read', 'update', 'create']
    },
    {
      role: 'doctor',
      resource: 'reports',
      actions: ['read', 'create', 'update', 'lock']
    },
    {
      role: 'doctor',
      resource: 'ai_council',
      actions: ['access', 'query']
    },
    
    // Pharmacy access rules
    {
      role: 'pharmacy',
      resource: 'prescriptions',
      actions: ['read', 'update_status', 'dispense']
    },
    {
      role: 'pharmacy',
      resource: 'medicines',
      actions: ['read', 'update_stock']
    },
    
    // Admin access rules
    {
      role: 'admin',
      resource: '*',
      actions: ['*']
    }
  ];

  checkAccess(userRole: string, resource: string, action: string, context: any = {}): boolean {
    const applicableRules = this.rules.filter(rule => 
      (rule.role === userRole || rule.role === '*') &&
      (rule.resource === resource || rule.resource === '*')
    );

    for (const rule of applicableRules) {
      if (rule.actions.includes(action) || rule.actions.includes('*')) {
        if (!rule.conditions || rule.conditions(context)) {
          return true;
        }
      }
    }

    console.warn(`🚫 Access denied: ${userRole} cannot ${action} on ${resource}`);
    return false;
  }

  requireAccess(userRole: string, resource: string, action: string, context: any = {}): void {
    if (!this.checkAccess(userRole, resource, action, context)) {
      throw new Error(`Access denied: Insufficient permissions for ${action} on ${resource}`);
    }
  }

  getUserRole(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role || 'anonymous';
  }

  isDoctor(): boolean {
    return this.getUserRole() === 'doctor';
  }

  isPatient(): boolean {
    return this.getUserRole() === 'patient';
  }

  isPharmacy(): boolean {
    return this.getUserRole() === 'pharmacy';
  }

  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }
}

export const accessControl = new AccessControlService();