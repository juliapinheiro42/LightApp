package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println("Erro ao carregar o arquivo .env, usando valores padrão")
	}
}

var (
	AccessTokenExpire  int
	RefreshTokenExpire int
	CookieDomain       string
	SecureCookie       bool
)

func InitConfig() {
	LoadEnv()

	// Convertendo valores do .env para os tipos corretos
	AccessTokenExpire, _ = strconv.Atoi(os.Getenv("ACCESS_TOKEN_EXPIRE"))
	RefreshTokenExpire, _ = strconv.Atoi(os.Getenv("REFRESH_TOKEN_EXPIRE"))
	CookieDomain = os.Getenv("COOKIE_DOMAIN")
	SecureCookie, _ = strconv.ParseBool(os.Getenv("SECURE_COOKIE"))
}
