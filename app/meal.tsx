import { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { AuthContext } from "./Utils/AuthContext";
import { FoodItem } from "./Types/FoodItem";

export default function MealScreen() {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;

  const { token } = authContext;
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodByName = async () => {
      if (!token || !search.trim()) {
        setFoods([]);
        return;
      }

      try {
        const res = await fetch(`http://10.0.2.2:8081/api/foods/taco/${search}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const textResponse = await res.text();
        console.log("🔍 Resposta da API:", textResponse);

        if (!res.ok) {
          throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
        }

        const data = JSON.parse(textResponse);
        console.log("📌 JSON processado:", data);

        setFoods(Array.isArray(data) ? data : [data]);
        setError(null);
      } catch (err) {
        console.error("🚨 Erro na requisição:", err);
        setError("Erro ao buscar alimentos. Tente novamente.");
        setFoods([]);
      }
    };

    const debounceTimer = setTimeout(fetchFoodByName, 500);
    return () => clearTimeout(debounceTimer);
  }, [search, token]);

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Refeição</Text>

      {/* Campo de busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar alimentos por nome..."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />

      {/* Mensagem de erro */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Lista de alimentos encontrados */}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.foodDetails}>
            <Text style={styles.foodDetailName}>{item.food.name || "Nome não disponível"}</Text>
            <Text style={styles.foodDetailText}>Calorias: {item.food.calories ?? "N/A"}</Text>
            <Text style={styles.foodDetailText}>Proteína: {item.food.protein ?? "N/A"}g</Text>
            <Text style={styles.foodDetailText}>Carboidratos: {item.food.carbs ?? "N/A"}g</Text>
            <Text style={styles.foodDetailText}>Gorduras: {item.food.fats ?? "N/A"}g</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? "Nenhum alimento encontrado." : "Digite para buscar alimentos."}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#1F2937",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  foodDetails: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  foodDetailName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  foodDetailText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});
