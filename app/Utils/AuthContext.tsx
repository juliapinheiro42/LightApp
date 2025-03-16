import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
};

export const AuthContext =  createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  loading: true,
});


export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("access_token");
        setToken(storedToken);
      } catch (error) {
        console.error("Erro ao carregar token:", error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
