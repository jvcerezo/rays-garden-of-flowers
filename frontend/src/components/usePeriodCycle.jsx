import { useMemo } from 'react';
import { addDays, differenceInDays, startOfDay, isWithinInterval, isSameDay } from 'date-fns';

const DEFAULT_SETTINGS = { cycleLength: 28, periodLength: 5 };

export function usePeriodCycle(cycles = [], settings = DEFAULT_SETTINGS) {
    return useMemo(() => {
        const { cycleLength, periodLength } = settings || DEFAULT_SETTINGS;

        if (cycles.length === 0) {
            return {
                phase: 'initial',
                primaryText: 'Log your first period',
                secondaryText: 'Tap the + to begin',
                progress: 0,
                isPeriod: false,
                activeCycleId: null,
                getDayType: () => 'none'
            };
        }

        const today = startOfDay(new Date());
        const lastCycle = cycles[0];
        const cycleStartDate = startOfDay(lastCycle.startDate);
        
        const currentDayInCycle = differenceInDays(today, cycleStartDate) + 1;
        const isPeriodNow = lastCycle.endDate === null && currentDayInCycle > 0 && currentDayInCycle <= periodLength;
        const activeCycleId = lastCycle.endDate === null ? lastCycle.id : null;
        
        const predictedNextPeriodStart = addDays(cycleStartDate, cycleLength);
        const ovulationDay = addDays(predictedNextPeriodStart, -14);
        const fertileWindowStart = addDays(ovulationDay, -5);
        const fertileWindowEnd = ovulationDay;

        const getDayType = (date) => {
            const day = startOfDay(date);
            for (const cycle of cycles) {
                const start = startOfDay(cycle.startDate);
                const end = cycle.endDate ? startOfDay(cycle.endDate) : addDays(start, (settings.periodLength || 5) - 1);
                if (isWithinInterval(day, { start, end })) return 'period';
            }
            if (isWithinInterval(day, { start: predictedNextPeriodStart, end: addDays(predictedNextPeriodStart, periodLength - 1) })) return 'predicted-period';
            if (isSameDay(day, ovulationDay)) return 'ovulation';
            if (isWithinInterval(day, { start: fertileWindowStart, end: addDays(ovulationDay, -1) })) return 'fertile';
            return 'none';
        };
        
        let phase = 'Luteal';
        let primaryText = `Day ${currentDayInCycle}`;
        let secondaryText = `Next period in ${differenceInDays(predictedNextPeriodStart, today)} days`;
        
        if (isPeriodNow) {
            phase = 'Period';
            secondaryText = `of your period`;
        } else if (isWithinInterval(today, { start: fertileWindowStart, end: fertileWindowEnd })) {
            phase = 'Fertile Window';
            if (isSameDay(today, ovulationDay)) {
                primaryText = "Ovulation";
                secondaryText = "Peak fertility";
            } else {
                secondaryText = `Ovulation in ${differenceInDays(ovulationDay, today)} days`;
            }
        } else if (today > addDays(cycleStartDate, periodLength - 1) && today < fertileWindowStart) {
            phase = 'Follicular';
            secondaryText = `Fertile window in ${differenceInDays(fertileWindowStart, today)} days`;
        }
        if (currentDayInCycle < 1) {
            secondaryText = `Next period starts soon`;
        }

        return {
            phase, primaryText, secondaryText,
            progress: (currentDayInCycle / cycleLength) * 100,
            isPeriod: isPeriodNow,
            activeCycleId,
            getDayType,
        };

    }, [cycles, settings]);
}