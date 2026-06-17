export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export type TicketStatus = 'uploaded' | 'pending' | 'verified' | 'rejected' | 'manual_review';

export type PointsSourceType = 'ticket' | 'redeem' | 'bonus' | 'admin_adjust' | 'reversal' | 'quiz';

export type VoucherStatus = 'draft' | 'active' | 'paused' | 'expired' | 'sold_out' | 'archived';

export type UgcReviewStatus = 'pending' | 'approved' | 'rejected';

export interface UserDTO {
  id: string;
  email: string;
  role: UserRole;
  pointsBalanceCache: number;
  createdAt: Date;
}

export interface RegisterRequestPayload {
  email: string;
  password?: string; // Standard email/password registration
}

export interface LoginRequestPayload {
  email: string;
  password?: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  message: string;
}
