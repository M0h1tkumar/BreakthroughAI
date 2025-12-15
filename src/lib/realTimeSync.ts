class RealTimeSync {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
    this.setupHeartbeat();
  }

  private connect() {
    try {
      // Simulate WebSocket connection (in production, use actual WebSocket server)
      console.log('🔄 Establishing real-time connection...');
      this.simulateConnection();
    } catch (error) {
      console.error('❌ Real-time connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private simulateConnection() {
    // Simulate real-time updates using localStorage events
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('swasth_')) {
        const eventType = event.key.replace('swasth_', '');
        const data = event.newValue ? JSON.parse(event.newValue) : null;
        this.emit(eventType, data);
      }
    });

    // Simulate periodic updates
    setInterval(() => {
      this.emit('heartbeat', { timestamp: Date.now(), status: 'connected' });
    }, 30000);

    console.log('✅ Real-time sync active');
  }

  private setupHeartbeat() {
    setInterval(() => {
      this.broadcast('system_status', {
        timestamp: new Date().toISOString(),
        activeUsers: this.getActiveUsers(),
        systemLoad: Math.random() * 100
      });
    }, 60000);
  }

  private getActiveUsers(): number {
    const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
    return sessions.filter((s: any) => Date.now() - s.lastActivity < 300000).length;
  }

  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }

  broadcast(event: string, data: any) {
    localStorage.setItem(`swasth_${event}`, JSON.stringify({
      ...data,
      timestamp: Date.now(),
      sender: this.getCurrentUserId()
    }));
  }

  private getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.id || 'anonymous';
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    }
  }

  // Industry-level features
  syncPatientUpdate(patientId: string, updates: any) {
    this.broadcast('patient_updated', { patientId, updates, priority: 'high' });
  }

  syncReportStatus(reportId: string, status: string, doctorId: string) {
    this.broadcast('report_status_changed', { reportId, status, doctorId, priority: 'critical' });
  }

  syncPrescriptionDispensed(prescriptionId: string, pharmacyId: string) {
    this.broadcast('prescription_dispensed', { prescriptionId, pharmacyId, priority: 'high' });
  }

  notifyEmergency(patientId: string, severity: string) {
    this.broadcast('emergency_alert', { patientId, severity, priority: 'critical' });
  }
}

export const realTimeSync = new RealTimeSync();