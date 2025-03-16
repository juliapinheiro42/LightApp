import { useState } from "react";
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

// Definição do tipo para a resposta da API
type RegisterResponse = {
  message: string;
  userId: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Controle de etapas do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  // Validações para avanço nas etapas
  const canGoNext = name && email && password;
  const canFinish = weight && height && age && gender && activityLevel && goal;

  // Função para registrar o usuário
  const handleRegister = async () => {
    if (!canFinish) return;

    setLoading(true);
    
    try {
      const response = await fetch("http://10.0.2.2:8081/api/register", {
        method: "POST",
        headers: {
                "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, email, password, 
          weight: parseFloat(weight), 
          height: parseFloat(height), 
          age: parseInt(age), 
          gender, 
          activity_level: parseFloat(activityLevel), 
          goal 
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar conta! Verifique os dados e tente novamente.");
      }

      const data: RegisterResponse = await response.json();
      Alert.alert("Sucesso", "Conta criada com sucesso!");
      router.push("/login");
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      Alert.alert("Erro", error.message || "Ocorreu um problema ao criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta {step === 1 ? "- Passo 1" : "- Passo 2"}</Text>

      {step === 1 ? (
        <>
          <TextInput
            placeholder="Nome"
            placeholderTextColor="gray"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="E-mail"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
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
            style={[styles.button, canGoNext ? styles.buttonActive : styles.buttonDisabled]}
            disabled={!canGoNext}
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonText}>Próximo</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            placeholder="Peso (kg)"
            placeholderTextColor="gray"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Altura (cm)"
            placeholderTextColor="gray"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Idade"
            placeholderTextColor="gray"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Gênero (M/F/Outro)"
            placeholderTextColor="gray"
            value={gender}
            onChangeText={setGender}
            style={styles.input}
          />
          <TextInput
            placeholder="Nível de Atividade (1-5)"
            placeholderTextColor="gray"
            value={activityLevel}
            onChangeText={setActivityLevel}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Objetivo (Perder Peso, Manter, Ganhar Massa)"
            placeholderTextColor="gray"
            value={goal}
            onChangeText={setGoal}
            style={styles.input}
          />
          <TouchableOpacity
            style={[styles.button, canFinish ? styles.buttonActive : styles.buttonDisabled]}
            disabled={!canFinish || loading}
            onPress={handleRegister}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Finalizar Cadastro</Text>}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => (step === 2 ? setStep(1) : router.push("/login"))}>
        <Text style={styles.linkText}>{step === 2 ? "Voltar" : "Já tem uma conta? Entrar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilização do formulário
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
