package models

import (
	"github.com/juliapinheiro42/LightApp/config"
)

// Estrutura dos alimentos no TACO
type Food struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Calories float64 `json:"calories"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
}

// Criar a tabela no banco
func MigrateFood() {
	config.DB.AutoMigrate(&Food{})
}

// Salvar alimento no banco
func (f *Food) Save() error {
	return config.DB.Create(f).Error
}

// Buscar alimento pelo nome
func GetFoodByName(name string) (*Food, error) {
	var food Food
	if err := config.DB.Where("name ILIKE ?", "%"+name+"%").First(&food).Error; err != nil {
		return nil, err
	}
	return &food, nil
}
