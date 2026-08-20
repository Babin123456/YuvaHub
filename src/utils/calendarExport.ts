/**
 * Calendar Export Utilities (RFC 5545 compliant)
 * Generates .ics calendar payloads and direct web calendar export URLs.
 */

export interface CalendarEventPayload {
  title: string;
  description?: string;
  location?: string;
  url?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}

/**
 * Format Date object to RFC 5545 iCalendar UTC string: YYYYMMDDTHHmmssZ
 */
export function formatToIcsDate(date: Date, allDay = false): string {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape text for iCalendar RFC 5545 format
 */
export function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generate RFC 5545 compliant iCalendar string
 */
export function generateIcsContent(event: CalendarEventPayload): string {
  const now = new Date();
  const dtStamp = formatToIcsDate(now);
  const uid = `yuvahub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@yuvahub.dev`;
  
  const start = event.startDate;
  // If no endDate, default to 1 hour after start
  const end = event.endDate || new Date(start.getTime() + 60 * 60 * 1000);
  
  const dtStart = formatToIcsDate(start, event.allDay);
  const dtEnd = formatToIcsDate(end, event.allDay);

  const startProp = event.allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`;
  const endProp = event.allDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YuvaHub//Opportunity Calendar 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    startProp,
    endProp,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }
  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  // Add 1-day & 2-hour reminder alarms
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:YuvaHub Opportunity Deadline Reminder',
    'TRIGGER:-P1D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:YuvaHub Opportunity Deadline Reminder - 2 Hours Remaining',
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.join('\r\n');
}

/**
 * Trigger browser file download for .ics file
 */
export function downloadIcsFile(event: CalendarEventPayload, filename?: string): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-deadline.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build Google Calendar URL
 */
export function buildGoogleCalendarUrl(event: CalendarEventPayload): string {
  const start = formatToIcsDate(event.startDate, event.allDay);
  const end = formatToIcsDate(event.endDate || new Date(event.startDate.getTime() + 3600000), event.allDay);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  });

  if (event.description) {
    let details = event.description;
    if (event.url) details += `\n\nLink: ${event.url}`;
    params.set('details', details);
  } else if (event.url) {
    params.set('details', `Link: ${event.url}`);
  }

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Build Microsoft Outlook / Office 365 Calendar URL
 */
export function buildOutlookCalendarUrl(event: CalendarEventPayload): string {
  const start = event.startDate.toISOString();
  const end = (event.endDate || new Date(event.startDate.getTime() + 3600000)).toISOString();

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start,
    enddt: end,
    allday: event.allDay ? 'true' : 'false',
  });

  if (event.description) {
    params.set('body', event.description + (event.url ? `\n\n${event.url}` : ''));
  }
  if (event.location) {
    params.set('location', event.location);
  }

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

/**
 * Build Yahoo Calendar URL
 */
export function buildYahooCalendarUrl(event: CalendarEventPayload): string {
  const start = formatToIcsDate(event.startDate);
  const end = formatToIcsDate(event.endDate || new Date(event.startDate.getTime() + 3600000));
  
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: start,
    et: end,
  });

  if (event.description) {
    params.set('desc', event.description + (event.url ? ` (${event.url})` : ''));
  }
  if (event.location) {
    params.set('in_loc', event.location);
  }

  return `https://calendar.yahoo.com/?${params.toString()}`;
}
