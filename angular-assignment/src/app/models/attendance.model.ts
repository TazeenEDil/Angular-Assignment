export interface Attendance {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  status: string;
  workMode: string;
  dailyReport: string | null;
  dailyReportSubmitted: boolean;
  totalWorkHours: string | null;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendancePercentage: number;
  reportSubmissionRate: number;
}

export interface RealTimeStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
}

export interface AttendanceAlert {
  alertId: number;
  employeeId: number;
  employeeName: string;
  alertType: string;
  message: string;
  alertDate: string;
  isRead: boolean;
  createdAt: string;
}