package models

import (
	"gorm.io/gorm"
)

type Food struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Calories float64 `json:"calories"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
}

func MigrateFood(db *gorm.DB) error {
	return db.AutoMigrate(&Food{})
}

func (f *Food) Save(db *gorm.DB) error {
	return db.Create(f).Error
}

func GetFoodByName(db *gorm.DB, name string) (*Food, error) {
	var food Food
	if err := db.Where("name ILIKE ?", "%"+name+"%").First(&food).Error; err != nil {
		return nil, err
	}
	return &food, nil
}
func GetFoodByID(db *gorm.DB, id string) (*Food, error) {
	var food Food
	if err := db.First(&food, id).Error; err != nil {
		return nil, err
	}
	return &food, nil
}
