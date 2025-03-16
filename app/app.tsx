import { View, ActivityIndicator } from "react-native";
import { useContext } from "react";
import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthContext } from "./Utils/AuthContext"; // Ajuste o caminho conforme necessário

export default function pp() {
  const colorScheme = useColorScheme();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    console.error("AuthContext não foi fornecido corretamente.");
    return null;
  }

  const { token, loading } = authContext;

  // 🔄 Se estiver carregando, exibe um loader
  if (loading) {
    console.log("Carregando...");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (token) {
    console.log("Token:", token);
  } else {
    console.log("Token não está definido.");
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