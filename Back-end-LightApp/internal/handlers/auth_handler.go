package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/juliapinheiro42/LightApp/config"
	"github.com/juliapinheiro42/LightApp/internal/models"
	"github.com/juliapinheiro42/LightApp/internal/utils"
)

// 🚀 Registro de Usuário
func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verifica se o e-mail já está cadastrado
	var existingUser models.User
	if err := config.DB.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail já cadastrado"})
		return
	}

	// Hash da senha
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar hash da senha"})
		return
	}
	user.Password = hashedPassword

	// Salva no banco de dados
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar usuário"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso"})
}

// 🚀 Login
func Login(c *gin.Context) {
	var request models.User
	var user models.User

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Busca o usuário no banco de dados
	if err := config.DB.Where("email = ?", request.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Verifica a senha
	if !utils.CheckPasswordHash(request.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha incorreta"})
		return
	}

	// Gera tokens
	accessToken, err := utils.GenerateAccessToken(user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar refresh token"})
		return
	}

	// Configura cookies
	c.SetCookie("access_token", accessToken, config.AccessTokenExpire, "/", config.CookieDomain, config.SecureCookie, true)
	c.SetCookie("refresh_token", refreshToken, config.RefreshTokenExpire, "/", config.CookieDomain, config.SecureCookie, true)

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login realizado com sucesso!",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// 🚀 Refresh Token
func RefreshToken(c *gin.Context) {
	var request struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verifica se o token foi revogado
	if utils.IsTokenRevoked(request.RefreshToken) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token revogado. Faça login novamente."})
		return
	}

	// Valida o refresh token e gera um novo access token
	email, err := utils.ValidateRefreshToken(request.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token inválido"})
		return
	}

	newAccessToken, err := utils.GenerateAccessToken(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar novo token"})
		return
	}

	// Atualiza o cookie do access token
	c.SetCookie("access_token", newAccessToken, config.AccessTokenExpire, "/", config.CookieDomain, config.SecureCookie, true)

	c.JSON(http.StatusOK, gin.H{"access_token": newAccessToken})
}

// 🚀 Logout
func Logout(c *gin.Context) {
	var request struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.RefreshToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token obrigatório"})
		return
	}

	// Revoga o refresh token
	err := utils.RevokeToken(request.RefreshToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao revogar token"})
		return
	}

	// Remove cookies
	c.SetCookie("access_token", "", -1, "/", config.CookieDomain, config.SecureCookie, true)
	c.SetCookie("refresh_token", "", -1, "/", config.CookieDomain, config.SecureCookie, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logout realizado com sucesso!"})
}
