interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

class GoogleAuthService {
  private clientId = 'your-google-client-id.apps.googleusercontent.com';
  
  async signInWithGoogle(): Promise<GoogleUser | null> {
    try {
      // Simulate Google OAuth flow
      const mockGoogleUser: GoogleUser = {
        id: 'google_' + Date.now(),
        email: 'pree.om@gmail.com',
        name: 'Pree Om',
        picture: 'https://via.placeholder.com/150'
      };
      
      // Store in localStorage
      localStorage.setItem('googleUser', JSON.stringify(mockGoogleUser));
      localStorage.setItem('authProvider', 'google');
      
      console.log('✅ Google Sign-In successful:', mockGoogleUser.name);
      return mockGoogleUser;
    } catch (error) {
      console.error('❌ Google Sign-In failed:', error);
      return null;
    }
  }
  
  getCurrentGoogleUser(): GoogleUser | null {
    const stored = localStorage.getItem('googleUser');
    return stored ? JSON.parse(stored) : null;
  }
  
  signOut(): void {
    localStorage.removeItem('googleUser');
    localStorage.removeItem('authProvider');
    console.log('🔓 Google Sign-Out successful');
  }
  
  isGoogleAuthenticated(): boolean {
    return localStorage.getItem('authProvider') === 'google';
  }
}

export const googleAuth = new GoogleAuthService();