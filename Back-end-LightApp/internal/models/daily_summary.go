package models

type DailySummary struct {
	Calories float64 `json:"calories"`
	Proteins float64 `json:"proteins"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
}
