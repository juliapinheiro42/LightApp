package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/juliapinheiro42/LightApp/database"
	"github.com/juliapinheiro42/LightApp/internal/models"
)

func CreateMeal(c *gin.Context) {
	var meal models.Meal
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	meal.UserID = userID.(uint)
	if err := c.ShouldBindJSON(&meal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Create(&meal)
	c.JSON(http.StatusCreated, meal)
}

func AddMealItem(c *gin.Context) {
	var mealItem models.MealItem
	if err := c.ShouldBindJSON(&mealItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var meal models.Meal
	if err := database.DB.First(&meal, mealItem.MealID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Refeição não encontrada"})
		return
	}

	var food models.TacoFood
	if err := database.DB.First(&food, mealItem.FoodID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado no TACO"})
		return
	}

	database.DB.Create(&mealItem)
	c.JSON(http.StatusCreated, gin.H{"message": "Alimento adicionado à refeição!"})
}

func GetMealSummary(c *gin.Context) {
	var mealItems []models.MealItem
	mealID := c.Param("meal_id")

	if err := database.DB.Where("meal_id = ?", mealID).Find(&mealItems).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Refeição não encontrada"})
		return
	}

	var totalCalories, totalProteins, totalCarbs, totalFats float64

	for _, item := range mealItems {
		var food models.TacoFood
		database.DB.First(&food, item.FoodID)

		factor := item.Amount / 100.0
		totalCalories += food.Calories * factor
		totalProteins += food.Proteins * factor
		totalCarbs += food.Carbs * factor
		totalFats += food.Fats * factor
	}

	c.JSON(http.StatusOK, gin.H{
		"calories": totalCalories,
		"proteins": totalProteins,
		"carbs":    totalCarbs,
		"fats":     totalFats,
	})
}

func GetDailySummary(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	var meals []models.Meal
	today := time.Now().Format("2006-01-02")

	if err := database.DB.Where("user_id = ? AND DATE(created_at) = ?", userID, today).Find(&meals).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nenhuma refeição encontrada para hoje"})
		return
	}

	var totalCalories, totalProteins, totalCarbs, totalFats float64

	for _, meal := range meals {
		var mealItems []models.MealItem
		database.DB.Where("meal_id = ?", meal.ID).Find(&mealItems)

		for _, item := range mealItems {
			var food models.TacoFood
			database.DB.First(&food, item.FoodID)

			factor := item.Amount / 100.0
			totalCalories += food.Calories * factor
			totalProteins += food.Proteins * factor
			totalCarbs += food.Carbs * factor
			totalFats += food.Fats * factor
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"date":     today,
		"calories": totalCalories,
		"proteins": totalProteins,
		"carbs":    totalCarbs,
		"fats":     totalFats,
	})
}

func GetWeeklySummary(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	oneWeekAgo := time.Now().AddDate(0, 0, -7)
	today := time.Now()

	dailySummary := make(map[string]map[string]float64)

	for i := 0; i < 7; i++ {
		date := oneWeekAgo.AddDate(0, 0, i).Format("2006-01-02")
		dailySummary[date] = map[string]float64{
			"calories": 0,
			"proteins": 0,
			"carbs":    0,
			"fats":     0,
		}
	}

	var meals []models.Meal
	if err := database.DB.Where("user_id = ? AND DATE(created_at) BETWEEN ? AND ?", userID, oneWeekAgo, today).Find(&meals).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nenhuma refeição encontrada na última semana"})
		return
	}

	for _, meal := range meals {
		date := meal.CreatedAt.Format("2006-01-02")

		var mealItems []models.MealItem
		database.DB.Where("meal_id = ?", meal.ID).Find(&mealItems)

		for _, item := range mealItems {
			var food models.TacoFood
			database.DB.First(&food, item.FoodID)

			factor := item.Amount / 100.0
			dailySummary[date]["calories"] += food.Calories * factor
			dailySummary[date]["proteins"] += food.Proteins * factor
			dailySummary[date]["carbs"] += food.Carbs * factor
			dailySummary[date]["fats"] += food.Fats * factor
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"week_start": oneWeekAgo.Format("2006-01-02"),
		"week_end":   today.Format("2006-01-02"),
		"daily_data": dailySummary,
	})
}
