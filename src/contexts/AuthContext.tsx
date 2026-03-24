import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaura o usuário (sem token — o cookie é enviado automaticamente)
    const storedUser = localStorage.getItem('rathole_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('rathole_user');
      }
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    // Backend seta o cookie HttpOnly — não precisamos lidar com o token aqui
    const response = await api.post('/auth/login', { email, password });
    const { user: apiUser } = response.data;

    const userFormatted: User = {
      id: apiUser.id,
      username: apiUser.name || apiUser.username,
      email: email,
      role: apiUser.role,
      avatar_url: apiUser.avatar_url || apiUser.avatar,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('rathole_user', JSON.stringify(userFormatted));
    setUser(userFormatted);
  }

  async function signOut() {
    try {
      await api.post('/auth/logout'); // backend limpa o cookie HttpOnly
    } catch {
      // continua o logout mesmo se a chamada falhar
    }
    localStorage.removeItem('rathole_user');
    setUser(null);
  }

  function updateUser(data: Partial<User>) {
    if (!user) return;
    const updatedUser = { ...user, ...data };
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
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
