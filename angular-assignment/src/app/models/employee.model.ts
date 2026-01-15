export interface Employee {
  id?: number;
  name: string;
  email: string;
  positionId: number;
  positionName?: string;
  createdAt?: Date | string;
}