export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  error: {
    code: string;
    message: string;
    timestamp: string;
    path: string;
    fieldErrors?: Record<string, string>;
  };
}
