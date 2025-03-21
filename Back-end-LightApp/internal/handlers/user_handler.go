package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/juliapinheiro42/LightApp/database"
	"github.com/juliapinheiro42/LightApp/internal/models"
)

func CalculateIMC(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	if user.Weight == 0 || user.Height == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Peso e altura precisam ser cadastrados"})
		return
	}

	heightInMeters := user.Height / 100.0
	imc := user.Weight / (heightInMeters * heightInMeters)

	var status string
	switch {
	case imc < 18.5:
		status = "Abaixo do peso"
	case imc >= 18.5 && imc < 24.9:
		status = "Peso normal"
	case imc >= 25 && imc < 29.9:
		status = "Sobrepeso"
	case imc >= 30:
		status = "Obesidade"
	}

	c.JSON(http.StatusOK, gin.H{
		"imc":    imc,
		"status": status,
	})
}

// Cálculo da recomendação calórica
func CalculateCalories(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	if user.Weight == 0 || user.Height == 0 || user.Age == 0 || user.Gender == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Peso, altura, idade e gênero precisam ser cadastrados"})
		return
	}

	var tmb float64
	if user.Gender == "male" {
		tmb = 88.36 + (13.4 * user.Weight) + (4.8 * user.Height) - (5.7 * float64(user.Age))
	} else {
		tmb = 447.6 + (9.2 * user.Weight) + (3.1 * user.Height) - (4.3 * float64(user.Age))
	}

	tdee := tmb * user.ActivityLevel

	var goalCalories float64
	switch user.Goal {
	case "lose":
		goalCalories = tdee * 0.8
	case "gain":
		goalCalories = tdee * 1.15
	default:
		goalCalories = tdee
	}

	c.JSON(http.StatusOK, gin.H{
		"TMB":           tmb,
		"TDEE":          tdee,
		"goal_calories": goalCalories,
		"goal":          user.Goal,
	})
}
func UpdateUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	var updateData models.User
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Weight = updateData.Weight
	user.Height = updateData.Height
	user.Age = updateData.Age
	user.Gender = updateData.Gender
	user.ActivityLevel = updateData.ActivityLevel
	user.Goal = updateData.Goal

	database.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Dados atualizados com sucesso"})
}
