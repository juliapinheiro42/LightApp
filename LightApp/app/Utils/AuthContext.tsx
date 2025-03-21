import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Defina o tipo do contexto
export type AuthContextType = {
  userId: number | null; // Adicione o userId
  token: string | null;
  setToken: (token: string | null) => void;
  setUserId: (userId: number | null) => void; // Função para atualizar o userId
  loading: boolean;
};

// Crie o contexto com valores padrão
export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null, // Valor padrão para userId
  setToken: () => {},
  setUserId: () => {}, // Função padrão para setUserId
  loading: true,
});

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Provedor do contexto
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // Estado para userId
  const [loading, setLoading] = useState<boolean>(true);

  // Carregar o token e o userId do AsyncStorage ao iniciar
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const [storedToken, storedUserId] = await Promise.all([
          AsyncStorage.getItem("access_token"),
          AsyncStorage.getItem("user_id"), // Carregar userId
        ]);

        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10)); // Converter para número
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Salvar o token e o userId no AsyncStorage sempre que forem alterados
  useEffect(() => {
    const saveAuthData = async () => {
      try {
        if (token) {
          await AsyncStorage.setItem("access_token", token);
        } else {
          await AsyncStorage.removeItem("access_token");
        }

        if (userId !== null) {
          await AsyncStorage.setItem("user_id", userId.toString()); // Salvar userId
        } else {
          await AsyncStorage.removeItem("user_id");
        }
      } catch (error) {
        console.error("Erro ao salvar dados de autenticação:", error);
      }
    };

    saveAuthData();
  }, [token, userId]);

  return (
    <AuthContext.Provider value={{ token, setToken, userId, setUserId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}