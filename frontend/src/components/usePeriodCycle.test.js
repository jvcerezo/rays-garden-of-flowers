import { renderHook } from '@testing-library/react';
import { usePeriodCycle } from './usePeriodCycle';
import { addDays, subDays, startOfDay } from 'date-fns';

describe('usePeriodCycle calculation and predictions', () => {
    test('returns initial state when no cycles exist', () => {
        const { result } = renderHook(() => usePeriodCycle([], { cycleLength: 28, periodLength: 5 }));
        expect(result.current.phaseKey).toBe('initial');
        expect(result.current.isPeriod).toBe(false);
        expect(result.current.activeCycleId).toBe(null);
    });

    test('detects an ongoing active period', () => {
        const today = startOfDay(new Date());
        const mockCycles = [
            {
                id: 'cycle-1',
                startDate: subDays(today, 2),
                endDate: null
            }
        ];

        const { result } = renderHook(() => usePeriodCycle(mockCycles));
        expect(result.current.isPeriod).toBe(true);
        expect(result.current.activeCycleId).toBe('cycle-1');
        expect(result.current.phaseKey).toBe('period');
        expect(result.current.primaryText).toBe('Day 3');
        expect(result.current.activeCycleStartDate).toEqual(subDays(today, 2));
    });

    test('detects an ongoing active period even if started more than 21 days ago', () => {
        const today = startOfDay(new Date());
        const mockCycles = [
            {
                id: 'cycle-old-active',
                startDate: subDays(today, 25),
                endDate: null
            }
        ];

        const { result } = renderHook(() => usePeriodCycle(mockCycles));
        expect(result.current.isPeriod).toBe(true);
        expect(result.current.activeCycleId).toBe('cycle-old-active');
        expect(result.current.phaseKey).toBe('period');
        expect(result.current.primaryText).toBe('Day 26');
        expect(result.current.secondaryText).toBe('Period in progress');
    });

    test('calculates smart historical cycle and period averages', () => {
        const today = startOfDay(new Date());
        // 3 consecutive cycles:
        // C1: 60 days ago, lasted 5 days
        // C2: 30 days ago (30d cycle), lasted 6 days
        // C3: 2 days ago (28d cycle), active
        const mockCycles = [
            {
                id: 'cycle-3',
                startDate: subDays(today, 2),
                endDate: null
            },
            {
                id: 'cycle-2',
                startDate: subDays(today, 30),
                endDate: subDays(today, 25) // 6 days period
            },
            {
                id: 'cycle-1',
                startDate: subDays(today, 60),
                endDate: subDays(today, 56) // 5 days period
            }
        ];

        const { result } = renderHook(() => usePeriodCycle(mockCycles, { useSmartPredictions: true }));
        // Cycle intervals: 30 days and 28 days -> avg is 29 days
        expect(result.current.effectiveCycleLength).toBe(29);
        // Period durations: 6 days and 5 days -> avg is 6 days (Math.round(5.5))
        expect(result.current.effectivePeriodLength).toBe(6);
        expect(result.current.stats.isUsingSmartAvg).toBe(true);
    });

    test('detects overdue / late period accurately instead of negative days', () => {
        const today = startOfDay(new Date());
        // Cycle started 35 days ago, ended 30 days ago. Default cycle length = 28 days.
        // It is 7 days late!
        const mockCycles = [
            {
                id: 'cycle-1',
                startDate: subDays(today, 35),
                endDate: subDays(today, 30)
            }
        ];

        const { result } = renderHook(() => usePeriodCycle(mockCycles, { cycleLength: 28, periodLength: 5, useSmartPredictions: false }));
        expect(result.current.isLate).toBe(true);
        expect(result.current.daysLate).toBe(7);
        expect(result.current.primaryText).toBe('7d Late');
        expect(result.current.secondaryText).toBe('Period is 7 days late');
    });

    test('projects future cycles multi-months ahead for calendar', () => {
        const today = startOfDay(new Date());
        const mockCycles = [
            {
                id: 'cycle-1',
                startDate: subDays(today, 10),
                endDate: subDays(today, 5)
            }
        ];

        const { result } = renderHook(() => usePeriodCycle(mockCycles, { cycleLength: 28, periodLength: 5, useSmartPredictions: false }));
        
        // Next period starts: subDays(today, 10) + 28 days = addDays(today, 18)
        const nextPeriodDay = addDays(subDays(today, 10), 28);
        expect(result.current.getDayType(nextPeriodDay)).toBe('predicted-period');

        // Cycle 2 months ahead: subDays(today, 10) + 56 days
        const futurePeriodDay = addDays(subDays(today, 10), 56);
        expect(result.current.getDayType(futurePeriodDay)).toBe('predicted-period');
    });

    test('getDayDetails provides complete inspection info for backtracking', () => {
        const today = startOfDay(new Date());
        const mockCycles = [
            {
                id: 'cycle-1',
                startDate: subDays(today, 10),
                endDate: subDays(today, 6)
            }
        ];

        const { result } = renderHook(() => usePeriodCycle(mockCycles));
        const dayDetails = result.current.getDayDetails(subDays(today, 8));

        expect(dayDetails.type).toBe('period');
        expect(dayDetails.phaseName).toBe('Period Day');
        expect(dayDetails.loggedCycle).not.toBeNull();
        expect(dayDetails.loggedCycle.id).toBe('cycle-1');
    });
});
