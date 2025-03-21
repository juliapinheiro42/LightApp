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
	ID     uint    `gorm:"primaryKey" json:"id"`
	MealID uint    `json:"meal_id"`
	FoodID uint    `json:"food_id"`
	Amount float64 `json:"amount"` // Quantidade em gramas
}
