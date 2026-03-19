export type UserRole = 'admin' | 'faculty' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isBlocked?: boolean;
  canMaintainMOA?: boolean;
  college?: string;
  department?: string;
  position?: string;
  createdAt?: string;
}

export type MOAStatus = 'APPROVED' | 'PROCESSING' | 'EXPIRED' | 'EXPIRING';

export interface MOA {
  id: string;
  hteid: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  contactPersonEmail: string;
  industryType: string;
  effectiveDate: string;
  expirationDate: string;
  status: MOAStatus;
  subStatus?: string;
  endorsedByCollege: string;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userEmail: string;
  operation: 'insert' | 'edit' | 'delete' | 'recover';
  moaId: string;
  moaName: string;
  timestamp: string;
  details: string;
}
