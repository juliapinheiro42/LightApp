export interface FoodItem {
  id: number;
  meal_id: number;
  food_id: number;
  amount: number;
  food: {
    id: number;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}
