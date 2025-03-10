package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name          string  `json:"name"`
	Email         string  `json:"email" gorm:"unique"`
	Password      string  `json:"password"`
	Weight        float64 `json:"weight"`
	Height        float64 `json:"height"`
	Age           int     `json:"age"`
	Gender        string  `json:"gender"`
	ActivityLevel float64 `json:"activity_level"`
	Goal          string  `json:"goal"`
}
