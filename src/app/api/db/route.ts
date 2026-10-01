import { NextRequest, NextResponse } from 'next/server';
import {
  getAllDataFromPg,
  persistShift,
  deleteShiftFromPg,
  persistRoster,
  persistStaff,
  persistAttendance,
  persistTask,
  deleteTaskFromPg,
  persistSwap,
  persistTemplate,
  deleteTemplateFromPg,
  resetDatabaseToSeed
} from '../../../lib/db';

export async function GET() {
  try {
    const data = await getAllDataFromPg();
    return NextResponse.json({
      success: true,
      engine: 'PostgreSQL (PGlite embedded)',
      supabaseCompatible: true,
      data
    });
  } catch (err: any) {
    console.error('Database fetch error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'save_shift':
        await persistShift(payload);
        break;
      case 'delete_shift':
        await deleteShiftFromPg(payload.shiftId);
        break;
      case 'save_roster':
        await persistRoster(payload);
        break;
      case 'save_staff':
        await persistStaff(payload);
        break;
      case 'save_attendance':
        await persistAttendance(payload);
        break;
      case 'save_task':
        await persistTask(payload);
        break;
      case 'delete_task':
        await deleteTaskFromPg(payload.taskId);
        break;
      case 'save_swap':
        await persistSwap(payload);
        break;
      case 'save_template':
        await persistTemplate(payload);
        break;
      case 'delete_template':
        await deleteTemplateFromPg(payload.templateId);
        break;
      case 'reset':
        await resetDatabaseToSeed();
        break;
      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (err: any) {
    console.error('Database write error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
