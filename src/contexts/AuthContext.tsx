import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>; 
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('rathole_token');
    const storedUser = localStorage.getItem('rathole_user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('rathole_user');
      }
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // O backend deve retornar { token, user }
      const { token, user: apiUser } = response.data;

      const userFormatted: User = {
        id: apiUser.id,
        username: apiUser.name || apiUser.username,
        email: email,
        role: apiUser.role,
        avatar_url: apiUser.avatar_url || apiUser.avatar,
        created_at: new Date().toISOString() // fallback
      };

      localStorage.setItem('rathole_token', token);
      localStorage.setItem('rathole_user', JSON.stringify(userFormatted));
      
      // update no header da api
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userFormatted);
    } catch (error) {
      console.error("Erro no signIn:", error);
      throw error; // erro pro auth.tsx
    }
  }

  function signOut() {
    localStorage.removeItem('rathole_token');
    localStorage.removeItem('rathole_user');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
  }

  function updateUser(data: Partial<User>) {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    
    //muda o header
    setUser(updatedUser);
    
    localStorage.setItem('rathole_user', JSON.stringify(updatedUser));
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signOut, 
      updateUser,
      loading, 
      isAdmin: user?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);