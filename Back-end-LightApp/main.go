package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/juliapinheiro42/LightApp/config"
	"github.com/juliapinheiro42/LightApp/internal/handlers"
	"github.com/juliapinheiro42/LightApp/internal/middleware"
	"github.com/juliapinheiro42/LightApp/internal/models"
)

const edamamURL = "https://api.edamam.com/api/food-database/v2/parser"

// uploadImage lida com o upload da imagem e busca o alimento na API do Edamam e no banco TACO
func uploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Falha ao obter a imagem"})
		return
	}

	// Criar diretório temporário, se não existir
	tempDir := "./temp"
	if _, err := os.Stat(tempDir); os.IsNotExist(err) {
		os.Mkdir(tempDir, os.ModePerm)
	}

	// Caminho do arquivo temporário
	filePath := tempDir + "/" + file.Filename
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao salvar a imagem"})
		return
	}
	defer os.Remove(filePath) // Excluir arquivo após o uso

	// Enviar imagem para Edamam
	client := resty.New()
	resp, err := client.R().
		SetFile("image", filePath).
		SetQueryParams(map[string]string{
			"app_id":  os.Getenv("EDAMAM_APP_ID"),
			"app_key": os.Getenv("EDAMAM_API_KEY"),
		}).
		Post(edamamURL)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao chamar a API do Edamam"})
		return
	}

	// Processar resposta da API e buscar no BD local
	foodName, parseErr := handlers.ParseEdamamResponse(resp.String())
	if parseErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar resposta da API"})
		return
	}

	// Buscar no banco de dados do TACO
	foodData, err := models.GetFoodByName(foodName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado no banco local"})
		return
	}

	// Retornar dados do alimento
	c.JSON(http.StatusOK, gin.H{
		"food":     foodData.Name,
		"calories": foodData.Calories,
		"protein":  foodData.Protein,
		"carbs":    foodData.Carbs,
		"fat":      foodData.Fat,
	})
}

func main() {
	config.ConnectDatabase()

	r := gin.Default()

	api := r.Group("/api")
	{
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.POST("/refresh", handlers.RefreshToken)
		api.POST("/logout", handlers.Logout)
		api.POST("/upload", uploadImage)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())

		protected.GET("/protected", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Rota protegida acessada com sucesso"})
		})

		// Rotas para refeições
		protected.POST("/meals", handlers.CreateMeal)
		protected.POST("/meals/items", handlers.AddMealItem)
		protected.GET("/meals/:meal_id/summary", handlers.GetMealSummary)

		// Rotas para cálculo do usuário
		protected.GET("/imc", handlers.CalculateIMC)
		protected.GET("/calories", handlers.CalculateCalories)
		protected.PUT("/user", handlers.UpdateUser)

		// Rota para buscar alimentos do TACO
		protected.GET("/foods/taco/:query", handlers.GetFoodTACO)
	}

	r.Run(":8081")
}
