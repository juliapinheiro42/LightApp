package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/juliapinheiro42/LightApp/database"
	"github.com/juliapinheiro42/LightApp/internal/models"
)

func GetFood(c *gin.Context) {
	name := c.Param("name")

	// Busca o alimento pelo nome
	food, err := models.GetFoodByName(database.DB, name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado"})
		return
	}

	c.JSON(http.StatusOK, food)
}

func GetFoodByID(c *gin.Context) {
	id := c.Param("id")

	// Busca o alimento pelo ID
	food, err := models.GetFoodByID(database.DB, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado"})
		return
	}

	c.JSON(http.StatusOK, food)
}
