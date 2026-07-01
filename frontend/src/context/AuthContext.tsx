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
    // In a full production build, we would run standard firebase sign-in:
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    // const token = await result.user.getIdToken();
    // Here we simulate the Google Auth callback:
    const mockEmail = "admin.user@civicmind.gov";
    const mockToken = "fb-mock-Admin-admin.user@civicmind.gov";
    localStorage.setItem('token', mockToken);
    
    setUser({
      email: mockEmail,
      role: 'Admin',
      name: 'Admin Google User',
      permissions: [
        "read:dashboard", "submit:feedback", "read:analytics", 
        "generate:reports", "manage:alerts", "assign:tasks", 
        "write:settings", "manage:users"
      ],
      token: mockToken
    });
    return true;
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
