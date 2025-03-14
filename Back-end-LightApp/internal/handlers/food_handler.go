package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/juliapinheiro42/LightApp/internal/models"
)

// GetFoodTACO busca um alimento pelo nome no banco de dados local (TACO)
func GetFoodTACO(c *gin.Context) {
	query := c.Param("query")
	if query == "" {
		query = c.Query("query")
	}

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro de busca ausente"})
		return
	}

	food, err := models.GetFoodByName(query)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado"})
		return
	}

	c.JSON(http.StatusOK, food)
}
