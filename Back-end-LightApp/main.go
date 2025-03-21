package main

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/juliapinheiro42/LightApp/database"
	"github.com/juliapinheiro42/LightApp/internal/handlers"
	"github.com/juliapinheiro42/LightApp/internal/middleware"
	"github.com/juliapinheiro42/LightApp/internal/models"
)

const edamamURL = "https://api.edamam.com/api/food-database/v2/parser"

func uploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Falha ao obter a imagem"})
		return
	}

	// Criar diretório temporário, se não existir
	tempDir := "./temp"
	err = os.MkdirAll(tempDir, os.ModePerm)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar diretório temporário"})
		return
	}

	// Caminho seguro para o arquivo
	filePath := filepath.Join(tempDir, file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao salvar a imagem"})
		return
	}
	defer func() {
		_ = os.Remove(filePath) // Remover arquivo após processamento
	}()

	// Verificar credenciais da API do Edamam
	appID, appKey := os.Getenv("EDAMAM_APP_ID"), os.Getenv("EDAMAM_API_KEY")
	if appID == "" || appKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Credenciais da API do Edamam não configuradas"})
		return
	}

	// Enviar imagem para Edamam
	client := resty.New()
	resp, err := client.R().
		SetFile("image", filePath).
		SetQueryParams(map[string]string{"app_id": appID, "app_key": appKey}).
		Post(edamamURL)

	if err != nil || resp.StatusCode() != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao chamar a API do Edamam"})
		return
	}

	// Processar resposta da API
	foodName, parseErr := handlers.ParseEdamamResponse(resp.String())
	if parseErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar resposta da API"})
		return
	}

	// Buscar no banco de dados local (TACO)
	foodData, err := models.GetFoodByName(database.DB, foodName)
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
	// Conecta ao banco de dados
	database.ConnectDatabase()

	// Executa as migrações
	if err := models.MigrateFood(database.DB); err != nil {
		panic("Falha ao migrar tabela de alimentos")
	}

	r := gin.Default()

	r.GET("/inspector/network", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Rota /inspector/network acessada com sucesso",
		})
	})

	r.GET("/message", func(c *gin.Context) {
		device := c.Query("device")
		app := c.Query("app")
		clientid := c.Query("clientid")

		c.JSON(http.StatusOK, gin.H{
			"device":   device,
			"app":      app,
			"clientid": clientid,
		})
	})

	r.GET("/inspector/device", func(c *gin.Context) {
		name := c.Query("name")
		app := c.Query("app")
		deviceID := c.Query("device")

		c.JSON(http.StatusOK, gin.H{
			"name":     name,
			"app":      app,
			"deviceID": deviceID,
			"message":  "Rota /inspector/device acessada com sucesso",
		})
	})

	r.GET("/debug/food", func(c *gin.Context) {
		query := c.Query("name")
		foodData, err := models.GetFoodByName(database.DB, query)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Alimento não encontrado"})
			return
		}
		c.JSON(http.StatusOK, foodData)
	})

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
			c.JSON(http.StatusOK, gin.H{"message": "Rota protegida acessada com sucesso"})
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
		protected.GET("/foods/taco/:query", handlers.GetFood)
		protected.GET("/foods/taco/id/:id", handlers.GetFoodByID)

		//Rotas para sumário diário de calorias
		protected.GET("/user/daily-summary", handlers.GetDailySummary)

	}

	r.Run(":8081")

}
