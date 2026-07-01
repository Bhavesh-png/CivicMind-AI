import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email: string;
  role: 'Citizen' | 'Admin' | 'Government';
  name: string;
  permissions: string[];
  token: string;
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  loginWithFirebaseGoogle: () => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL matching the local backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check token on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser({
            email: data.email,
            role: data.role,
            name: data.name,
            permissions: data.permissions,
            token: token
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.error("Auth initialization failed:", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        
        // Fetch profile
        const profileResponse = await fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser({
            email: profileData.email,
            role: profileData.role,
            name: profileData.name,
            permissions: profileData.permissions,
            token: data.access_token
          });
          setLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
    return false;
  };

  const loginWithFirebaseGoogle = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate real Google OAuth popup flow for hackathon demo
      // In production: use firebase/auth signInWithPopup(auth, new GoogleAuthProvider())
      const popup = window.open('', 'Google Sign-In', 'width=480,height=560,top=100,left=200');
      if (!popup) {
        // Fallback if popup blocked - direct mock auth
        const mockEmail = "admin.user@civicmind.gov";
        const mockToken = "fb-google-Admin-" + Date.now();
        localStorage.setItem('token', mockToken);
        setUser({
          email: mockEmail,
          role: 'Admin',
          name: 'Admin Google User',
          permissions: ["read:dashboard", "submit:feedback", "read:analytics", "generate:reports", "manage:alerts", "assign:tasks", "write:settings", "manage:users"],
          token: mockToken
        });
        resolve(true);
        return;
      }

      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sign in - Google Accounts</title>
          <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Roboto', sans-serif; background: #fff; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
            .container { width: 360px; padding: 48px 40px 36px; margin: auto; }
            .logo { text-align: center; margin-bottom: 24px; }
            .logo svg { width: 75px; }
            h1 { font-size: 24px; font-family: 'Google Sans', sans-serif; font-weight: 400; color: #202124; text-align: center; margin-bottom: 8px; }
            p { font-size: 16px; color: #202124; text-align: center; margin-bottom: 24px; }
            .input { width: 100%; padding: 13px 15px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px; margin-bottom: 8px; outline: none; }
            .input:focus { border-color: #1a73e8; box-shadow: 0 0 0 1px #1a73e8; }
            .btn { width: 100%; padding: 10px; background: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 14px; font-family: 'Google Sans', sans-serif; font-weight: 500; cursor: pointer; margin-top: 24px; }
            .btn:hover { background: #1557b0; }
            .footer { font-size: 12px; color: #5f6368; text-align: center; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <svg viewBox="0 0 75 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M29.24 12.27c0 3.43-2.68 5.96-5.97 5.96-3.29 0-5.97-2.53-5.97-5.96s2.68-5.96 5.97-5.96c1.76 0 3.01.69 3.95 1.57l-1.56 1.56c-.43-.4-1.01-.72-2.39-.72-1.95 0-3.48 1.62-3.48 3.55 0 1.93 1.53 3.55 3.48 3.55 2.22 0 3.05-1.59 3.18-2.42h-3.18V11.4h5.32c.05.28.08.55.08.87z" fill="#4285F4"/>
                <path d="M38.63 12.27c0 2.44-1.91 4.24-4.25 4.24s-4.25-1.8-4.25-4.24 1.91-4.24 4.25-4.24 4.25 1.8 4.25 4.24zm-1.86 0c0-1.53-1.11-2.57-2.39-2.57s-2.39 1.04-2.39 2.57c0 1.51 1.11 2.57 2.39 2.57s2.39-1.06 2.39-2.57z" fill="#EA4335"/>
                <path d="M47.26 12.27c0 2.44-1.91 4.24-4.25 4.24s-4.25-1.8-4.25-4.24 1.91-4.24 4.25-4.24 4.25 1.8 4.25 4.24zm-1.86 0c0-1.53-1.11-2.57-2.39-2.57s-2.39 1.04-2.39 2.57c0 1.51 1.11 2.57 2.39 2.57s2.39-1.06 2.39-2.57z" fill="#FBBC05"/>
                <path d="M55.48 8.19v8.07c0 3.32-1.96 4.68-4.27 4.68-2.18 0-3.49-1.46-3.98-2.65l1.62-.67c.31.73.99 1.6 2.36 1.6 1.55 0 2.51-.96 2.51-2.76v-.67h-.07c-.46.57-1.35 1.07-2.47 1.07-2.35 0-4.5-2.04-4.5-4.68 0-2.65 2.15-4.68 4.5-4.68 1.12 0 2.01.5 2.47 1.06h.07V8.19h1.76zm-1.63 4.1c0-1.49-1-2.59-2.26-2.59-1.29 0-2.37 1.1-2.37 2.59s1.08 2.55 2.37 2.55c1.26 0 2.26-1.06 2.26-2.55z" fill="#4285F4"/>
                <path d="M59.14 3.25v14h-1.86v-14h1.86z" fill="#34A853"/>
                <path d="M66.17 14.08l1.45.97c-.47.69-1.6 1.88-3.56 1.88-2.43 0-4.24-1.88-4.24-4.24 0-2.52 1.83-4.24 4.04-4.24 2.22 0 3.31 1.75 3.67 2.7l.2.49-5.72 2.37c.44.86 1.12 1.3 2.08 1.3.97 0 1.64-.48 2.08-1.23zm-4.5-1.54l3.82-1.59c-.21-.53-.84-.9-1.58-.9-1.27 0-2.42.96-2.24 2.49z" fill="#EA4335"/>
              </svg>
            </div>
            <h1>Sign in</h1>
            <p>to continue to CivicMind AI</p>
            <input class="input" id="email" type="email" placeholder="Email or phone" value="admin.user@civicmind.gov" />
            <button class="btn" onclick="signIn()">Next</button>
            <p class="footer">CivicMind AI &bull; Hackathon Demo Mode</p>
          </div>
          <script>
            function signIn() {
              window.opener.postMessage('GOOGLE_AUTH_SUCCESS', '*');
              window.close();
            }
          </script>
        </body>
        </html>
      `);

      const handleMessage = (event: MessageEvent) => {
        if (event.data === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          const mockEmail = "admin.user@civicmind.gov";
          const mockToken = "fb-google-Admin-" + Date.now();
          localStorage.setItem('token', mockToken);
          setUser({
            email: mockEmail,
            role: 'Admin',
            name: 'Admin Google User',
            permissions: ["read:dashboard", "submit:feedback", "read:analytics", "generate:reports", "manage:alerts", "assign:tasks", "write:settings", "manage:users"],
            token: mockToken
          });
          resolve(true);
        }
      };
      window.addEventListener('message', handleMessage);

      // Cleanup if popup closed without signing in
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          resolve(false);
        }
      }, 500);
    });
  };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithFirebaseGoogle, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
