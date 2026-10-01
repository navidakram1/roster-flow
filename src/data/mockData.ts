import { Business, StaffProfile, Roster, ShiftTemplate, AttendanceRecord, Task, SwapRequest, AppNotification } from '../types';

export const initialBusinesses: Business[] = [
  {
    id: 'biz_main_1',
    name: "Navid Operations Hub",
    slug: 'navid-hub',
    inviteCode: 'hub-8X72K',
    businessType: 'General Operations',
    timezone: 'Europe/Dublin (GMT+1)',
    address: '42 Commercial Avenue, Dublin, Ireland',
    currency: '€'
  },
  {
    id: 'biz_branch_2',
    name: 'Metro Logistics Branch',
    slug: 'metro-branch',
    inviteCode: 'metro-9P31Q',
    businessType: 'Branch Operations',
    timezone: 'Europe/Dublin (GMT+1)',
    address: '18 Grand Canal Dock, Dublin, Ireland',
    currency: '€'
  }
];

export const initialStaff: StaffProfile[] = [
  {
    id: 'staff_sarah',
    businessId: 'biz_main_1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+353 87 234 5678',
    role: 'staff',
    jobTitle: 'Team Lead & Shift Lead',
    hourlyRate: 16.50,
    maxHoursPerWeek: 25,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    skills: ['Operations', 'Team Leadership', 'Opening Checklist', 'Client Support'],
    availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false },
    preferredShift: 'morning',
    status: 'active',
    joinedDate: '2025-08-15'
  },
  {
    id: 'staff_john',
    businessId: 'biz_main_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+353 86 112 4390',
    role: 'staff',
    jobTitle: 'Operations Associate',
    hourlyRate: 14.50,
    maxHoursPerWeek: 35,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['Inventory Audit', 'Customer Service', 'Documentation', 'Floor Service'],
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    preferredShift: 'evening',
    status: 'active',
    joinedDate: '2025-09-01'
  },
  {
    id: 'staff_mike',
    businessId: 'biz_main_1',
    name: 'Mike Vance',
    email: 'mike.vance@example.com',
    phone: '+353 89 555 7821',
    role: 'staff',
    jobTitle: 'Senior Operations Specialist',
    hourlyRate: 18.00,
    maxHoursPerWeek: 40,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: ['Technical Review', 'Safety Compliance', 'Logistics', 'Quality Control'],
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true },
    preferredShift: 'morning',
    status: 'active',
    joinedDate: '2025-06-10'
  },
  {
    id: 'staff_emma',
    businessId: 'biz_main_1',
    name: 'Emma Watson',
    email: 'emma.w@example.com',
    phone: '+353 83 449 8102',
    role: 'manager',
    jobTitle: 'Duty Manager',
    hourlyRate: 19.50,
    maxHoursPerWeek: 38,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['Staff Scheduling', 'Operations Oversight', 'Escalations', 'Reconciliation'],
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true },
    preferredShift: 'any',
    status: 'active',
    joinedDate: '2025-04-01'
  },
  {
    id: 'staff_david',
    businessId: 'biz_main_1',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+353 85 993 0214',
    role: 'staff',
    jobTitle: 'Support Specialist',
    hourlyRate: 15.00,
    maxHoursPerWeek: 20,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    skills: ['Order Fulfillment', 'Dispatch', 'Stock Intake', 'Asset Care'],
    availability: { mon: false, tue: false, wed: true, thu: true, fri: true, sat: true, sun: true },
    preferredShift: 'evening',
    status: 'active',
    joinedDate: '2026-01-12'
  },
  {
    id: 'staff_lisa_pending',
    businessId: 'biz_main_1',
    name: 'Lisa Ray',
    email: 'lisa.ray@example.com',
    phone: '+353 87 670 9941',
    role: 'staff',
    jobTitle: 'Operations Assistant (Applicant)',
    hourlyRate: 14.50,
    maxHoursPerWeek: 25,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    skills: ['Front Desk', 'Client Check-in', 'Communication', 'Data Entry'],
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true },
    preferredShift: 'morning',
    status: 'pending_approval',
    joinedDate: '2026-10-01'
  }
];

export const initialTemplates: ShiftTemplate[] = [
  {
    id: 'tpl_std_2shift',
    businessId: 'biz_main_1',
    name: 'Standard 2-Shift Daily Coverage',
    description: 'Balanced daily operation with morning opening shifts and evening closing shifts.',
    shifts: [
      { day: 'mon', startTime: '07:30', endTime: '15:30', title: 'Morning Shift (Opening)', requiredCount: 3, hourlyRate: 16.00 },
      { day: 'mon', startTime: '15:00', endTime: '22:30', title: 'Evening Shift (Closing)', requiredCount: 2, hourlyRate: 15.50 },
      { day: 'tue', startTime: '07:30', endTime: '15:30', title: 'Morning Shift (Opening)', requiredCount: 3, hourlyRate: 16.00 },
      { day: 'tue', startTime: '15:00', endTime: '22:30', title: 'Evening Shift (Closing)', requiredCount: 2, hourlyRate: 15.50 },
      { day: 'wed', startTime: '07:30', endTime: '15:30', title: 'Morning Shift (Opening)', requiredCount: 3, hourlyRate: 16.00 },
      { day: 'wed', startTime: '15:00', endTime: '22:30', title: 'Evening Shift (Closing)', requiredCount: 2, hourlyRate: 15.50 },
      { day: 'thu', startTime: '07:30', endTime: '15:30', title: 'Morning Shift (Opening)', requiredCount: 3, hourlyRate: 16.00 },
      { day: 'thu', startTime: '15:00', endTime: '22:30', title: 'Evening Shift (Closing)', requiredCount: 2, hourlyRate: 15.50 },
      { day: 'fri', startTime: '07:30', endTime: '15:30', title: 'Morning Shift (Opening)', requiredCount: 3, hourlyRate: 16.50 },
      { day: 'fri', startTime: '15:00', endTime: '23:00', title: 'Evening Shift (Closing)', requiredCount: 3, hourlyRate: 16.50 },
      { day: 'sat', startTime: '08:00', endTime: '16:00', title: 'Morning Shift (Opening)', requiredCount: 4, hourlyRate: 17.00 },
      { day: 'sat', startTime: '15:30', endTime: '23:00', title: 'Evening Shift (Closing)', requiredCount: 3, hourlyRate: 17.00 },
      { day: 'sun', startTime: '08:30', endTime: '16:30', title: 'Morning Shift (Opening)', requiredCount: 3, hourlyRate: 17.50 }
    ]
  },
  {
    id: 'tpl_minimal',
    businessId: 'biz_main_1',
    name: 'Core Operations Schedule (Lean 2 Staff)',
    description: 'Streamlined operational layout for standard daily coverage requirements.',
    shifts: [
      { day: 'mon', startTime: '08:00', endTime: '16:00', title: 'Morning Shift (Opening)', requiredCount: 2, hourlyRate: 16.00 },
      { day: 'tue', startTime: '08:00', endTime: '16:00', title: 'Morning Shift (Opening)', requiredCount: 2, hourlyRate: 16.00 },
      { day: 'wed', startTime: '08:00', endTime: '16:00', title: 'Morning Shift (Opening)', requiredCount: 2, hourlyRate: 16.00 },
      { day: 'thu', startTime: '08:00', endTime: '16:00', title: 'Morning Shift (Opening)', requiredCount: 2, hourlyRate: 16.00 },
      { day: 'fri', startTime: '08:00', endTime: '17:00', title: 'Morning Shift (Opening)', requiredCount: 2, hourlyRate: 16.50 }
    ]
  }
];

export const initialRoster: Roster = {
  id: 'roster_oct_w1',
  businessId: 'biz_main_1',
  name: 'Week 40 Schedule (Core & Extended Shifts)',
  weekStart: '2026-10-05',
  weekEnd: '2026-10-11',
  status: 'published',
  aiGenerated: true,
  aiNotes: 'Optimized for full operational coverage. Fair distribution of weekend shifts with 0 overtime infractions.',
  publishedAt: '2026-10-01 10:30',
  shifts: [
    {
      id: 'shift_1',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'mon',
      date: '2026-10-05',
      startTime: '07:30',
      endTime: '15:30',
      title: 'Morning Shift (Opening)',
      requiredCount: 3,
      hourlyRate: 16.50,
      assignedStaffIds: ['staff_sarah', 'staff_mike', 'staff_emma'],
      notes: 'Complete morning checklist by 07:45',
      aiExplanation: {
        staff_sarah: 'Preferred morning shift; matched Team Lead skillset; 0 overtime risk.',
        staff_mike: 'Senior Specialist assigned for opening inspection; availability confirmed.',
        staff_emma: 'Supervisor on site for safe opening and shift verification.'
      }
    },
    {
      id: 'shift_2',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'mon',
      date: '2026-10-05',
      startTime: '15:00',
      endTime: '22:30',
      title: 'Evening Shift (Closing)',
      requiredCount: 2,
      hourlyRate: 15.00,
      assignedStaffIds: ['staff_john'],
      notes: 'Complete end-of-day checklist and lockup.',
      aiExplanation: {
        staff_john: 'Prefers evening hours; operations skillset verified; within 35h weekly cap.'
      }
    },
    {
      id: 'shift_3',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'tue',
      date: '2026-10-06',
      startTime: '07:30',
      endTime: '15:30',
      title: 'Morning Shift (Opening)',
      requiredCount: 3,
      hourlyRate: 16.50,
      assignedStaffIds: ['staff_sarah', 'staff_mike', 'staff_emma'],
      notes: 'Weekly supply delivery arriving at 09:00',
      aiExplanation: {
        staff_sarah: 'Preferred morning shift; strong performance history.',
        staff_mike: 'Senior Specialist for Tuesday workflow; protocols met.',
        staff_emma: 'Operations management and supervisor coverage.'
      }
    },
    {
      id: 'shift_4',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'tue',
      date: '2026-10-06',
      startTime: '15:00',
      endTime: '22:30',
      title: 'Evening Shift (Closing)',
      requiredCount: 2,
      hourlyRate: 15.00,
      assignedStaffIds: ['staff_john'],
      notes: 'Perform inventory reconciliation.',
      aiExplanation: {
        staff_john: 'Assigned as preferred evening worker.'
      }
    },
    {
      id: 'shift_5',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'wed',
      date: '2026-10-07',
      startTime: '07:30',
      endTime: '15:30',
      title: 'Morning Shift (Opening)',
      requiredCount: 3,
      hourlyRate: 16.50,
      assignedStaffIds: ['staff_mike', 'staff_emma'],
      notes: 'Midweek facility review.',
      aiExplanation: {
        staff_mike: 'Opening lead.',
        staff_emma: 'Duty supervisor.'
      }
    },
    {
      id: 'shift_6',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'wed',
      date: '2026-10-07',
      startTime: '15:00',
      endTime: '22:30',
      title: 'Evening Shift (Closing)',
      requiredCount: 2,
      hourlyRate: 15.00,
      assignedStaffIds: ['staff_john', 'staff_david'],
      notes: 'Restock operational consumables.',
      aiExplanation: {
        staff_john: 'Regular evening rotation.',
        staff_david: 'Available on Wednesday evening.'
      }
    },
    {
      id: 'shift_7',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'thu',
      date: '2026-10-08',
      startTime: '07:30',
      endTime: '15:30',
      title: 'Morning Shift (Opening)',
      requiredCount: 3,
      hourlyRate: 16.50,
      assignedStaffIds: ['staff_sarah', 'staff_mike', 'staff_emma'],
      aiExplanation: {
        staff_sarah: 'Morning shift rotation.',
        staff_mike: 'Senior specialist on site.',
        staff_emma: 'Management oversight.'
      }
    },
    {
      id: 'shift_8',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'thu',
      date: '2026-10-08',
      startTime: '15:00',
      endTime: '22:30',
      title: 'Evening Shift (Closing)',
      requiredCount: 2,
      hourlyRate: 15.00,
      assignedStaffIds: ['staff_john', 'staff_david'],
      aiExplanation: {
        staff_john: 'Evening shift duty.',
        staff_david: 'Fulfillment and support duty.'
      }
    },
    {
      id: 'shift_9',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'fri',
      date: '2026-10-09',
      startTime: '15:00',
      endTime: '23:00',
      title: 'Evening Shift (Closing)',
      requiredCount: 3,
      hourlyRate: 17.00,
      assignedStaffIds: ['staff_john', 'staff_david'],
      notes: 'End of week closeout.',
      aiExplanation: {
        staff_john: 'Friday shift regular.',
        staff_david: 'Peak hours support.'
      }
    },
    {
      id: 'shift_10',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'sat',
      date: '2026-10-10',
      startTime: '08:00',
      endTime: '16:00',
      title: 'Morning Shift (Opening)',
      requiredCount: 4,
      hourlyRate: 17.50,
      assignedStaffIds: ['staff_sarah', 'staff_mike', 'staff_emma'],
      aiExplanation: {
        staff_sarah: 'Experienced team lead for weekend volume.',
        staff_mike: 'Operations specialist.',
        staff_emma: 'Duty manager on site.'
      }
    },
    {
      id: 'shift_11',
      businessId: 'biz_main_1',
      rosterId: 'roster_oct_w1',
      day: 'sun',
      date: '2026-10-11',
      startTime: '08:30',
      endTime: '16:30',
      title: 'Morning Shift (Opening)',
      requiredCount: 2,
      hourlyRate: 18.00,
      assignedStaffIds: ['staff_david', 'staff_emma'],
      aiExplanation: {
        staff_david: 'Available on Sunday; matches 20h target exactly.',
        staff_emma: 'Senior supervision for Sunday close.'
      }
    }
  ]
};

export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att_101',
    businessId: 'biz_main_1',
    staffId: 'staff_sarah',
    shiftId: 'shift_1',
    date: '2026-10-05',
    shiftTitle: 'Morning Shift (Opening)',
    scheduledStart: '07:30',
    scheduledEnd: '15:30',
    checkIn: '07:28',
    checkOut: '15:32',
    breakMinutes: 30,
    status: 'completed',
    calculatedHours: 7.57,
    calculatedWage: 124.90
  },
  {
    id: 'att_102',
    businessId: 'biz_main_1',
    staffId: 'staff_mike',
    shiftId: 'shift_1',
    date: '2026-10-05',
    shiftTitle: 'Morning Shift (Opening)',
    scheduledStart: '07:30',
    scheduledEnd: '15:30',
    checkIn: '07:35',
    checkOut: '15:30',
    breakMinutes: 45,
    status: 'completed',
    calculatedHours: 7.17,
    calculatedWage: 129.06
  },
  {
    id: 'att_103',
    businessId: 'biz_main_1',
    staffId: 'staff_john',
    shiftId: 'shift_2',
    date: '2026-10-05',
    shiftTitle: 'Evening Shift (Closing)',
    scheduledStart: '15:00',
    scheduledEnd: '22:30',
    checkIn: '15:14',
    checkOut: undefined,
    breakMinutes: 0,
    status: 'checked_in',
    calculatedHours: 4.5,
    calculatedWage: 67.50
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task_1',
    businessId: 'biz_main_1',
    title: 'Facility Opening & System Readiness Inspection',
    description: 'Verify all operational terminals, check emergency exits, and confirm system status.',
    assignedStaffId: 'staff_sarah',
    shiftType: 'opening',
    dueDate: '2026-10-05',
    dueTime: '07:45',
    priority: 'high',
    status: 'completed',
    completedAt: '2026-10-05 07:41',
    recurring: 'daily',
    reminderSent: true
  },
  {
    id: 'task_2',
    businessId: 'biz_main_1',
    title: 'Daily Intake & Inventory Verification',
    description: 'Audit incoming shipments, log discrepancies in system, and verify proper storage.',
    assignedStaffId: 'staff_mike',
    shiftType: 'opening',
    dueDate: '2026-10-05',
    dueTime: '08:15',
    priority: 'high',
    status: 'completed',
    completedAt: '2026-10-05 08:10',
    recurring: 'daily',
    reminderSent: true
  },
  {
    id: 'task_3',
    businessId: 'biz_main_1',
    title: 'Midday Operational Handover & Activity Log',
    description: 'Review morning metrics, brief afternoon staff on priorities, and check equipment readiness.',
    assignedStaffId: 'staff_emma',
    shiftType: 'mid',
    dueDate: '2026-10-05',
    dueTime: '11:00',
    priority: 'normal',
    status: 'in_progress',
    recurring: 'weekly',
    reminderSent: true
  },
  {
    id: 'task_4',
    businessId: 'biz_main_1',
    title: 'Safety Audit & Workplace Compliance Review',
    description: 'Perform standard workplace safety inspection, verify first aid and fire safety readiness.',
    assignedStaffId: 'staff_john',
    shiftType: 'closing',
    dueDate: '2026-10-05',
    dueTime: '22:15',
    priority: 'high',
    status: 'pending',
    recurring: 'daily',
    reminderSent: false
  },
  {
    id: 'task_5',
    businessId: 'biz_main_1',
    title: 'Daily Financial & Operational Closeout Report',
    description: 'Compile daily activity numbers, reconcile transactions, and seal daily reporting envelope.',
    assignedStaffId: 'staff_emma',
    shiftType: 'closing',
    dueDate: '2026-10-05',
    dueTime: '22:30',
    priority: 'high',
    status: 'pending',
    recurring: 'daily',
    reminderSent: false
  }
];

export const initialSwapRequests: SwapRequest[] = [
  {
    id: 'swap_1',
    businessId: 'biz_main_1',
    shiftId: 'shift_9',
    shiftTitle: 'Friday Evening Shift',
    shiftDate: 'Friday, Oct 9',
    shiftTime: '15:00 – 23:00',
    requesterStaffId: 'staff_john',
    targetStaffId: 'staff_david',
    reason: 'Family event scheduled for Friday evening. David confirmed he is happy to swap.',
    status: 'pending_owner',
    createdAt: '2026-10-01 14:22'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_1',
    businessId: 'biz_main_1',
    type: 'swap_request',
    title: 'Shift Swap Approval Requested',
    message: 'John Doe requested David Kim to cover his Friday Evening shift (15:00 - 23:00). David accepted, waiting for your approval.',
    timestamp: '10 mins ago',
    read: false,
    emailDetails: {
      to: 'navid@rosterflow.app',
      subject: '[Swap Request] John Doe ↔ David Kim (Oct 9)',
      preview: 'John Doe has submitted a shift swap request for Friday 15:00-23:00 with David Kim.'
    }
  },
  {
    id: 'notif_2',
    businessId: 'biz_main_1',
    type: 'late_alert',
    title: 'Attendance Alert: John Doe Late by 14m',
    message: 'John Doe checked in at 15:14 for his 15:00 shift.',
    timestamp: '2 hours ago',
    read: false,
    emailDetails: {
      to: 'navid@rosterflow.app',
      subject: '[Attendance Alert] Late check-in detected',
      preview: 'Staff member John Doe clocked in 14 minutes past scheduled start time.'
    }
  },
  {
    id: 'notif_3',
    businessId: 'biz_main_1',
    type: 'roster_published',
    title: 'Week 40 Roster Published',
    message: 'All 5 staff members received email notifications with their weekly schedule.',
    timestamp: '1 day ago',
    read: true,
    emailDetails: {
      to: 'team@navidhq.com',
      subject: 'Your Roster for Oct 5 – Oct 11 is now live!',
      preview: 'Hi Team, the updated schedule for next week has been published by Navid. View your shifts now.'
    }
  }
];
