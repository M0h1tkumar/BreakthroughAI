interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  track(event: string, properties: Record<string, any> = {}, userId?: string) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      userId,
      properties,
      timestamp: new Date().toISOString()
    };

    this.events.push(analyticsEvent);
    console.log('Analytics:', analyticsEvent);
    
    // In production, send to analytics service
    this.sendToAnalytics(analyticsEvent);
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // Mock analytics endpoint
    // In production: send to Google Analytics, Mixpanel, etc.
  }

  // Medical-specific tracking
  trackAIUsage(doctorId: string, patientId: string, aiModel: string) {
    this.track('ai_council_used', {
      doctorId,
      patientId,
      aiModel,
      compliance: 'doctor_only_access'
    }, doctorId);
  }

  trackReportGeneration(reportId: string, doctorId: string, patientId: string, aiAssisted: boolean) {
    this.track('medical_report_generated', {
      reportId,
      doctorId,
      patientId,
      aiAssisted,
      compliance: 'hipaa_compliant'
    }, doctorId);
  }

  trackPrescriptionDispensed(prescriptionId: string, pharmacyId: string, patientId: string, totalAmount: number) {
    this.track('prescription_dispensed', {
      prescriptionId,
      pharmacyId,
      patientId,
      totalAmount,
      ebillGenerated: true
    }, pharmacyId);
  }

  trackWhatsAppShare(billId: string, phoneNumber: string) {
    this.track('ebill_whatsapp_shared', {
      billId,
      phoneNumber: phoneNumber.replace(/\d/g, 'X'), // Anonymize for privacy
      channel: 'whatsapp'
    });
  }

  getAnalytics() {
    return {
      totalEvents: this.events.length,
      aiUsage: this.events.filter(e => e.event === 'ai_council_used').length,
      reportsGenerated: this.events.filter(e => e.event === 'medical_report_generated').length,
      prescriptionsDispensed: this.events.filter(e => e.event === 'prescription_dispensed').length,
      whatsappShares: this.events.filter(e => e.event === 'ebill_whatsapp_shared').length
    };
  }
}

export const analytics = new AnalyticsService();