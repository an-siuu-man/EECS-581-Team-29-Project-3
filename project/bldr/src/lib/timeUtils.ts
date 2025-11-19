/**
 * Convert time string (e.g., "13:30" or "1:30 PM") to decimal hours
 */
export function timeToDecimal(timeStr: string): number {
  if (!timeStr) return 0;

  // If already in 24-hour format (e.g., "13:30") or missing AM/PM, parse directly
  if (!/AM|PM/i.test(timeStr)) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes || 0) / 60;
  }

  // Convert from 12-hour format with AM/PM
  const [time, meridian] = timeStr.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (meridian.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (meridian.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours + (minutes || 0) / 60;
}

/**
 * Calculate duration in decimal hours between start and end times
 */
export function calculateDuration(startTime: string, endTime: string): number {
  try {
    const start = timeToDecimal(startTime);
    const end = timeToDecimal(endTime);
    return parseFloat((end - start).toFixed(2));
  } catch {
    return 1; // Default to 1 hour if parsing fails
  }
}

/**
 * Map day abbreviations to full day names
 */
export function mapDayAbbreviation(abbr: string): string {
  const dayMap: { [key: string]: string } = {
    'M': 'Monday',
    'T': 'Tuesday',
    'W': 'Wednesday',
    'R': 'Thursday',
    'F': 'Friday',
    'S': 'Saturday',
    'U': 'Sunday',
  };
  return dayMap[abbr.toUpperCase()] || abbr;
}

/**
 * Parse days string (e.g., "MWF" or "TR") into array of full day names
 */
export function parseDays(daysStr: string): string[] {
  if (!daysStr) return [];
  
  return daysStr
    .split('')
    .map(d => mapDayAbbreviation(d))
    .filter(Boolean);
}
