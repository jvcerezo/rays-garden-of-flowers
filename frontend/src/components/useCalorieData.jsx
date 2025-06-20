import { useMemo } from 'react';

export function useCalorieData(dailyLog, goals) {
    return useMemo(() => {
        if (!dailyLog || !goals) {
            return { consumed: 0, remaining: 2000, goal: 2000, progress: 0, protein: 0, carbs: 0, fat: 0, proteinPercent: 0, carbsPercent: 0, fatPercent: 0 };
        }

        const allMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
        
        const totals = allMeals.reduce((acc, meal) => {
            (dailyLog[meal] || []).forEach(food => {
                acc.calories += food.calories || 0;
                acc.protein += food.protein || 0;
                acc.carbs += food.carbs || 0;
                acc.fat += food.fat || 0;
            });
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        const remaining = goals.dailyCalories - totals.calories;
        const progress = Math.min((totals.calories / goals.dailyCalories) * 100, 100);

        return {
            consumed: Math.round(totals.calories),
            remaining: Math.round(remaining),
            goal: goals.dailyCalories,
            progress: progress,
            protein: Math.round(totals.protein),
            carbs: Math.round(totals.carbs),
            fat: Math.round(totals.fat),
            proteinPercent: Math.min((totals.protein / goals.protein) * 100, 100),
            carbsPercent: Math.min((totals.carbs / goals.carbs) * 100, 100),
            fatPercent: Math.min((totals.fat / goals.fat) * 100, 100),
        };
    }, [dailyLog, goals]);
}