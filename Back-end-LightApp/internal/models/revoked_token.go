package models

import "gorm.io/gorm"

type RevokedToken struct {
	gorm.Model
	Token string `json:"token" gorm:"unique"`
}
