const getWeekDates = (year, week) => {
  // Convert to budget year if needed
  const getBudgetYear = (date) => {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    return month < 5 ? year - 1 : year;
  };

  // Get the start date of the budget year
  const getBudgetYearStart = (budgetYear) => {
    return new Date(budgetYear, 4, 1); // May 1st (month is 0-based)
  };

  // Calculate the start date of the week
  const budgetYearStart = getBudgetYearStart(year);
  const weekStartDate = new Date(budgetYearStart);
  weekStartDate.setDate(budgetYearStart.getDate() + (week - 1) * 7);

  // Get the dates for each day of the week
  const getDayDate = (startDate, dayOffset) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayOffset);
    return date.toLocaleDateString('no-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return {
    monday: getDayDate(weekStartDate, 0),
    tuesday: getDayDate(weekStartDate, 1),
    wednesday: getDayDate(weekStartDate, 2),
    thursday: getDayDate(weekStartDate, 3),
    friday: getDayDate(weekStartDate, 4),
    saturday: getDayDate(weekStartDate, 5),
    sunday: getDayDate(weekStartDate, 6)
  };
};

const getCurrentWeekKey = () => {
  const now = new Date();
  
  // Get the budget year (starts May 1st)
  const getBudgetYear = (date) => {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    return month < 5 ? year - 1 : year;
  };

  // Get the week number within the budget year
  const getWeekNumber = (date) => {
    const budgetYear = getBudgetYear(date);
    const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st (month is 0-based)
    
    // If the date is before May 1st, use the previous year's budget
    const startDate = date < budgetYearStart ? new Date(budgetYear - 1, 4, 1) : budgetYearStart;
    
    // Calculate days since budget year start
    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate week number (1-based)
    return Math.floor(daysSinceStart / 7) + 1;
  };

  const budgetYear = getBudgetYear(now);
  const weekNumber = getWeekNumber(now);
  return `${budgetYear}-${weekNumber.toString().padStart(2, '0')}`;
};

const getPreviousWeekKey = (weekKey) => {
  const [year, week] = weekKey.split('-').map(Number);
  
  if (week === 1) {
    // If it's the first week of the budget year, go to the last week of the previous budget year
    const prevYear = year - 1;
    const lastWeek = 52; // Assuming 52 weeks in a year
    return `${prevYear}-${lastWeek.toString().padStart(2, '0')}`;
  }
  
  return `${year}-${(week - 1).toString().padStart(2, '0')}`;
};

module.exports = {
  getWeekDates,
  getCurrentWeekKey,
  getPreviousWeekKey
}; 