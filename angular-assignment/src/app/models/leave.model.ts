export interface LeaveType {
  leaveTypeId: number;
  name: string;
  description: string | null;
  maxDaysPerYear: number;
}

export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}