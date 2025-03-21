package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
)

// EdamamResponse estrutura a resposta da API Edamam
type EdamamResponse struct {
	Hints []struct {
		Food struct {
			Label string `json:"label"`
		} `json:"food"`
	} `json:"hints"`
}

// UploadImageHandler envia uma imagem para a API do Edamam e retorna os alimentos reconhecidos.
func UploadImageHandler(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Falha ao obter a imagem"})
		return
	}

	// Criar diretório temporário se não existir
	tempDir := "./temp"
	if _, err := os.Stat(tempDir); os.IsNotExist(err) {
		os.Mkdir(tempDir, os.ModePerm)
	}

	// Caminho do arquivo temporário
	filePath := filepath.Join(tempDir, file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao salvar a imagem"})
		return
	}
	defer os.Remove(filePath) // Remove o arquivo temporário após o uso

	// Enviar imagem para Edamam
	edamamResponse, err := SendImageToEdamam(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao chamar a API do Edamam"})
		return
	}

	// Processar a resposta da API
	food, err := ParseEdamamResponse(edamamResponse)
	if err != nil || food == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nenhum alimento reconhecido"})
		return
	}

	// Retornar o alimento detectado
	c.JSON(http.StatusOK, gin.H{"food": food})
}

// SendImageToEdamam faz a requisição para a API do Edamam com a imagem
func SendImageToEdamam(filePath string) (string, error) {
	client := resty.New()
	resp, err := client.R().
		SetFile("image", filePath).
		SetQueryParams(map[string]string{
			"app_id":  os.Getenv("EDAMAM_APP_ID"),
			"app_key": os.Getenv("EDAMAM_API_KEY"),
		}).
		Post("https://api.edamam.com/api/food-database/v2/parser")

	if err != nil {
		return "", err
	}

	return resp.String(), nil
}

// ParseEdamamResponse parseia a resposta da API Edamam e retorna o nome do alimento.
func ParseEdamamResponse(response string) (string, error) {
	var result EdamamResponse

	err := json.Unmarshal([]byte(response), &result)
	if err != nil {
		log.Println("Erro ao analisar a resposta:", err)
		return "", err
	}

	if len(result.Hints) > 0 {
		foodName := result.Hints[0].Food.Label
		return foodName, nil
	}

	return "", nil
}
