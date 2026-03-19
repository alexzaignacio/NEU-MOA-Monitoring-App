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
export type RecordStatus = 'active' | 'deleted';

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
  moaStatus: MOAStatus;
  status: RecordStatus;
  subStatus?: string;
  endorsedByCollege: string;
  isDeleted: boolean; // Keeping for backward compatibility during migration if needed, but will use status
  deletedAt?: string;
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
