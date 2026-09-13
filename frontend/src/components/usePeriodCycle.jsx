import { useMemo } from 'react';
import {
    addDays,
    differenceInDays,
    startOfDay,
    isWithinInterval,
    isSameDay,
    isBefore,
    isAfter
} from 'date-fns';

const DEFAULT_SETTINGS = {
    cycleLength: 28,
    periodLength: 5,
    useSmartPredictions: true
};

/**
 * Enhanced cycle calculator supporting:
 * - Smart historical averages for cycle length & period length
 * - Multi-month projection (periods, fertile windows, ovulation)
 * - Safe handling of overdue / late cycles
 * - Robust active period detection
 * - Day details lookup for calendar backtracking & inspection
 */
export function usePeriodCycle(cycles = [], settings = DEFAULT_SETTINGS) {
    return useMemo(() => {
        const mergedSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) };

        // Ensure cycles are sorted descending (latest first)
        const sortedCycles = [...cycles]
            .filter(c => c && c.startDate)
            .map(c => ({
                ...c,
                startDate: startOfDay(c.startDate),
                endDate: c.endDate ? startOfDay(c.endDate) : null
            }))
            .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

        // 1. Calculate smart historical averages from completed/valid cycles
        const validCycleLengths = [];
        const validPeriodLengths = [];

        // Chronological order for consecutive intervals
        const chronoCycles = [...sortedCycles].reverse();

        for (let i = 0; i < chronoCycles.length - 1; i++) {
            const current = chronoCycles[i];
            const next = chronoCycles[i + 1];
            const lengthBetweenStarts = differenceInDays(next.startDate, current.startDate);
            // Filter realistic cycle range: between 18 and 60 days
            if (lengthBetweenStarts >= 18 && lengthBetweenStarts <= 60) {
                validCycleLengths.push(lengthBetweenStarts);
            }
        }

        sortedCycles.forEach(c => {
            if (c.endDate) {
                const duration = differenceInDays(c.endDate, c.startDate) + 1;
                if (duration >= 1 && duration <= 14) {
                    validPeriodLengths.push(duration);
                }
            }
        });

        const calculatedAvgCycleLength = validCycleLengths.length > 0
            ? Math.round(validCycleLengths.reduce((a, b) => a + b, 0) / validCycleLengths.length)
            : null;

        const calculatedAvgPeriodLength = validPeriodLengths.length > 0
            ? Math.round(validPeriodLengths.reduce((a, b) => a + b, 0) / validPeriodLengths.length)
            : null;

        const useSmart = mergedSettings.useSmartPredictions !== false;

        const effectiveCycleLength = (useSmart && calculatedAvgCycleLength)
            ? calculatedAvgCycleLength
            : (Number(mergedSettings.cycleLength) || 28);

        const effectivePeriodLength = (useSmart && calculatedAvgPeriodLength)
            ? calculatedAvgPeriodLength
            : (Number(mergedSettings.periodLength) || 5);

        const stats = {
            avgCycleLength: calculatedAvgCycleLength || effectiveCycleLength,
            avgPeriodLength: calculatedAvgPeriodLength || effectivePeriodLength,
            isUsingSmartAvg: useSmart && Boolean(calculatedAvgCycleLength),
            totalCycles: sortedCycles.length,
            recordedCycleCount: validCycleLengths.length
        };

        // If no cycles exist yet
        if (sortedCycles.length === 0) {
            return {
                phase: 'Initial',
                phaseKey: 'initial',
                phaseLabel: 'No Cycles Logged',
                primaryText: 'Welcome',
                secondaryText: 'Tap + to log your first period',
                progress: 0,
                isPeriod: false,
                isLate: false,
                daysLate: 0,
                daysUntilNext: null,
                activeCycleId: null,
                activeCycle: null,
                stats,
                effectiveCycleLength,
                effectivePeriodLength,
                sortedCycles: [],
                getDayType: () => 'none',
                getDayDetails: (date) => ({
                    date,
                    type: 'none',
                    phaseName: 'No Data',
                    phaseEmoji: '🌸',
                    cycleDay: null,
                    description: 'No cycle records logged yet. Tap + to start tracking.',
                    loggedCycle: null
                })
            };
        }

        const today = startOfDay(new Date());
        const lastCycle = sortedCycles[0];
        const cycleStartDate = lastCycle.startDate;

        const currentDayInCycle = differenceInDays(today, cycleStartDate) + 1;

        // Active period detection:
        // Period is active if endDate is null and cycle started within reasonable time (< 21 days)
        const isPeriodNow = lastCycle.endDate === null && currentDayInCycle > 0 && currentDayInCycle <= 21;
        const activeCycleId = lastCycle.endDate === null ? lastCycle.id : null;

        // Predicted next period based on last cycle
        const predictedNextPeriodStart = addDays(cycleStartDate, effectiveCycleLength);
        const daysUntilNextPeriod = differenceInDays(predictedNextPeriodStart, today);
        const isOverdue = !isPeriodNow && daysUntilNextPeriod < 0;
        const daysLate = isOverdue ? Math.abs(daysUntilNextPeriod) : 0;

        // Ovulation & fertile window calculation for current cycle
        const ovulationDay = addDays(predictedNextPeriodStart, -14);
        const fertileWindowStart = addDays(ovulationDay, -5);
        const fertileWindowEnd = ovulationDay;

        // Multi-cycle future projections (up to 6 cycles ahead) for calendar rendering
        const futureProjections = [];
        for (let k = 1; k <= 6; k++) {
            const fStart = addDays(cycleStartDate, k * effectiveCycleLength);
            const fEnd = addDays(fStart, effectivePeriodLength - 1);
            const nextFStart = addDays(cycleStartDate, (k + 1) * effectiveCycleLength);
            const fOvulation = addDays(nextFStart, -14);
            const fFertileStart = addDays(fOvulation, -5);
            const fFertileEnd = fOvulation;

            futureProjections.push({
                periodStart: fStart,
                periodEnd: fEnd,
                ovulation: fOvulation,
                fertileStart: fFertileStart,
                fertileEnd: fFertileEnd
            });
        }

        // Determine calendar tile type for any date
        const getDayType = (date) => {
            const day = startOfDay(date);

            // 1. Check logged periods first (highest priority)
            for (const cycle of sortedCycles) {
                const start = cycle.startDate;
                const end = cycle.endDate ? cycle.endDate : (
                    cycle.id === activeCycleId && isBefore(day, addDays(start, effectivePeriodLength))
                        ? addDays(start, effectivePeriodLength - 1)
                        : (cycle.endDate || start)
                );

                if (isWithinInterval(day, { start, end })) {
                    return 'period';
                }
            }

            // 2. Check future projections
            for (const proj of futureProjections) {
                if (isWithinInterval(day, { start: proj.periodStart, end: proj.periodEnd })) {
                    return 'predicted-period';
                }
                if (isSameDay(day, proj.ovulation)) {
                    return 'ovulation';
                }
                if (isWithinInterval(day, { start: proj.fertileStart, end: addDays(proj.ovulation, -1) })) {
                    return 'fertile';
                }
            }

            // 3. Current cycle fertile window & ovulation if not already past
            if (isSameDay(day, ovulationDay)) return 'ovulation';
            if (isWithinInterval(day, { start: fertileWindowStart, end: addDays(ovulationDay, -1) })) return 'fertile';

            return 'none';
        };

        // Detailed day inspection helper for day detail drawer & backtracking
        const getDayDetails = (date) => {
            const day = startOfDay(date);
            const dayType = getDayType(day);

            // Check if day matches any logged cycle
            const matchingCycle = sortedCycles.find(c => {
                const end = c.endDate ? c.endDate : addDays(c.startDate, effectivePeriodLength - 1);
                return isWithinInterval(day, { start: c.startDate, end });
            });

            const dayInCycle = currentDayInCycle > 0 ? differenceInDays(day, cycleStartDate) + 1 : null;

            let phaseName = 'Regular Day';
            let phaseEmoji = '🌿';
            let description = 'Baseline phase. A great day for self-care, mindfulness, and healthy routines.';

            if (dayType === 'period') {
                phaseName = 'Period Day';
                phaseEmoji = '🌸';
                const periodDayNum = matchingCycle ? differenceInDays(day, matchingCycle.startDate) + 1 : 1;
                description = `Logged cycle: Day ${periodDayNum} of period. Rest, warm teas, and gentle movement help replenish your body.`;
            } else if (dayType === 'predicted-period') {
                phaseName = 'Predicted Period';
                phaseEmoji = '🔮';
                description = 'Projected period date based on your cycle average. Keep supplies handy.';
            } else if (dayType === 'ovulation') {
                phaseName = 'Peak Ovulation';
                phaseEmoji = '🥚';
                description = 'Peak fertility day. Energy and confidence are often at their monthly peak!';
            } else if (dayType === 'fertile') {
                phaseName = 'Fertile Window';
                phaseEmoji = '✨';
                description = 'High chance of conception. Estrogen is rising, and energy levels are climbing.';
            } else if (isAfter(day, cycleStartDate) && isBefore(day, fertileWindowStart)) {
                phaseName = 'Follicular Phase';
                phaseEmoji = '🌱';
                description = 'Post-period renewal phase. Ideal time for new projects, creative plans, and workouts.';
            } else if (isAfter(day, ovulationDay) && isBefore(day, predictedNextPeriodStart)) {
                phaseName = 'Luteal Phase';
                phaseEmoji = '🌙';
                description = 'Progesterone dominates. Nurture yourself, prioritize cozy sleep, and honor your cravings.';
            } else if (isAfter(day, predictedNextPeriodStart)) {
                phaseName = 'Overdue Cycle';
                phaseEmoji = '⏳';
                description = 'Past expected period start. Variations of a few days are completely normal.';
            }

            return {
                date: day,
                type: dayType,
                phaseName,
                phaseEmoji,
                dayInCycle,
                description,
                loggedCycle: matchingCycle || null,
                isToday: isSameDay(day, today),
                isPast: isBefore(day, today),
                isFuture: isAfter(day, today)
            };
        };

        // Determine current phase for today
        let phase = 'Luteal';
        let phaseKey = 'luteal';
        let phaseLabel = 'Luteal Phase';
        let primaryText = `Day ${currentDayInCycle}`;
        let secondaryText = `Next period in ${daysUntilNextPeriod} ${daysUntilNextPeriod === 1 ? 'day' : 'days'}`;

        if (isPeriodNow) {
            phase = 'Period';
            phaseKey = 'period';
            phaseLabel = 'Period Day';
            primaryText = `Day ${currentDayInCycle}`;
            secondaryText = 'Period in progress';
        } else if (isOverdue) {
            phase = 'Late';
            phaseKey = 'late';
            phaseLabel = 'Late / Delayed';
            primaryText = daysLate === 0 ? 'Today' : `${daysLate}d Late`;
            secondaryText = daysLate === 0 ? 'Period expected today' : `Period is ${daysLate} days late`;
        } else if (isWithinInterval(today, { start: fertileWindowStart, end: fertileWindowEnd })) {
            phase = 'Fertile Window';
            phaseKey = 'fertile-window';
            phaseLabel = 'Fertile Window';
            if (isSameDay(today, ovulationDay)) {
                phase = 'Ovulation';
                phaseKey = 'ovulation-day';
                phaseLabel = 'Ovulation Day';
                primaryText = 'Ovulation';
                secondaryText = 'Peak fertility today';
            } else {
                const daysToOvulation = differenceInDays(ovulationDay, today);
                primaryText = `Day ${currentDayInCycle}`;
                secondaryText = `Ovulation in ${daysToOvulation} ${daysToOvulation === 1 ? 'day' : 'days'}`;
            }
        } else if (today > addDays(cycleStartDate, effectivePeriodLength - 1) && today < fertileWindowStart) {
            phase = 'Follicular';
            phaseKey = 'follicular';
            phaseLabel = 'Follicular Phase';
            const daysToFertile = differenceInDays(fertileWindowStart, today);
            primaryText = `Day ${currentDayInCycle}`;
            secondaryText = `Fertile window in ${daysToFertile} ${daysToFertile === 1 ? 'day' : 'days'}`;
        }

        if (currentDayInCycle < 1) {
            primaryText = 'Upcoming';
            secondaryText = 'Cycle starts soon';
        }

        // Calculate progress percentage through cycle
        const rawProgress = (currentDayInCycle / effectiveCycleLength) * 100;
        const progress = Math.min(100, Math.max(0, rawProgress));

        return {
            phase,
            phaseKey,
            phaseLabel,
            primaryText,
            secondaryText,
            progress,
            isPeriod: isPeriodNow,
            isLate: isOverdue,
            daysLate,
            daysUntilNext: daysUntilNextPeriod,
            activeCycleId,
            activeCycle: isPeriodNow ? lastCycle : null,
            currentDayInCycle,
            predictedNextPeriodStart,
            ovulationDay,
            fertileWindowStart,
            fertileWindowEnd,
            effectiveCycleLength,
            effectivePeriodLength,
            stats,
            sortedCycles,
            getDayType,
            getDayDetails
        };
    }, [cycles, settings]);
}