import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Bell, Search, Calendar, Plus } from "lucide-react-native";
import { useAuth } from "../Utils/AuthContext"; // Importe o hook personalizado

// Tipagem para os dados das refeições
type Meal = {
  name: string;
  icon: string;
  id: string; // Adicione um ID para cada refeição
};

// Tipagem para o resumo diário
type DailySummary = {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
};

const HomeScreen = () => {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0,
  });

  const { token } = useAuth(); // Use o hook personalizado

  // Efeito para carregar as refeições e o resumo diário
  useEffect(() => {
    setMeals([
      { name: "Café da Manhã", icon: "☀️", id: "1" },
      { name: "Almoço", icon: "🌞", id: "2" },
      { name: "Jantar", icon: "🌇", id: "3" },
      { name: "Lanches/Outros", icon: "🌙", id: "4" },
    ]);

    if (token) {
      // Busca o resumo da primeira refeição como exemplo
      fetchDailySummary("1");
    }
  }, [token]);

  // Função para buscar o resumo diário de uma refeição específica
  const fetchDailySummary = async (mealId: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:8081/api/meals/${mealId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar dados");
      }

      const data = await response.json();
      setDailySummary({
        calories: data.calories || 0,
        proteins: data.proteins || 0,
        carbs: data.carbs || 0,
        fats: data.fats || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar resumo diário:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LightApp</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Calendar size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Meal Tracker Section */}
      <ScrollView style={styles.scrollView}>
        {/* Resumo Diário */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>DIÁRIO ALIMENTAR</Text>
          <View style={styles.summaryContent}>
            <View>
              <Text style={styles.summaryText}>Gorduras: {dailySummary.fats.toFixed(1)}g</Text>
              <Text style={styles.summaryText}>Carboidratos: {dailySummary.carbs.toFixed(1)}g</Text>
              <Text style={styles.summaryText}>Proteínas: {dailySummary.proteins.toFixed(1)}g</Text>
            </View>
            <Text style={styles.caloriesText}>Calorias: {dailySummary.calories.toFixed(0)}</Text>
          </View>
        </View>

        {/* Meal Buttons */}
        <Text style={styles.sectionTitle}>Refeições</Text>
        {meals.map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mealButton}
            onPress={() => {
              fetchDailySummary(meal.id); // Busca o resumo da refeição ao clicar
              router.push({
                pathname: "../meal",
                params: { mealName: meal.name, mealId: meal.id }, // Passa o nome e o ID da refeição
              });
            }}
          >
            <View style={styles.mealContent}>
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <Text style={styles.mealName}>{meal.name}</Text>
            </View>
            <View style={styles.plusButton}>
              <Plus size={18} color="white" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2023 LightApp. Todos os direitos reservados.</Text>
      </View>
    </View>
  );
};

export default HomeScreen;

// Estilos (mantidos iguais)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    backgroundColor: "#1F2937",
    padding: 8,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  caloriesText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  mealButton: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealName: {
    color: "#fff",
    fontSize: 16,
  },
  plusButton: {
    backgroundColor: "#10B981",
    padding: 8,
    borderRadius: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingVertical: 16,
  },
  footerText: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 12,
  },
});