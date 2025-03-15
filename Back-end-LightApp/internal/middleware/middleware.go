package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/juliapinheiro42/LightApp/internal/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extrair o token do cabeçalho Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
			c.Abort()
			return
		}

		// Remover o prefixo "Bearer " do token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato do token inválido"})
			c.Abort()
			return
		}

		// Validar o token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verificar o método de assinatura
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return utils.SecretKey, nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado: " + err.Error()})
			c.Abort()
			return
		}

		// Verificar se o token é válido e extrair as claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Verificar se o e-mail está presente nas claims
			email, ok := claims["email"].(string)
			if !ok || email == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido: e-mail não encontrado"})
				c.Abort()
				return
			}

			// Adicionar informações ao contexto
			c.Set("email", email)

			// Adicionar user_id ao contexto (se presente nas claims)
			if userID, ok := claims["user_id"].(float64); ok {
				c.Set("user_id", uint(userID))
			}

			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
		}
	}
}
