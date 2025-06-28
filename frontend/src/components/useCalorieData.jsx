import { useMemo } from 'react';

export function useCalorieData(dailyLog, goals) {
    return useMemo(() => {
        if (!dailyLog || !goals) {
            return { consumed: 0, remaining: 2000, goal: 2000, progress: 0 };
        }

        const allMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
        
        const totalCalories = allMeals.reduce((acc, meal) => {
            return acc + (dailyLog[meal] || []).reduce((mealSum, food) => {
                return mealSum + (food.calories || 0);
            }, 0);
        }, 0);

        const remaining = goals.dailyCalories - totalCalories;
        const progress = goals.dailyCalories > 0 ? (totalCalories / goals.dailyCalories) * 100 : 0;

        return {
            consumed: Math.round(totalCalories),
            remaining: Math.round(remaining),
            goal: goals.dailyCalories,
            progress: progress,
        };
    }, [dailyLog, goals]);
}