import { useContext, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { AuthContext } from "../Utils/AuthContext";

// Definição do tipo correto para a resposta da API
type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user_id: number; 
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  if (!authContext) return null;
  const { setToken, setUserId  } = authContext;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch("http://10.0.2.2:8081/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro desconhecido no login.");
      }
  
      const data: LoginResponse = await response.json();
console.log("Resposta da API:", data); // Depuração

if (data.user_id === undefined) {
  throw new Error("user_id não encontrado na resposta da API.");
}
  
      // Armazenar os tokens e o userId no AsyncStorage
      await AsyncStorage.multiSet([
        ["access_token", data.access_token],
        ["refresh_token", data.refresh_token],
        ["user_id", data.user_id.toString()], // Armazenar o userId como string
      ]);
  
      // Atualizar o contexto com o token e o userId
      setToken(data.access_token);
      setUserId(data.user_id); // Defina o userId no contexto
  
      Alert.alert("Sucesso", "Login realizado!");
      router.push("/(tabs)"); // Redireciona para a tela inicial
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro ao tentar logar!";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      console.error("Erro ao fazer login:", errorMessage);
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="gray"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, email && password ? styles.buttonActive : styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.linkText}>Criar uma conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#222",
    color: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#22c55e",
  },
  buttonDisabled: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  linkText: {
    color: "#22c55e",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "bold",
  },
});