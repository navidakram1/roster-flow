export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Business {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  businessType: string;
  timezone: string;
  address: string;
  currency: string;
}

export interface StaffProfile {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'staff';
  jobTitle: string; // e.g. "Senior Barista", "Cashier", "Floor Supervisor", "Chef"
  hourlyRate: number;
  maxHoursPerWeek: number;
  avatar: string;
  skills: string[];
  availability: Record<DayOfWeek, boolean>;
  preferredShift: 'any' | 'morning' | 'evening' | 'night';
  status: 'active' | 'pending_approval';
  joinedDate: string;
}

export interface Shift {
  id: string;
  businessId: string;
  rosterId: string;
  day: DayOfWeek;
  date: string;
  startTime: string; // "08:00"
  endTime: string;   // "16:00"
  title: string;     // "Morning Barista & Opening"
  requiredCount: number;
  hourlyRate: number;
  assignedStaffIds: string[];
  notes?: string;
  aiExplanation?: Record<string, string>; // staffId -> reason why assigned
}

export interface Roster {
  id: string;
  businessId: string;
  name: string;
  weekStart: string;
  weekEnd: string;
  status: 'draft' | 'published';
  shifts: Shift[];
  publishedAt?: string;
  aiGenerated?: boolean;
  aiNotes?: string;
}

export interface ShiftTemplate {
  id: string;
  businessId: string;
  name: string;
  description: string;
  shifts: {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    title: string;
    requiredCount: number;
    hourlyRate: number;
  }[];
}

export interface SwapRequest {
  id: string;
  businessId: string;
  shiftId: string;
  shiftTitle: string;
  shiftDate: string;
  shiftTime: string;
  requesterStaffId: string;
  targetStaffId?: string; // specific person or open pool
  reason: string;
  status: 'pending_staff' | 'pending_owner' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  businessId: string;
  staffId: string;
  shiftId: string;
  date: string;
  shiftTitle: string;
  scheduledStart: string;
  scheduledEnd: string;
  checkIn?: string;
  checkOut?: string;
  breakMinutes: number;
  status: 'scheduled' | 'checked_in' | 'on_break' | 'completed' | 'late' | 'absent';
  calculatedHours: number;
  calculatedWage: number;
}

export interface Task {
  id: string;
  businessId: string;
  title: string;
  description: string;
  assignedStaffId?: string;
  shiftType: 'opening' | 'mid' | 'closing' | 'general';
  dueDate: string;
  dueTime: string;
  priority: 'high' | 'normal' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  recurring?: 'daily' | 'weekly' | 'none';
  reminderSent?: boolean;
}

export interface AppNotification {
  id: string;
  businessId: string;
  type: 'shift_reminder' | 'swap_request' | 'swap_approved' | 'roster_published' | 'task_assigned' | 'late_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  emailDetails?: {
    to: string;
    subject: string;
    preview: string;
  };
}
