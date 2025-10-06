import { useMemo } from 'react';
import useReportStore from '../store';
import type { Day } from '../types';
import { days } from '../types';

export function useDayProgress(selectedDay: Day) {
  const data = useReportStore((state) => ({
    avsAssignments: state.avsAssignments,
    insuranceAgreements: state.insuranceAgreements,
    precalibratedTVs: state.precalibratedTVs,
    repairTickets: state.repairTickets,
    goals: state.goals,
  }));

  const dayProgresses = useMemo(() => {
    const initial = Object.fromEntries(days.map((day) => [day, 0])) as Record<Day, number>;
    return days.reduce<Record<Day, number>>((acc, day) => {
      const dayIdx = days.indexOf(day);
      const daysUpTo = days.slice(0, dayIdx + 1);

      const totalGM = data.avsAssignments
        .filter((assignment) => daysUpTo.includes(assignment.day))
        .reduce((sum, assignment) => sum + assignment.gm, 0);

      const insuranceAgreementsTotal = data.insuranceAgreements
        .filter((agreement) => daysUpTo.includes(agreement.day))
        .reduce((sum, agreement) => sum + agreement.sold, 0);

      const precalibratedTVsTotal = data.precalibratedTVs
        .filter((completion) => daysUpTo.includes(completion.day))
        .reduce((sum, completion) => sum + completion.completed, 0);

      const repairTicketsTotal = data.repairTickets
        .filter((ticket) => daysUpTo.includes(ticket.day))
        .reduce((sum, ticket) => sum + ticket.completed, 0);

      const avsGoal = data.goals.find((goal) => goal.section === 'AVS')?.goals[dayIdx] ?? 0;
      const insuranceGoal = data.goals.find((goal) => goal.section === 'Insurance Agreements')?.goals[dayIdx] ?? 0;
      const precalibratedGoal = data.goals.find((goal) => goal.section === 'Precalibrated TVs')?.goals[dayIdx] ?? 0;
      const repairGoal = data.goals.find((goal) => goal.section === 'RepairTickets')?.goals[dayIdx] ?? 0;

      const avsProgress = avsGoal ? totalGM / avsGoal : 0;
      const insuranceProgress = insuranceGoal ? insuranceAgreementsTotal / insuranceGoal : 0;
      const precalibratedProgress = precalibratedGoal ? precalibratedTVsTotal / precalibratedGoal : 0;
      const repairProgress = repairGoal ? repairTicketsTotal / repairGoal : 0;

      const progressValues = [avsProgress, insuranceProgress, precalibratedProgress, repairProgress];
      const cappedValues = progressValues.map((value) => Math.min(value, 1));
      const allGoalsMet = progressValues.every((value) => value >= 1);

      const dailyProgress = ((allGoalsMet ? progressValues : cappedValues).reduce((sum, value) => sum + value, 0) / 4) * 100;
      acc[day] = Math.round(dailyProgress);
      return acc;
    }, initial);
  }, [data.avsAssignments, data.goals, data.insuranceAgreements, data.precalibratedTVs, data.repairTickets]);

  return {
    dayProgresses,
    isGoalMet: dayProgresses[selectedDay] >= 100,
  };
}
