import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("auth_token", token);
  } catch (error) {
    console.error("Erro ao salvar token:", error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("auth_token");
  } catch (error) {
    console.error("Erro ao recuperar token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Erro ao remover token:", error);
  }
};
