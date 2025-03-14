package models

import (
	"time"
)

type Meal struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	UserID    uint       `json:"user_id"`
	CreatedAt time.Time  `json:"created_at"`
	Items     []MealItem `gorm:"foreignKey:MealID" json:"items"`
}

type MealItem struct {
	ID     uint     `gorm:"primaryKey" json:"id"`
	MealID uint     `json:"meal_id"`
	FoodID uint     `json:"food_id"`
	Amount float64  `json:"amount"` // Quantidade em gramas
	Food   TacoFood `gorm:"foreignKey:FoodID" json:"food"`
}

// Modelo para alimentos do banco TACO
type TacoFood struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Calories float64 `json:"calories"`
	Proteins float64 `json:"proteins"`
	Carbs    float64 `json:"carbs"`
	Fats     float64 `json:"fats"`
}
