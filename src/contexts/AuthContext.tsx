import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authAPI } from "@/services/api";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthSession {
  user: User;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string }) => Promise<void>;
  applySession: (session: AuthSession) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const persistUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session: AuthSession) => {
    if (session.token) {
      localStorage.setItem("auth_token", session.token);
    }
    persistUser(session.user);
    setUser(session.user);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await authAPI.getCurrentUser();
    applySession({ user: profile });
  }, [applySession]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        setIsLoading(false);
        return;
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      try {
        await refreshUser();
      } catch {
        clearSession();
        setUser(null);
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      if (response?.user) {
        applySession({ user: response.user, token: response.token });
      } else {
        await refreshUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone: string }) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(data);
      if (response?.user) {
        applySession({ user: response.user, token: response.token });
      } else {
        await refreshUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch {
      // Ignore API errors during logout to avoid blocking UI
    } finally {
      clearSession();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        applySession,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
