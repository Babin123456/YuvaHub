import { describe, it, expect } from 'vitest';
import {
  generateIcsContent,
  formatToIcsDate,
  escapeIcsText,
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  buildYahooCalendarUrl,
  CalendarEventPayload,
} from '../src/utils/calendarExport';

describe('Calendar Export Utilities', () => {
  const sampleEvent: CalendarEventPayload = {
    title: 'HackNITR 5.0 Hackathon',
    description: 'Premier hackathon event with prizes, workshops & mentorship.',
    location: 'Online / Discord',
    url: 'https://yuvahub.dev/opportunities/hacknitr-5',
    startDate: new Date('2026-10-15T10:00:00.000Z'),
    endDate: new Date('2026-10-15T18:00:00.000Z'),
    allDay: false,
  };

  describe('formatToIcsDate', () => {
    it('formats a date to UTC iCalendar format', () => {
      const date = new Date('2026-10-15T10:00:00.000Z');
      const formatted = formatToIcsDate(date);
      expect(formatted).toBe('20261015T100000Z');
    });

    it('formats all-day dates as YYYYMMDD', () => {
      const date = new Date('2026-10-15T00:00:00.000Z');
      const formatted = formatToIcsDate(date, true);
      expect(formatted).toBe('20261015');
    });
  });

  describe('escapeIcsText', () => {
    it('escapes special characters per RFC 5545', () => {
      const input = 'Hello, World; Testing \\ special\nchars';
      const escaped = escapeIcsText(input);
      expect(escaped).toBe('Hello\\, World\\; Testing \\\\ special\\nchars');
    });

    it('handles empty strings gracefully', () => {
      expect(escapeIcsText('')).toBe('');
    });
  });

  describe('generateIcsContent', () => {
    it('produces valid RFC 5545 VCALENDAR structure', () => {
      const ics = generateIcsContent(sampleEvent);
      
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//YuvaHub//Opportunity Calendar 1.0//EN');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('SUMMARY:HackNITR 5.0 Hackathon');
      expect(ics).toContain('DTSTART:20261015T100000Z');
      expect(ics).toContain('DTEND:20261015T180000Z');
      expect(ics).toContain('LOCATION:Online / Discord');
      expect(ics).toContain('URL:https://yuvahub.dev/opportunities/hacknitr-5');
      expect(ics).toContain('BEGIN:VALARM');
      expect(ics).toContain('TRIGGER:-P1D');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('sets default 1 hour end date if omitted', () => {
      const eventWithoutEnd: CalendarEventPayload = {
        title: 'Grant Deadline',
        startDate: new Date('2026-11-01T12:00:00.000Z'),
      };
      const ics = generateIcsContent(eventWithoutEnd);
      expect(ics).toContain('DTSTART:20261101T120000Z');
      expect(ics).toContain('DTEND:20261101T130000Z');
    });
  });

  describe('Web Calendar URLs', () => {
    it('generates valid Google Calendar URL with query parameters', () => {
      const url = buildGoogleCalendarUrl(sampleEvent);
      expect(url).toContain('https://calendar.google.com/calendar/render');
      expect(url).toContain('action=TEMPLATE');
      expect(url).toContain('text=HackNITR+5.0+Hackathon');
      expect(url).toContain('dates=20261015T100000Z%2F20261015T180000Z');
    });

    it('generates valid Microsoft Outlook Calendar URL', () => {
      const url = buildOutlookCalendarUrl(sampleEvent);
      expect(url).toContain('https://outlook.live.com/calendar/0/action/compose');
      expect(url).toContain('subject=HackNITR+5.0+Hackathon');
      expect(url).toContain('rru=addevent');
    });

    it('generates valid Yahoo Calendar URL', () => {
      const url = buildYahooCalendarUrl(sampleEvent);
      expect(url).toContain('https://calendar.yahoo.com/');
      expect(url).toContain('title=HackNITR+5.0+Hackathon');
      expect(url).toContain('st=20261015T100000Z');
    });
  });
});
