import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import {
  initialBusinesses,
  initialStaff,
  initialRoster,
  initialTemplates,
  initialAttendance,
  initialTasks,
  initialSwapRequests,
  initialNotifications
} from '../data/mockData';
import {
  Business,
  StaffProfile,
  Roster,
  Shift,
  ShiftTemplate,
  AttendanceRecord,
  Task,
  SwapRequest,
  AppNotification
} from '../types';

let dbInstance: PGlite | null = null;
let dbPromise: Promise<PGlite> | null = null;

export async function getDb(): Promise<PGlite> {
  if (dbInstance) {
    return dbInstance;
  }
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = (async () => {
    try {
      // Store DB files in user profile directory outside the Next.js project
      // to prevent Turbopack watcher file-locking collisions on Windows (os error 5)
      const baseDir = process.env.LOCALAPPDATA || process.env.USERPROFILE || 'C:\\ProgramData';
      const dbDir = path.join(baseDir, '.rosterflow-pglite-db');

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const pg = new PGlite(dbDir);
      await pg.waitReady;
      await initSchema(pg);
      dbInstance = pg;
      return pg;
    } catch (err) {
      console.warn('Persistent PGlite init fallback to in-memory mode:', err);
      const memoryPg = new PGlite();
      await memoryPg.waitReady;
      await initSchema(memoryPg);
      dbInstance = memoryPg;
      return memoryPg;
    }
  })();

  return dbPromise;
}

async function initSchema(pg: PGlite) {
  // Create tables using standard PostgreSQL syntax (100% Supabase compatible)
  await pg.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      invite_code TEXT NOT NULL,
      business_type TEXT NOT NULL,
      timezone TEXT NOT NULL,
      address TEXT NOT NULL,
      currency TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS staff_profiles (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL,
      job_title TEXT NOT NULL,
      hourly_rate NUMERIC(10,2) NOT NULL,
      max_hours_per_week NUMERIC(5,2) NOT NULL,
      avatar TEXT,
      skills JSONB NOT NULL DEFAULT '[]'::jsonb,
      availability JSONB NOT NULL DEFAULT '{}'::jsonb,
      preferred_shift TEXT NOT NULL,
      status TEXT NOT NULL,
      joined_date TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS rosters (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      name TEXT NOT NULL,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      status TEXT NOT NULL,
      published_at TEXT,
      ai_generated BOOLEAN DEFAULT false,
      ai_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      roster_id TEXT NOT NULL,
      day TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      title TEXT NOT NULL,
      required_count INTEGER NOT NULL,
      hourly_rate NUMERIC(10,2) NOT NULL,
      assigned_staff_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      notes TEXT,
      ai_explanation JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS shift_templates (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      shifts JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      shift_id TEXT NOT NULL,
      date TEXT NOT NULL,
      shift_title TEXT NOT NULL,
      scheduled_start TEXT NOT NULL,
      scheduled_end TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      break_minutes INTEGER DEFAULT 0,
      status TEXT NOT NULL,
      calculated_hours NUMERIC(6,2) DEFAULT 0,
      calculated_wage NUMERIC(10,2) DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assigned_staff_id TEXT,
      shift_type TEXT NOT NULL,
      due_date TEXT NOT NULL,
      due_time TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      completed_at TEXT,
      recurring TEXT,
      reminder_sent BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS shift_swap_requests (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      shift_id TEXT NOT NULL,
      shift_title TEXT NOT NULL,
      shift_date TEXT NOT NULL,
      shift_time TEXT NOT NULL,
      requester_staff_id TEXT NOT NULL,
      target_staff_id TEXT,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      link TEXT,
      email_details JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // Check if businesses table is empty; if so, seed initial mock data
  const checkBiz = await pg.query('SELECT count(*) as count FROM businesses');
  const count = parseInt((checkBiz.rows[0] as any).count, 10);
  if (count === 0) {
    await seedInitialData(pg);
  }
}

export async function seedInitialData(pg: PGlite) {
  // 1. Businesses
  for (const b of initialBusinesses) {
    await pg.query(
      `INSERT INTO businesses (id, name, slug, invite_code, business_type, timezone, address, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [b.id, b.name, b.slug, b.inviteCode, b.businessType, b.timezone, b.address, b.currency]
    );
  }

  // 2. Staff Profiles
  for (const s of initialStaff) {
    await pg.query(
      `INSERT INTO staff_profiles (id, business_id, name, email, phone, role, job_title, hourly_rate, max_hours_per_week, avatar, skills, availability, preferred_shift, status, joined_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        s.id,
        s.businessId,
        s.name,
        s.email,
        s.phone,
        s.role,
        s.jobTitle,
        s.hourlyRate,
        s.maxHoursPerWeek,
        s.avatar,
        JSON.stringify(s.skills),
        JSON.stringify(s.availability),
        s.preferredShift,
        s.status,
        s.joinedDate
      ]
    );
  }

  // 3. Roster & Shifts
  await pg.query(
    `INSERT INTO rosters (id, business_id, name, week_start, week_end, status, published_at, ai_generated, ai_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO NOTHING`,
    [
      initialRoster.id,
      initialRoster.businessId,
      initialRoster.name,
      initialRoster.weekStart,
      initialRoster.weekEnd,
      initialRoster.status,
      initialRoster.publishedAt || null,
      initialRoster.aiGenerated || false,
      initialRoster.aiNotes || null
    ]
  );

  for (const sh of initialRoster.shifts) {
    await pg.query(
      `INSERT INTO shifts (id, business_id, roster_id, day, date, start_time, end_time, title, required_count, hourly_rate, assigned_staff_ids, notes, ai_explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        sh.id,
        sh.businessId,
        sh.rosterId,
        sh.day,
        sh.date,
        sh.startTime,
        sh.endTime,
        sh.title,
        sh.requiredCount,
        sh.hourlyRate,
        JSON.stringify(sh.assignedStaffIds),
        sh.notes || null,
        JSON.stringify(sh.aiExplanation || {})
      ]
    );
  }

  // 4. Shift Templates
  for (const t of initialTemplates) {
    await pg.query(
      `INSERT INTO shift_templates (id, business_id, name, description, shifts)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, t.businessId, t.name, t.description, JSON.stringify(t.shifts)]
    );
  }

  // 5. Attendance
  for (const a of initialAttendance) {
    await pg.query(
      `INSERT INTO attendance (id, business_id, staff_id, shift_id, date, shift_title, scheduled_start, scheduled_end, check_in, check_out, break_minutes, status, calculated_hours, calculated_wage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        a.businessId,
        a.staffId,
        a.shiftId,
        a.date,
        a.shiftTitle,
        a.scheduledStart,
        a.scheduledEnd,
        a.checkIn || null,
        a.checkOut || null,
        a.breakMinutes,
        a.status,
        a.calculatedHours,
        a.calculatedWage
      ]
    );
  }

  // 6. Tasks
  for (const tk of initialTasks) {
    await pg.query(
      `INSERT INTO tasks (id, business_id, title, description, assigned_staff_id, shift_type, due_date, due_time, priority, status, completed_at, recurring, reminder_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        tk.id,
        tk.businessId,
        tk.title,
        tk.description,
        tk.assignedStaffId || null,
        tk.shiftType,
        tk.dueDate,
        tk.dueTime,
        tk.priority,
        tk.status,
        tk.completedAt || null,
        tk.recurring || 'none',
        tk.reminderSent || false
      ]
    );
  }

  // 7. Swaps
  for (const sw of initialSwapRequests) {
    await pg.query(
      `INSERT INTO shift_swap_requests (id, business_id, shift_id, shift_title, shift_date, shift_time, requester_staff_id, target_staff_id, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        sw.id,
        sw.businessId,
        sw.shiftId,
        sw.shiftTitle,
        sw.shiftDate,
        sw.shiftTime,
        sw.requesterStaffId,
        sw.targetStaffId || null,
        sw.reason,
        sw.status,
        sw.createdAt
      ]
    );
  }

  // 8. Notifications
  for (const nf of initialNotifications) {
    await pg.query(
      `INSERT INTO notifications (id, business_id, type, title, message, timestamp, read, link, email_details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        nf.id,
        nf.businessId,
        nf.type,
        nf.title,
        nf.message,
        nf.timestamp,
        nf.read,
        nf.link || null,
        JSON.stringify(nf.emailDetails || null)
      ]
    );
  }
}

// Data loaders
export async function getAllDataFromPg() {
  const pg = await getDb();

  const bizRes = await pg.query('SELECT * FROM businesses ORDER BY id ASC');
  const staffRes = await pg.query('SELECT * FROM staff_profiles ORDER BY id ASC');
  const rosterRes = await pg.query('SELECT * FROM rosters LIMIT 1');
  const shiftsRes = await pg.query('SELECT * FROM shifts ORDER BY date ASC, start_time ASC');
  const templatesRes = await pg.query('SELECT * FROM shift_templates');
  const attRes = await pg.query('SELECT * FROM attendance ORDER BY id ASC');
  const taskRes = await pg.query('SELECT * FROM tasks ORDER BY due_time ASC');
  const swapRes = await pg.query('SELECT * FROM shift_swap_requests ORDER BY created_at DESC');
  const notifRes = await pg.query('SELECT * FROM notifications ORDER BY timestamp DESC');

  const businesses: Business[] = bizRes.rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    inviteCode: r.invite_code,
    businessType: r.business_type,
    timezone: r.timezone,
    address: r.address,
    currency: r.currency
  }));

  const staffList: StaffProfile[] = staffRes.rows.map((r: any) => ({
    id: r.id,
    businessId: r.business_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    jobTitle: r.job_title,
    hourlyRate: parseFloat(r.hourly_rate),
    maxHoursPerWeek: parseFloat(r.max_hours_per_week),
    avatar: r.avatar,
    skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills,
    availability: typeof r.availability === 'string' ? JSON.parse(r.availability) : r.availability,
    preferredShift: r.preferred_shift,
    status: r.status,
    joinedDate: r.joined_date
  }));

  const shifts: Shift[] = shiftsRes.rows.map((r: any) => ({
    id: r.id,
    businessId: r.business_id,
    rosterId: r.roster_id,
    day: r.day,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    title: r.title,
    requiredCount: parseInt(r.required_count, 10),
    hourlyRate: parseFloat(r.hourly_rate),
    assignedStaffIds: typeof r.assigned_staff_ids === 'string' ? JSON.parse(r.assigned_staff_ids) : r.assigned_staff_ids,
    notes: r.notes || undefined,
    aiExplanation: typeof r.ai_explanation === 'string' ? JSON.parse(r.ai_explanation) : r.ai_explanation
  }));

  const rosterRow: any = rosterRes.rows[0] || {};
  const roster: Roster = {
    id: rosterRow.id || 'roster_oct_w1',
    businessId: rosterRow.business_id || 'biz_cafe_1',
    name: rosterRow.name || 'Week 40 Roster',
    weekStart: rosterRow.week_start || '2026-10-05',
    weekEnd: rosterRow.week_end || '2026-10-11',
    status: rosterRow.status || 'draft',
    publishedAt: rosterRow.published_at || undefined,
    aiGenerated: rosterRow.ai_generated || false,
    aiNotes: rosterRow.ai_notes || undefined,
    shifts
  };

  const templates: ShiftTemplate[] = templatesRes.rows.map((r: any) => ({
    id: r.id,
    businessId: r.business_id,
    name: r.name,
    description: r.description,
    shifts: typeof r.shifts === 'string' ? JSON.parse(r.shifts) : r.shifts
  }));

  const attendanceRecords: AttendanceRecord[] = attRes.rows.map((r: any) => ({
    id: r.id,
    businessId: r.business_id,
    staffId: r.staff_id,
    shiftId: r.shift_id,
    date: r.date,
    shiftTitle: r.shift_title,
    scheduledStart: r.scheduled_start,
    scheduledEnd: r.scheduled_end,
    checkIn: r.check_in || undefined,
    checkOut: r.check_out || undefined,
    breakMinutes: parseInt(r.break_minutes || 0, 10),
    status: r.status,
    calculatedHours: parseFloat(r.calculated_hours || 0),
    calculatedWage: parseFloat(r.calculated_wage || 0)
  }));

  const tasks: Task[] = taskRes.rows.map((r: any) => ({
    id: r.id,
    businessId: r.business_id,
    title: r.title,
    description: r.description,
    assignedStaffId: r.assigned_staff_id || undefined,
    shiftType: r.shift_type,
    dueDate: r.due_date,
    dueTime: r.due_time,
    priority: r.priority,
    status: r.status,
    completedAt: r.completed_at || undefined,
    recurring: r.recurring,
    reminderSent: r.reminder_sent
  }));

  const swapRequests: SwapRequest[] = swapRes.rows.map((r: any) => ({
    id: r.id,
    businessId: r.business_id,
    shiftId: r.shift_id,
    shiftTitle: r.shift_title,
    shiftDate: r.shift_date,
    shiftTime: r.shift_time,
    requesterStaffId: r.requester_staff_id,
    targetStaffId: r.target_staff_id || undefined,
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at
  }));

  const notifications: AppNotification[] = notifRes.rows.map((r: any) => ({
    id: r.id,
    businessId: r.business_id,
    type: r.type,
    title: r.title,
    message: r.message,
    timestamp: r.timestamp,
    read: r.read,
    link: r.link || undefined,
    emailDetails: typeof r.email_details === 'string' ? JSON.parse(r.email_details) : r.email_details
  }));

  return {
    businesses,
    staffList,
    roster,
    templates,
    attendanceRecords,
    tasks,
    swapRequests,
    notifications
  };
}

// Writers
export async function persistShift(shift: Shift) {
  const pg = await getDb();
  await pg.query(
    `INSERT INTO shifts (id, business_id, roster_id, day, date, start_time, end_time, title, required_count, hourly_rate, assigned_staff_ids, notes, ai_explanation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (id) DO UPDATE SET
       day = EXCLUDED.day,
       date = EXCLUDED.date,
       start_time = EXCLUDED.start_time,
       end_time = EXCLUDED.end_time,
       title = EXCLUDED.title,
       required_count = EXCLUDED.required_count,
       hourly_rate = EXCLUDED.hourly_rate,
       assigned_staff_ids = EXCLUDED.assigned_staff_ids,
       notes = EXCLUDED.notes,
       ai_explanation = EXCLUDED.ai_explanation`,
    [
      shift.id,
      shift.businessId,
      shift.rosterId,
      shift.day,
      shift.date,
      shift.startTime,
      shift.endTime,
      shift.title,
      shift.requiredCount,
      shift.hourlyRate,
      JSON.stringify(shift.assignedStaffIds),
      shift.notes || null,
      JSON.stringify(shift.aiExplanation || {})
    ]
  );
}

export async function deleteShiftFromPg(shiftId: string) {
  const pg = await getDb();
  await pg.query('DELETE FROM shifts WHERE id = $1', [shiftId]);
}

export async function persistRoster(roster: Roster) {
  const pg = await getDb();
  await pg.query(
    `INSERT INTO rosters (id, business_id, name, week_start, week_end, status, published_at, ai_generated, ai_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status,
       published_at = EXCLUDED.published_at,
       ai_generated = EXCLUDED.ai_generated,
       ai_notes = EXCLUDED.ai_notes`,
    [
      roster.id,
      roster.businessId,
      roster.name,
      roster.weekStart,
      roster.weekEnd,
      roster.status,
      roster.publishedAt || null,
      roster.aiGenerated || false,
      roster.aiNotes || null
    ]
  );

  // Sync shifts in batch
  for (const sh of roster.shifts) {
    await persistShift(sh);
  }
}

export async function persistStaff(staff: StaffProfile) {
  const pg = await getDb();
  await pg.query(
    `INSERT INTO staff_profiles (id, business_id, name, email, phone, role, job_title, hourly_rate, max_hours_per_week, avatar, skills, availability, preferred_shift, status, joined_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       role = EXCLUDED.role,
       job_title = EXCLUDED.job_title,
       hourly_rate = EXCLUDED.hourly_rate,
       max_hours_per_week = EXCLUDED.max_hours_per_week,
       availability = EXCLUDED.availability,
       preferred_shift = EXCLUDED.preferred_shift,
       status = EXCLUDED.status`,
    [
      staff.id,
      staff.businessId,
      staff.name,
      staff.email,
      staff.phone,
      staff.role,
      staff.jobTitle,
      staff.hourlyRate,
      staff.maxHoursPerWeek,
      staff.avatar,
      JSON.stringify(staff.skills),
      JSON.stringify(staff.availability),
      staff.preferredShift,
      staff.status,
      staff.joinedDate
    ]
  );
}

export async function persistAttendance(record: AttendanceRecord) {
  const pg = await getDb();
  await pg.query(
    `INSERT INTO attendance (id, business_id, staff_id, shift_id, date, shift_title, scheduled_start, scheduled_end, check_in, check_out, break_minutes, status, calculated_hours, calculated_wage)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (id) DO UPDATE SET
       check_in = EXCLUDED.check_in,
       check_out = EXCLUDED.check_out,
       break_minutes = EXCLUDED.break_minutes,
       status = EXCLUDED.status,
       calculated_hours = EXCLUDED.calculated_hours,
       calculated_wage = EXCLUDED.calculated_wage`,
    [
      record.id,
      record.businessId,
      record.staffId,
      record.shiftId,
      record.date,
      record.shiftTitle,
      record.scheduledStart,
      record.scheduledEnd,
      record.checkIn || null,
      record.checkOut || null,
      record.breakMinutes,
      record.status,
      record.calculatedHours,
      record.calculatedWage
    ]
  );
}

export async function persistTask(task: Task) {
  const pg = await getDb();
  await pg.query(
    `INSERT INTO tasks (id, business_id, title, description, assigned_staff_id, shift_type, due_date, due_time, priority, status, completed_at, recurring, reminder_sent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       assigned_staff_id = EXCLUDED.assigned_staff_id,
       shift_type = EXCLUDED.shift_type,
       due_date = EXCLUDED.due_date,
       due_time = EXCLUDED.due_time,
       priority = EXCLUDED.priority,
       status = EXCLUDED.status,
       completed_at = EXCLUDED.completed_at`,
    [
      task.id,
      task.businessId,
      task.title,
      task.description || '',
      task.assignedStaffId || null,
      task.shiftType || 'general',
      task.dueDate || new Date().toISOString().split('T')[0],
      task.dueTime || '12:00',
      task.priority || 'normal',
      task.status || 'pending',
      task.completedAt || null,
      task.recurring || 'none',
      task.reminderSent || false
    ]
  );
}

export async function deleteTaskFromPg(taskId: string) {
  const pg = await getDb();
  await pg.query('DELETE FROM tasks WHERE id = $1', [taskId]);
}

export async function persistSwap(swap: SwapRequest) {
  const pg = await getDb();
  await pg.query(
    `INSERT INTO shift_swap_requests (id, business_id, shift_id, shift_title, shift_date, shift_time, requester_staff_id, target_staff_id, reason, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status,
       target_staff_id = EXCLUDED.target_staff_id`,
    [
      swap.id,
      swap.businessId,
      swap.shiftId,
      swap.shiftTitle,
      swap.shiftDate,
      swap.shiftTime,
      swap.requesterStaffId,
      swap.targetStaffId || null,
      swap.reason,
      swap.status,
      swap.createdAt
    ]
  );
}

export async function persistTemplate(template: ShiftTemplate) {
  const pg = await getDb();
  await pg.query(
    `INSERT INTO shift_templates (id, business_id, name, description, shifts)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       shifts = EXCLUDED.shifts`,
    [
      template.id,
      template.businessId,
      template.name,
      template.description || '',
      JSON.stringify(template.shifts)
    ]
  );
}

export async function deleteTemplateFromPg(templateId: string) {
  const pg = await getDb();
  await pg.query('DELETE FROM shift_templates WHERE id = $1', [templateId]);
}

export async function resetDatabaseToSeed() {
  const pg = await getDb();
  await pg.exec(`
    TRUNCATE businesses, staff_profiles, rosters, shifts, shift_templates, attendance, tasks, shift_swap_requests, notifications CASCADE;
  `);
  await seedInitialData(pg);
}
