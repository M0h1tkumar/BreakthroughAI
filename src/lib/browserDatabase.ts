// Browser-compatible database using IndexedDB for persistence
class BrowserDatabase {
  private dbName = 'swasth_ai_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('prescriptions')) {
          db.createObjectStore('prescriptions', { keyPath: 'id' });
        }
      };
    });
  }

  async saveReport(report: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['reports'], 'readwrite');
    const store = transaction.objectStore('reports');
    await store.put(report);
    
    if (report.status === 'LOCKED') {
      console.log(`🔒 Report ${report.id} locked permanently in IndexedDB`);
    }
  }

  async getReports(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Filter out locked reports
        const reports = request.result.filter((r: any) => r.status !== 'LOCKED');
        resolve(reports);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getLockedReports(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const lockedReports = request.result.filter((r: any) => r.status === 'LOCKED');
        resolve(lockedReports);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const browserDB = new BrowserDatabase();