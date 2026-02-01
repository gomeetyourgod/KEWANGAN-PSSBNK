
import { User, AuthSession } from '../types';

const AUTH_KEY = 'silat_auth_session';
// Default user credentials
// Password 'admin123' hash: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
const DEFAULT_USER = {
  username: 'admin',
  passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  role: 'ADMIN' as const
};

export class AuthService {
  // Helper to hash passwords using Web Crypto API
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async login(username: string, password: string): Promise<User | null> {
    const hash = await this.hashPassword(password);
    
    // Validate credentials
    if (username.toLowerCase() === DEFAULT_USER.username && hash === DEFAULT_USER.passwordHash) {
      const user: User = {
        id: 'user-001',
        username: 'Administrator',
        role: 'ADMIN',
        lastLogin: new Date().toISOString()
      };
      
      const session: AuthSession = {
        user,
        token: Math.random().toString(36).substring(2) + Date.now().toString(36)
      };
      
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      return user;
    }
    
    return null;
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  }

  getCurrentSession(): AuthSession | null {
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentSession();
  }
}

export const authService = new AuthService();
