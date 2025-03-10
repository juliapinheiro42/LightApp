package handlers

import (
	"net/http"

	"github.com/juliapinheiro42/LightApp/config"
	"github.com/juliapinheiro42/LightApp/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateFood(c *gin.Context) {
	var food models.Food
	if err := c.ShouldBindJSON(&food); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Create(&food)
	c.JSON(http.StatusCreated, food)
}

func GetFoods(c *gin.Context) {
	var foods []models.Food
	config.DB.Find(&foods)
	c.JSON(http.StatusOK, foods)
}

func GetFoodByID(c *gin.Context) {
	var food models.Food
	id := c.Param("id")

	if err := config.DB.First(&food, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado"})
		return
	}

	c.JSON(http.StatusOK, food)
}

func UpdateFood(c *gin.Context) {
	var food models.Food
	id := c.Param("id")

	if err := config.DB.First(&food, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado"})
		return
	}

	if err := c.ShouldBindJSON(&food); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&food)
	c.JSON(http.StatusOK, food)
}

func DeleteFood(c *gin.Context) {
	var food models.Food
	id := c.Param("id")

	if err := config.DB.First(&food, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado"})
		return
	}

	config.DB.Delete(&food)
	c.JSON(http.StatusOK, gin.H{"message": "Alimento deletado com sucesso"})
}
