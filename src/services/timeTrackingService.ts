import { supabase } from '../lib/supabase';

export interface TimeEntry {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  break_duration: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

export class TimeTrackingService {
  /**
   * Calculate total hours worked for a time entry
   */
  static calculateHours(entry: TimeEntry): number {
    if (!entry.end_time) return 0;

    const start = new Date(`2000-01-01T${entry.start_time}`);
    const end = new Date(`2000-01-01T${entry.end_time}`);
    const breakDuration = entry.break_duration || '00:00:00';
    
    const [breakHours, breakMinutes, breakSeconds] = breakDuration.split(':').map(Number);
    const breakInHours = breakHours + (breakMinutes / 60) + (breakSeconds / 3600);

    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, totalHours - breakInHours);
  }

  /**
   * Calculate total hours worked for a collection of time entries
   */
  static calculateTotalHours(timeEntries: TimeEntry[]): {
    regularHours: number;
    overtimeHours: number;
  } {
    // Group entries by week
    const weeklyHours = new Map<string, number>();
    
    timeEntries.forEach(entry => {
      if (entry.status !== 'approved' || !entry.end_time) return;
      
      const weekStart = this.getWeekStart(new Date(entry.date));
      const hours = this.calculateHours(entry);
      
      weeklyHours.set(
        weekStart,
        (weeklyHours.get(weekStart) || 0) + hours
      );
    });
    
    // Calculate regular and overtime hours
    let regularHours = 0;
    let overtimeHours = 0;
    
    weeklyHours.forEach(hours => {
      if (hours <= 40) {
        regularHours += hours;
      } else {
        regularHours += 40;
        overtimeHours += hours - 40;
      }
    });
    
    return { regularHours, overtimeHours };
  }

  /**
   * Get the start of the week for a date
   */
  private static getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  /**
   * Get time entries for an employee within a date range
   */
  static async getTimeEntries(
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}