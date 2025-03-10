package models

import "gorm.io/gorm"

type Food struct {
	gorm.Model
	Name     string  `json:"name" gorm:"unique"`
	Calories float64 `json:"calories"`
	Proteins float64 `json:"proteins"`
	Carbs    float64 `json:"carbs"`
	Fats     float64 `json:"fats"`
}

type Meal struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	Type   string `json:"type"`
}

type MealItem struct {
	gorm.Model
	MealID uint    `json:"meal_id"`
	FoodID uint    `json:"food_id"`
	Amount float64 `json:"amount"`
}
