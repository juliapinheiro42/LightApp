package main

import (
	"github.com/gin-gonic/gin"
	"github.com/juliapinheiro42/LightApp/config"
	"github.com/juliapinheiro42/LightApp/internal/handlers"
	"github.com/juliapinheiro42/LightApp/internal/middleware"
)

func main() {
	config.ConnectDatabase()
	r := gin.Default()

	api := r.Group("/api")
	{
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.POST("/refresh", handlers.RefreshToken)
		api.POST("/logout", handlers.Logout)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		protected.GET("/protected", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Rota protegida acessada com sucesso"})
		})

		// Rotas para refeições
		protected.POST("/meals", handlers.CreateMeal)
		protected.POST("/meals/items", handlers.AddMealItem)
		protected.GET("/meals/:meal_id/summary", handlers.GetMealSummary)

		// 🔹 Novas rotas para usuário
		protected.GET("/imc", handlers.CalculateIMC)
		protected.GET("/calories", handlers.CalculateCalories)
		protected.PUT("/user", handlers.UpdateUser)
	}

	r.Run(":8081")
}
