import { Shift, Roster, Business, StaffProfile } from '../types';

export interface CalendarExportOptions {
  roster: Roster;
  business: Business;
  staffList: StaffProfile[];
  filterStaffId?: string; // If provided, only export shifts assigned to this staff member
  includeNotes?: boolean;
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) string
 */
export function generateIcsContent(options: CalendarExportOptions): string {
  const { roster, business, staffList, filterStaffId, includeNotes = true } = options;

  let shiftsToExport = roster.shifts;
  if (filterStaffId) {
    shiftsToExport = shiftsToExport.filter(s => s.assignedStaffIds.includes(filterStaffId));
  }

  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RosterFlow//Workforce Management//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(business.name)} - Work Roster`,
    `X-WR-CALDESC:Work shifts scheduled for ${escapeIcs(roster.name)}`,
    `X-WR-TIMEZONE:${business.timezone.split(' ')[0] || 'UTC'}`
  ];

  shiftsToExport.forEach(shift => {
    const assignedNames = shift.assignedStaffIds
      .map(id => staffList.find(s => s.id === id)?.name || id)
      .join(', ');

    // Format date string to YYYYMMDD
    const dateFormatted = shift.date.replace(/-/g, '');
    const startFormatted = shift.startTime.replace(':', '') + '00';
    const endFormatted = shift.endTime.replace(':', '') + '00';

    const startDateTime = `${dateFormatted}T${startFormatted}`;
    const endDateTime = `${dateFormatted}T${endFormatted}`;

    let description = `Staff Assigned: ${assignedNames || 'Unassigned'}\nRate: ${business.currency}${shift.hourlyRate.toFixed(2)}/hr`;
    if (includeNotes && shift.notes) {
      description += `\nNotes: ${shift.notes}`;
    }

    lines.push(
      'BEGIN:VEVENT',
      `UID:${shift.id}-${dateFormatted}@rosterflow.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${escapeIcs(shift.title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(business.address)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger immediate browser download of the .ics file
 */
export function downloadIcsFile(options: CalendarExportOptions, filename?: string): void {
  const icsContent = generateIcsContent(options);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = filename || `${options.business.slug || 'work'}-roster-${options.roster.weekStart}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a direct "Add to Google Calendar" URL for a single shift
 */
export function generateGoogleCalendarUrl(shift: Shift, business: Business, staffList: StaffProfile[]): string {
  const dateFormatted = shift.date.replace(/-/g, '');
  const startFormatted = shift.startTime.replace(':', '') + '00';
  const endFormatted = shift.endTime.replace(':', '') + '00';

  const dates = `${dateFormatted}T${startFormatted}/${dateFormatted}T${endFormatted}`;
  const title = encodeURIComponent(shift.title);
  const location = encodeURIComponent(business.address);

  const assignedNames = shift.assignedStaffIds
    .map(id => staffList.find(s => s.id === id)?.name || id)
    .join(', ');

  const details = encodeURIComponent(
    `Shift at ${business.name}\nAssigned: ${assignedNames || 'Unassigned'}\nHourly Rate: ${business.currency}${shift.hourlyRate.toFixed(2)}/h`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
