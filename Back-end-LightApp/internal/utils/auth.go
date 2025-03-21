package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/juliapinheiro42/LightApp/database"
	"github.com/juliapinheiro42/LightApp/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var SecretKey = []byte("mYv3RyS3cr3tK3y!@#-WithMoreEntropy-9821374hd8a3")
var RefreshSecretKey = []byte("AnotherSecretKeyForRefreshTokens-9812734")

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateAccessToken(userID uint, email string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"iat":     time.Now().Unix(),
		"jti":     uuid.New().String(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(SecretKey)
}

func GenerateRefreshToken(userID uint, email string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
		"iat":     time.Now().Unix(),
		"jti":     uuid.New().String(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(RefreshSecretKey)
}

func ValidateRefreshToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return RefreshSecretKey, nil
	})

	if err != nil || !token.Valid {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", err
	}

	email, ok := claims["email"].(string)
	if !ok {
		return "", err
	}

	return email, nil
}

func RevokeToken(token string) error {
	revokedToken := models.RevokedToken{Token: token}
	result := database.DB.Create(&revokedToken)
	return result.Error
}

func IsTokenRevoked(token string) bool {
	var revoked models.RevokedToken
	result := database.DB.Where("token = ?", token).First(&revoked)
	return result.RowsAffected > 0
}
