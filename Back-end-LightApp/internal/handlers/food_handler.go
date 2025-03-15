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
