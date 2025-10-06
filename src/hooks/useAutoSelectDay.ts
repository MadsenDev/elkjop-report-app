import { useEffect, useRef } from 'react';
import useReportStore from '../store';
import type { Day } from '../types';

type DefaultDayPreference = ReturnType<typeof useReportStore>['settings']['display']['defaultDay'];

const explicitDayMap: Record<Exclude<DefaultDayPreference, 'current'>, Day> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

function getCurrentDay(): Day {
  const jsDay = new Date().getDay();
  if (jsDay === 0) {
    return 'Monday';
  }

  const index = jsDay - 1;
  const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[index] ?? 'Monday';
}

function resolvePreferredDay(preference: DefaultDayPreference): Day {
  if (preference === 'current') {
    return getCurrentDay();
  }

  return explicitDayMap[preference] ?? 'Monday';
}

export function useAutoSelectDay(isReady: boolean) {
  const defaultDayPreference = useReportStore((state) => state.settings.display.defaultDay);
  const setSelectedDay = useReportStore((state) => state.setSelectedDay);
  const hasSelected = useRef(false);

  useEffect(() => {
    if (!isReady || hasSelected.current) {
      return;
    }

    const day = resolvePreferredDay(defaultDayPreference);
    setSelectedDay(day);
    hasSelected.current = true;
  }, [defaultDayPreference, isReady, setSelectedDay]);
}
