import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Roster, Business, StaffProfile, DayOfWeek, Shift } from '../types';
import { calculateShiftHours } from './aiScheduler';

export interface PdfExportOptions {
  roster: Roster;
  business: Business;
  staffList: StaffProfile[];
  includeCosts?: boolean;
  filterStaffId?: string; // 'all' or specific staff ID
  layout?: 'matrix' | 'detailed' | 'both';
}

const DAYS_ORDER: { key: DayOfWeek; label: string; dateNum: number; fullDate: string }[] = [
  { key: 'mon', label: 'Monday', dateNum: 5, fullDate: 'Monday, Oct 5' },
  { key: 'tue', label: 'Tuesday', dateNum: 6, fullDate: 'Tuesday, Oct 6' },
  { key: 'wed', label: 'Wednesday', dateNum: 7, fullDate: 'Wednesday, Oct 7' },
  { key: 'thu', label: 'Thursday', dateNum: 8, fullDate: 'Thursday, Oct 8' },
  { key: 'fri', label: 'Friday', dateNum: 9, fullDate: 'Friday, Oct 9' },
  { key: 'sat', label: 'Saturday', dateNum: 10, fullDate: 'Saturday, Oct 10' },
  { key: 'sun', label: 'Sunday', dateNum: 11, fullDate: 'Sunday, Oct 11' }
];

export function exportWeeklyRosterPdf({
  roster,
  business,
  staffList,
  includeCosts = true,
  filterStaffId = 'all',
  layout = 'both'
}: PdfExportOptions) {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor: [number, number, number] = [25, 67, 145]; // Harbor Blue #194391
  const darkNavy: [number, number, number] = [15, 41, 90];
  const mutedText: [number, number, number] = [100, 116, 139];
  const lightBg: [number, number, number] = [248, 250, 252];
  const borderLight: [number, number, number] = [226, 232, 240];

  // Filter shifts if a specific staff member is selected
  const activeStaff = staffList.find(s => s.id === filterStaffId);
  const shiftsToExport = filterStaffId && filterStaffId !== 'all'
    ? roster.shifts.filter(s => s.assignedStaffIds.includes(filterStaffId))
    : roster.shifts;

  // Filter staff list to only relevant staff if filtered
  const relevantStaff = filterStaffId && filterStaffId !== 'all'
    ? staffList.filter(s => s.id === filterStaffId)
    : staffList;

  // Calculate high-level summary KPIs
  let totalHours = 0;
  let totalCost = 0;
  const assignedStaffSet = new Set<string>();

  shiftsToExport.forEach(shift => {
    const hours = calculateShiftHours(shift.startTime, shift.endTime);
    const assignedCount = shift.assignedStaffIds.length;
    
    // For hours, count total person-hours
    totalHours += hours * (assignedCount > 0 ? assignedCount : shift.requiredCount);
    
    // Cost calculation
    const shiftCost = shift.assignedStaffIds.reduce((sum, stId) => {
      const staffMember = staffList.find(s => s.id === stId);
      const rate = staffMember?.hourlyRate || shift.hourlyRate || 22;
      return sum + hours * rate;
    }, 0);
    totalCost += shiftCost > 0 ? shiftCost : (hours * (shift.hourlyRate || 22) * shift.requiredCount);

    shift.assignedStaffIds.forEach(id => assignedStaffSet.add(id));
  });

  // 1. Top Brand Banner Accent Line
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 5, 'F');

  let currentY = 14;

  // 2. Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...darkNavy);
  doc.text(business.name || 'RosterFlow Workspace', 14, currentY);

  // Status badge on right
  const statusLabel = roster.status === 'published' ? 'PUBLISHED SCHEDULE' : 'DRAFT ROSTER';
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  if (roster.status === 'published') {
    doc.setFillColor(220, 252, 231); // emerald-100
    doc.setTextColor(21, 128, 61); // emerald-700
  } else {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setTextColor(180, 83, 9); // amber-700
  }
  doc.roundedRect(pageWidth - 62, currentY - 5, 48, 7, 2, 2, 'F');
  doc.text(statusLabel, pageWidth - 38, currentY - 0.5, { align: 'center' });

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('WEEKLY ROSTER SCHEDULE', 14, currentY);

  // Date period & print time
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  const weekLabel = `Schedule Period: Oct 05, 2026 – Oct 11, 2026 (${roster.name})`;
  doc.text(weekLabel, 14, currentY + 4.5);

  const printTime = `Exported: ${new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} • Timezone: ${business.timezone || 'UTC'}`;
  doc.text(printTime, pageWidth - 14, currentY + 4.5, { align: 'right' });

  currentY += 10;

  // 3. Compact Summary KPI Strip
  const kpiWidth = (pageWidth - 28 - (3 * 4)) / 4;
  const kpiHeight = 12;
  const kpiItems = [
    { label: 'TOTAL SHIFTS', value: `${shiftsToExport.length} Shifts` },
    { label: 'SCHEDULED HOURS', value: `${totalHours.toFixed(1)} hrs` },
    { label: 'STAFF SCHEDULED', value: `${assignedStaffSet.size} Active Members` },
    ...(includeCosts ? [{ label: 'EST. PAYROLL', value: `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }] : [{ label: 'COVERAGE', value: `${shiftsToExport.filter(s => s.assignedStaffIds.length >= s.requiredCount).length}/${shiftsToExport.length} Full` }])
  ];

  kpiItems.forEach((kpi, idx) => {
    const x = 14 + idx * (kpiWidth + 4);
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(x, currentY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedText);
    doc.text(kpi.label, x + 4, currentY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkNavy);
    doc.text(kpi.value, x + 4, currentY + 9.5);
  });

  currentY += kpiHeight + 6;

  // ==========================================
  // TABLE 1: WEEKLY MATRIX (STAFF X DAYS)
  // ==========================================
  if (layout === 'matrix' || layout === 'both') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('1. Team Weekly Schedule Matrix (Wall Grid)', 14, currentY);
    currentY += 3;

    // Headers for Matrix
    const matrixHead = [
      [
        'Staff Member',
        'Role',
        'Mon (Oct 5)',
        'Tue (Oct 6)',
        'Wed (Oct 7)',
        'Thu (Oct 8)',
        'Fri (Oct 9)',
        'Sat (Oct 10)',
        'Sun (Oct 11)',
        'Total'
      ]
    ];

    // Build rows for each staff member
    const matrixBody = relevantStaff.map(st => {
      let staffWeekHours = 0;
      const dayCells = DAYS_ORDER.map(d => {
        // Find shifts for this day assigned to this staff
        const staffShifts = roster.shifts.filter(
          s => s.day === d.key && s.assignedStaffIds.includes(st.id)
        );

        if (staffShifts.length === 0) {
          return 'OFF';
        }

        return staffShifts.map(s => {
          const h = calculateShiftHours(s.startTime, s.endTime);
          staffWeekHours += h;
          // Format: 08:00-16:00
          // (Title)
          return `${s.startTime}-${s.endTime}\n${s.title}`;
        }).join('\n\n');
      });

      return [
        st.name,
        st.jobTitle || 'Staff',
        ...dayCells,
        `${staffWeekHours.toFixed(1)}h`
      ];
    });

    // Add unassigned row if there are unassigned shifts
    const unassignedShifts = roster.shifts.filter(s => s.assignedStaffIds.length < s.requiredCount);
    if (unassignedShifts.length > 0 && filterStaffId === 'all') {
      const unassignedDayCells = DAYS_ORDER.map(d => {
        const openShifts = unassignedShifts.filter(s => s.day === d.key);
        if (openShifts.length === 0) return '—';
        return openShifts.map(s => {
          const remaining = s.requiredCount - s.assignedStaffIds.length;
          return `⚠️ ${s.startTime}-${s.endTime}\n${s.title} (${remaining} open)`;
        }).join('\n\n');
      });

      matrixBody.push([
        '⚠️ Open / Unassigned',
        'Open Pool',
        ...unassignedDayCells,
        `${unassignedShifts.reduce((acc, s) => acc + calculateShiftHours(s.startTime, s.endTime) * (s.requiredCount - s.assignedStaffIds.length), 0).toFixed(1)}h`
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      head: matrixHead,
      body: matrixBody,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        valign: 'middle',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold', halign: 'left' },
        1: { cellWidth: 24, fontSize: 6.5, textColor: [71, 85, 105], halign: 'left' },
        2: { cellWidth: 27, halign: 'center' },
        3: { cellWidth: 27, halign: 'center' },
        4: { cellWidth: 27, halign: 'center' },
        5: { cellWidth: 27, halign: 'center' },
        6: { cellWidth: 27, halign: 'center' },
        7: { cellWidth: 27, halign: 'center' },
        8: { cellWidth: 27, halign: 'center' },
        9: { cellWidth: 18, fontStyle: 'bold', halign: 'center', fillColor: [241, 245, 249] }
      },
      didParseCell: (data) => {
        // Highlight 'OFF' with lighter muted color
        if (data.section === 'body' && data.cell.raw === 'OFF') {
          data.cell.styles.textColor = [160, 174, 192];
          data.cell.styles.fontSize = 6.5;
        }
        // Highlight open unassigned row
        if (data.section === 'body' && data.row.index === matrixBody.length - 1 && unassignedShifts.length > 0 && filterStaffId === 'all') {
          data.cell.styles.textColor = [194, 65, 12];
          data.cell.styles.fillColor = [255, 247, 237];
        }
      },
      margin: { left: 14, right: 14 }
    });

    // @ts-expect-error - jspdf-autotable extends jsPDF instance with lastAutoTable
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // ==========================================
  // TABLE 2: DAY-BY-DAY SHIFT DETAILS
  // ==========================================
  if (layout === 'detailed' || layout === 'both') {
    // If not enough room on current page, start new page
    if (currentY > pageHeight - 50) {
      doc.addPage();
      // Add brand accent to new page
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 5, 'F');
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('2. Day-by-Day Shift Breakdown & Coverage', 14, currentY);
    currentY += 3;

    const detailedHead = [
      [
        'Day & Date',
        'Shift Title',
        'Time & Hours',
        'Assigned Staff Member(s)',
        'Coverage',
        ...(includeCosts ? ['Hourly / Est. Cost'] : []),
        'Notes'
      ]
    ];

    // Sort shifts by day order, then start time
    const sortedShifts = [...shiftsToExport].sort((a, b) => {
      const dayOrder = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
      if (dayOrder[a.day] !== dayOrder[b.day]) {
        return dayOrder[a.day] - dayOrder[b.day];
      }
      return a.startTime.localeCompare(b.startTime);
    });

    const detailedBody = sortedShifts.map(s => {
      const dayInfo = DAYS_ORDER.find(d => d.key === s.day);
      const dayDisplay = `${dayInfo?.label || s.day}\n${dayInfo?.fullDate || ''}`;
      const hours = calculateShiftHours(s.startTime, s.endTime);
      const timeDisplay = `${s.startTime} – ${s.endTime}\n(${hours.toFixed(1)} hrs)`;

      // Assigned staff names
      const assignedNames = s.assignedStaffIds
        .map(id => staffList.find(st => st.id === id)?.name)
        .filter(Boolean);
      
      let staffDisplay = assignedNames.join(', ');
      if (s.assignedStaffIds.length < s.requiredCount) {
        const needed = s.requiredCount - s.assignedStaffIds.length;
        staffDisplay += (staffDisplay ? '\n' : '') + `⚠️ ${needed} more required`;
      }
      if (!staffDisplay) staffDisplay = '⚠️ Unassigned';

      const coverageDisplay = `${s.assignedStaffIds.length} / ${s.requiredCount} Staff`;

      // Cost calculation
      let costDisplay = '';
      if (includeCosts) {
        const staffRate = s.assignedStaffIds.reduce((sum, id) => {
          const st = staffList.find(item => item.id === id);
          return sum + (st?.hourlyRate || s.hourlyRate || 22);
        }, 0);
        const shiftEstCost = hours * (staffRate || (s.hourlyRate * s.requiredCount));
        costDisplay = `$${s.hourlyRate}/h\nEst: $${shiftEstCost.toFixed(2)}`;
      }

      return [
        dayDisplay,
        s.title,
        timeDisplay,
        staffDisplay,
        coverageDisplay,
        ...(includeCosts ? [costDisplay] : []),
        s.notes || '—'
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: detailedHead,
      body: detailedBody,
      theme: 'striped',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        valign: 'middle',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: darkNavy,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: 'bold' },
        1: { cellWidth: 50, fontStyle: 'bold' },
        2: { cellWidth: 32 },
        3: { cellWidth: 65 },
        4: { cellWidth: 26, halign: 'center' },
        ...(includeCosts ? { 5: { cellWidth: 30, halign: 'right' } } : {}),
        [includeCosts ? 6 : 5]: { cellWidth: 'auto' }
      },
      didParseCell: (data) => {
        // Highlight open slots
        if (data.section === 'body' && typeof data.cell.raw === 'string' && data.cell.raw.includes('⚠️')) {
          if (data.column.index === 3 || data.column.index === 4) {
            data.cell.styles.textColor = [194, 65, 12];
          }
        }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // 4. Page numbering & footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);

    // Footer divider line
    doc.setDrawColor(...borderLight);
    doc.line(14, pageHeight - 9, pageWidth - 14, pageHeight - 9);

    // Footer text
    const footerLeft = `RosterFlow Schedule • ${business.name || 'Workspace'} • Generated for Week of Oct 5 – Oct 11, 2026`;
    const footerRight = `Page ${i} of ${totalPages}`;

    doc.text(footerLeft, 14, pageHeight - 5);
    doc.text(footerRight, pageWidth - 14, pageHeight - 5, { align: 'right' });
  }

  // Generate filename and trigger download
  const cleanBizName = (business.slug || business.name || 'roster').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const staffSuffix = activeStaff ? `-${activeStaff.name.toLowerCase().replace(/\s+/g, '-')}` : '-weekly-team';
  const fileName = `${cleanBizName}${staffSuffix}-roster-${roster.weekStart || '2026-10-05'}.pdf`;

  doc.save(fileName);
}
