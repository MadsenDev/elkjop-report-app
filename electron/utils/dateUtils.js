const getWeekDates = (year, week) => {
  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  // Get the first Monday of the year
  const firstMonday = new Date(firstDayOfYear);
  firstMonday.setDate(firstDayOfYear.getDate() + (8 - firstDayOfYear.getDay()) % 7);
  // Calculate the Monday of the target week
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);
  // Calculate the Sunday of the target week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('no-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return {
    monday: formatDate(monday),
    sunday: formatDate(sunday)
  };
};

const getPreviousWeek = (year, week) => {
  if (week === 1) {
    return { year: year - 1, week: 52 };
  }
  return { year, week: week - 1 };
};

module.exports = {
  getWeekDates,
  getPreviousWeek
}; 