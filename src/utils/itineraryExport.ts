import { ConnectedTripPlan } from '../types';

/**
 * Generates an iCalendar (.ics) file content from a ConnectedTripPlan
 * and triggers direct browser download.
 */
export function downloadItineraryICS(plan: ConnectedTripPlan) {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

  const formatICSDate = (dateStr: string, timeStr: string) => {
    // dateStr e.g. "2026-09-15", timeStr e.g. "08:30 AM" or "04:30 PM"
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours = 9;
    let minutes = 0;

    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const meridian = (match[3] || '').toUpperCase();
        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
      }
    }

    const d = new Date(year, month - 1, day, hours, minutes);
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aarambh Heritage//Connected Travel Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Aarambh Yatra - ${plan.title}`,
  ];

  plan.days.forEach((day) => {
    const dayDate = day.date || plan.startDate;
    day.activities.forEach((act, actIdx) => {
      const dtStart = formatICSDate(dayDate, act.time);
      // Duration in minutes
      const durMin = act.durationMinutes || 90;
      const [year, month, dayNum] = dayDate.split('-').map(Number);
      const startMatch = act.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      let h = 9, m = 0;
      if (startMatch) {
        h = parseInt(startMatch[1], 10);
        m = parseInt(startMatch[2], 10);
        if ((startMatch[3] || '').toUpperCase() === 'PM' && h < 12) h += 12;
        if ((startMatch[3] || '').toUpperCase() === 'AM' && h === 12) h = 0;
      }
      const endDate = new Date(year, month - 1, dayNum, h, m + durMin);
      const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:aarambh-${plan.id}-d${day.dayNumber}-a${actIdx}-${Date.now()}@aarambh.bharat`,
        `DTSTAMP:${dtStart}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${act.placeTitle} (${act.culturalCategory})`,
        `DESCRIPTION:${act.description.replace(/\n/g, '\\n')}`,
        `LOCATION:${act.placeTitle}, ${plan.toLocation.placeName}, India`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aarambh_Yatra_${plan.toLocation.placeName.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Currency rates relative to INR
 */
export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; name: string }> = {
  INR: { symbol: '₹', rate: 1.0, name: 'Indian Rupee' },
  USD: { symbol: '$', rate: 0.012, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.011, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.0095, name: 'British Pound' },
  AED: { symbol: 'د.إ', rate: 0.044, name: 'UAE Dirham' },
  SGD: { symbol: 'S$', rate: 0.016, name: 'Singapore Dollar' },
};

export function convertFromINR(amountINR: number, currency: string): string {
  const meta = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
  const converted = amountINR * meta.rate;
  if (currency === 'INR') {
    return `${meta.symbol}${amountINR.toLocaleString('en-IN')}`;
  }
  return `${meta.symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
