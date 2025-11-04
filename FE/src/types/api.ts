export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ReviewMemberRequestParams {
  action: 'approve' | 'reject';
}