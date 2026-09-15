export const getCurrentFiscalYear = (currentYear) => {
  const d = new Date();
  const month = d.getMonth(); // 0-based
  
  // If month is Jan, Feb, Mar (0,1,2), then the fiscal year started last year
  const year = month <= 2 ? currentYear - 1 : currentYear;
  const nextYear = year + 1;
  
  // Format: "2023-24"
  return `${year}-${nextYear.toString().substring(2, 4)}`;
};

export const getCurrentMonth = () => new Date().getMonth() + 1;
export const getCurrentYear = () => new Date().getFullYear();
export const getCurrentCalendarMonthName = () => new Date().toLocaleString('default', { month: 'long' });
