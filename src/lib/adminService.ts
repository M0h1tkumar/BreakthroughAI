interface LicenseVerification {
  id: string;
  applicantName: string;
  applicantEmail: string;
  role: 'DOCTOR' | 'PHARMACY';
  licenseNumber: string;
  specialty?: string;
  documents: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  permissions: string[];
}

class AdminService {
  private verifications: LicenseVerification[] = [
    {
      id: 'ver_1',
      applicantName: 'Dr. Neha Kapoor',
      applicantEmail: 'neha.kapoor@email.com',
      role: 'DOCTOR',
      licenseNumber: 'MD001244',
      specialty: 'Oncology',
      documents: ['medical_degree.pdf', 'license_certificate.pdf'],
      status: 'PENDING',
      submittedAt: '2024-01-18T10:00:00Z'
    },
    {
      id: 'ver_2',
      applicantName: 'MedCare Pharmacy',
      applicantEmail: 'admin@medcare.com',
      role: 'PHARMACY',
      licenseNumber: 'PH001001',
      documents: ['pharmacy_license.pdf', 'registration.pdf'],
      status: 'PENDING',
      submittedAt: '2024-01-18T14:00:00Z'
    }
  ];

  private admins: AdminUser[] = [
    {
      id: 'admin_1',
      name: 'System Administrator',
      email: 'admin@swasthai.com',
      role: 'ADMIN',
      permissions: ['VERIFY_LICENSES', 'MANAGE_USERS', 'VIEW_ANALYTICS']
    }
  ];

  // License verification methods
  getPendingVerifications(): LicenseVerification[] {
    return this.verifications.filter(v => v.status === 'PENDING');
  }

  getAllVerifications(): LicenseVerification[] {
    return this.verifications;
  }

  submitLicenseVerification(data: Omit<LicenseVerification, 'id' | 'status' | 'submittedAt'>): LicenseVerification {
    const verification: LicenseVerification = {
      ...data,
      id: `ver_${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };
    
    this.verifications.push(verification);
    console.log(`📋 License verification submitted: ${verification.applicantName}`);
    return verification;
  }

  approveVerification(verificationId: string, adminId: string, notes?: string): boolean {
    const verification = this.verifications.find(v => v.id === verificationId);
    if (!verification) return false;

    verification.status = 'APPROVED';
    verification.reviewedAt = new Date().toISOString();
    verification.reviewedBy = adminId;
    verification.notes = notes;

    // Auto-create user account after approval
    if (verification.role === 'DOCTOR') {
      this.createDoctorAccount(verification);
    } else if (verification.role === 'PHARMACY') {
      this.createPharmacyAccount(verification);
    }

    console.log(`✅ License approved: ${verification.applicantName}`);
    return true;
  }

  rejectVerification(verificationId: string, adminId: string, notes: string): boolean {
    const verification = this.verifications.find(v => v.id === verificationId);
    if (!verification) return false;

    verification.status = 'REJECTED';
    verification.reviewedAt = new Date().toISOString();
    verification.reviewedBy = adminId;
    verification.notes = notes;

    console.log(`❌ License rejected: ${verification.applicantName}`);
    return true;
  }

  private createDoctorAccount(verification: LicenseVerification): void {
    // Import secureDB and add doctor
    import('./secureDatabase').then(({ secureDB }) => {
      const newDoctor = {
        id: `d_${Date.now()}`,
        name: verification.applicantName,
        specialty: verification.specialty || 'General Medicine',
        license: verification.licenseNumber,
        email: verification.applicantEmail,
        phone: `987654${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      };
      
      // Add to doctors array (would be database in real implementation)
      console.log(`👨‍⚕️ Doctor account created: ${newDoctor.name}`);
    });
  }

  private createPharmacyAccount(verification: LicenseVerification): void {
    // Import secureDB and add pharmacy
    import('./secureDatabase').then(({ secureDB }) => {
      const newPharmacy = {
        id: `ph_${Date.now()}`,
        name: verification.applicantName,
        address: '123 New Street, City',
        phone: `987654${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        email: verification.applicantEmail,
        medicines: [] // Empty initially
      };
      
      console.log(`🏪 Pharmacy account created: ${newPharmacy.name}`);
    });
  }

  // Admin authentication
  authenticateAdmin(email: string, password: string): AdminUser | null {
    // Simple admin auth (in production, use proper authentication)
    if (email === 'admin@swasthai.com' && password === 'admin123') {
      return this.admins[0];
    }
    return null;
  }

  isAdmin(userId: string): boolean {
    return this.admins.some(admin => admin.id === userId);
  }

  getAdminStats() {
    return {
      pendingVerifications: this.verifications.filter(v => v.status === 'PENDING').length,
      approvedVerifications: this.verifications.filter(v => v.status === 'APPROVED').length,
      rejectedVerifications: this.verifications.filter(v => v.status === 'REJECTED').length,
      totalApplications: this.verifications.length
    };
  }
}

export const adminService = new AdminService();