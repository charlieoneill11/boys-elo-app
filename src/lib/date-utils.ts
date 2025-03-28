/**
 * Utilities for working with dates and calendar weeks
 */

/**
 * Get the ISO week number from a date
 * @param date Date to get week number from
 * @returns Week number (1-53)
 */
export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get the date range for a given week number and year
 * @param weekNumber Week number (1-53)
 * @param year Year
 * @returns Object with start and end dates
 */
export function getWeekRange(weekNumber: number, year: number = new Date().getFullYear()): { start: Date; end: Date } {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (firstDayOfYear.getDay() > 0 ? firstDayOfYear.getDay() : 7) - 1;
  
  const firstWeekStartDate = new Date(year, 0, 1 - daysOffset);
  const weekStartDate = new Date(firstWeekStartDate);
  weekStartDate.setDate(firstWeekStartDate.getDate() + (weekNumber - 1) * 7);
  
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  
  return { start: weekStartDate, end: weekEndDate };
}

/**
 * Format a date range as a string
 * @param start Start date
 * @param end End date
 * @returns Formatted date range string (e.g., "Mar 31 - Apr 6")
 */
export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Get the current week information
 * @returns Object with week number, year, and date range
 */
export function getCurrentWeek(): { weekNumber: number; year: number; dateRange: string } {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();
  const { start, end } = getWeekRange(weekNumber, year);
  
  return {
    weekNumber,
    year,
    dateRange: formatDateRange(start, end)
  };
} 