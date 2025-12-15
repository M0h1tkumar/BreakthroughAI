class EncryptionService {
  private key: string;

  constructor() {
    this.key = this.getOrCreateKey();
  }

  private getOrCreateKey(): string {
    let key = localStorage.getItem('swasth_encryption_key');
    if (!key) {
      key = this.generateKey();
      localStorage.setItem('swasth_encryption_key', key);
    }
    return key;
  }

  private generateKey(): string {
    return btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }

  encrypt(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = btoa(jsonString + '|' + this.key);
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return JSON.stringify(data);
    }
  }

  decrypt(encryptedData: string): any {
    try {
      const decoded = atob(encryptedData);
      const [jsonString, key] = decoded.split('|');
      
      if (key !== this.key) {
        throw new Error('Invalid encryption key');
      }
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      try {
        return JSON.parse(encryptedData);
      } catch {
        return null;
      }
    }
  }

  hashData(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export const encryptionService = new EncryptionService();