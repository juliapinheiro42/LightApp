import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function WeeklyReportScreen() {
  const [showMacros, setShowMacros] = useState(false); // Estado para alternar entre calorias e macros

  // Dados fictícios de calorias e macros consumidas na semana
  const weeklyData = [
    { day: "Segunda", calories: 1800, protein: 120, carbs: 200, fat: 60 },
    { day: "Terça", calories: 2200, protein: 150, carbs: 250, fat: 80 },
    { day: "Quarta", calories: 1900, protein: 130, carbs: 210, fat: 70 },
    { day: "Quinta", calories: 2100, protein: 140, carbs: 230, fat: 75 },
    { day: "Sexta", calories: 2000, protein: 135, carbs: 220, fat: 72 },
    { day: "Sábado", calories: 2400, protein: 160, carbs: 270, fat: 90 },
    { day: "Domingo", calories: 2300, protein: 155, carbs: 260, fat: 85 },
  ];

  // Calcular totais e médias
  const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);
  const averageCalories = (totalCalories / weeklyData.length).toFixed(0);

  const totalProtein = weeklyData.reduce((sum, day) => sum + day.protein, 0);
  const totalCarbs = weeklyData.reduce((sum, day) => sum + day.carbs, 0);
  const totalFat = weeklyData.reduce((sum, day) => sum + day.fat, 0);

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Relatório Semanal</Text>

      {/* Resumo de Calorias ou Macros */}
      <View style={styles.summaryCard}>
        {showMacros ? (
          <>
            <Text style={styles.summaryTitle}>Totais de Macros na Semana</Text>
            <Text style={styles.summaryValue}>{totalProtein}g Proteína</Text>
            <Text style={styles.summaryValue}>{totalCarbs}g Carboidratos</Text>
            <Text style={styles.summaryValue}>{totalFat}g Gorduras</Text>
          </>
        ) : (
          <>
            <Text style={styles.summaryTitle}>Total de Calorias na Semana</Text>
            <Text style={styles.summaryValue}>{totalCalories} kcal</Text>
            <Text style={styles.summarySubtitle}>Média diária: {averageCalories} kcal</Text>
          </>
        )}
      </View>

      {/* Gráfico de Barras (simulado) */}
      <View style={styles.chartContainer}>
        {weeklyData.map((day, index) => {
          // Calcular porcentagens de cada macro
          const proteinPercentage = (day.protein * 4 / day.calories) * 100; // 1g de proteína = 4 kcal
          const carbsPercentage = (day.carbs * 4 / day.calories) * 100; // 1g de carboidrato = 4 kcal
          const fatPercentage = (day.fat * 9 / day.calories) * 100; // 1g de gordura = 9 kcal

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.bar}>
                {/* Proteína */}
                <View
                  style={[
                    styles.barSegment,
                    {
                      height: `${proteinPercentage}%`,
                      backgroundColor: "#10B981", // Verde para proteína
                    },
                  ]}
                />
                {/* Carboidratos */}
                <View
                  style={[
                    styles.barSegment,
                    {
                      height: `${carbsPercentage}%`,
                      backgroundColor: "#3B82F6", // Azul para carboidratos
                    },
                  ]}
                />
                {/* Gorduras */}
                <View
                  style={[
                    styles.barSegment,
                    {
                      height: `${fatPercentage}%`,
                      backgroundColor: "#EF4444", // Vermelho para gorduras
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day.day}</Text>
            </View>
          );
        })}
      </View>

      {/* Botão para Alternar entre Calorias e Macros */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowMacros(!showMacros)}
      >
        <Text style={styles.toggleButtonText}>
          {showMacros ? "Ver Calorias" : "Ver Macros"}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 24,
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
    marginBottom: 8,
  },
  summaryValue: {
    color: "#10B981",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summarySubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  barContainer: {
    alignItems: "center",
  },
  bar: {
    width: 30,
    height: 150, // Altura fixa para o gráfico
    justifyContent: "flex-end",
    borderRadius: 8,
    overflow: "hidden",
  },
  barSegment: {
    width: "100%",
  },
  barLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 8,
  },
  toggleButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});