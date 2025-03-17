import { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router"; // Importe o hook para acessar os parâmetros
import { AuthContext } from "./Utils/AuthContext";
import { FoodItem } from "./Types/FoodItem";

export default function MealScreen() {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;

  const { token } = authContext;
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Extrai o ID da refeição da rota usando useLocalSearchParams
  const { mealId } = useLocalSearchParams<{ mealId: string }>();

  // Busca alimentos pelo nome
  useEffect(() => {
    const fetchFoodByName = async () => {
      if (!token || !search.trim()) {
        setFoods([]);
        return;
      }

      try {
        const res = await fetch(`http://10.0.2.2:8081/debug/food?name=${search}`, {
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

  // Adiciona o alimento selecionado à refeição
  const addFoodToMeal = async (food: FoodItem) => {
    if (!token || !mealId || !food.id) {
      setError("Dados incompletos para adicionar o alimento.");
      return;
    }
  
    try {
      // Monta o corpo da requisição
      const requestBody = {
        meal_id: mealId, // ID da refeição
        food_id: food.id, // ID do alimento
        amount: 100, // Quantidade em gramas (pode ser ajustada)
        user_id: authContext.userId,
      };
  
      // Faz a requisição POST
      const response = await fetch("http://10.0.2.2:8081/api/meals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      // Verifica se a requisição foi bem-sucedida
      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error(`Erro ao adicionar alimento à refeição: ${errorResponse}`);
      }
  
      // Atualiza o estado e exibe uma mensagem de sucesso
      setSelectedFood(food);
      setError(null);
      alert("Alimento adicionado à refeição com sucesso!");
    } catch (err) {
      console.error("🚨 Erro ao adicionar alimento:", err);
      setError("Erro ao adicionar alimento à refeição.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Adicionar Alimento à Refeição</Text>

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
  renderItem={({ item }) => {
    console.log("🧐 Estrutura de item recebido:", item); // DEBUG
    return (
      <TouchableOpacity style={styles.foodItem} onPress={() => addFoodToMeal(item)}>
        <Text style={styles.foodName}>{item?.name ?? "Nome não disponível"}</Text>
        <Text style={styles.foodDetails}>Calorias: {item?.calories ?? "N/A"}</Text>
        <Text style={styles.foodDetails}>Proteína: {item?.protein ?? "N/A"}g</Text>
        <Text style={styles.foodDetails}>Carboidratos: {item?.carbs ?? "N/A"}g</Text>
        <Text style={styles.foodDetails}>Gorduras: {item?.fat ?? "N/A"}g</Text>
      </TouchableOpacity>
    );
  }}
  ListEmptyComponent={() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {search ? "Nenhum alimento encontrado." : "Digite para buscar alimentos."}
      </Text>
    </View>
  )}
/>


      {/* Detalhes do alimento selecionado */}
      {selectedFood && (
        <View style={styles.selectedFoodContainer}>
          <Text style={styles.selectedFoodTitle}>Alimento Selecionado:</Text>
          <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
        </View>
      )}
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
  foodItem: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  foodName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  foodDetails: {
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
  selectedFoodContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#374151",
    borderRadius: 8,
  },
  selectedFoodTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  selectedFoodName: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});