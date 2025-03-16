import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Bell, Search, Calendar, Plus } from "lucide-react-native";

const HomeScreen = () => {
  const router = useRouter();
  const [meals, setMeals] = useState<{ name: string; icon: string }[]>([]);

  useEffect(() => {
    setMeals([
      { name: "Café da Manhã", icon: "☀️" },
      { name: "Almoço", icon: "🌞" },
      { name: "Jantar", icon: "🌇" },
      { name: "Lanches/Outros", icon: "🌙" },
    ]);
  }, []);

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
              <Text style={styles.summaryText}>Gorduras: 0g</Text>
              <Text style={styles.summaryText}>Carboidratos: 0g</Text>
              <Text style={styles.summaryText}>Proteínas: 0g</Text>
            </View>
            <Text style={styles.caloriesText}>Calorias: 0</Text>
          </View>
        </View>

        {/* Meal Buttons */}
        <Text style={styles.sectionTitle}>Refeições</Text>
        {meals.map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mealButton}
            onPress={() => router.push(`/meal?mealName=${meal.name}`)}
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

// Estilos
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