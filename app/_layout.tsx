import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useContext } from "react";
import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/components/useColorScheme";
import AuthProvider, { AuthContext } from "./Utils/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

function Layout() {
  const colorScheme = useColorScheme();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <ErrorScreen message="Erro: AuthContext não foi carregado corretamente." />;
  }

  const { token, loading } = authContext;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
          },
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </>
        ) : (
          <Stack.Screen name="login" options={{ headerShown: false }} />
        )}
      </Stack>
    </ThemeProvider>
  );
}

// ⏳ Tela de carregamento enquanto o app verifica a autenticação
function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

// ❌ Tela de erro caso o contexto falhe
function ErrorScreen({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

// 🎨 Estilos corrigidos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center" as const, // Garante tipagem correta
    alignItems: "center" as const, // Garante tipagem correta
    backgroundColor: "#000",
  },
  errorText: {
    color: "#fff",
    textAlign: "center",
  },
});
