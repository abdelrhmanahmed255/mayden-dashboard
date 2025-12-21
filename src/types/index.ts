// Document Types
export interface Document {
  id: number;
  uuid: string;
  original_filename: string;
  file_path: string;
  storage_url: string;
  upload_timestamp: string;
  hit_count: number;
  // Legacy fields for backwards compatibility
  name?: string;
  file_size?: number;
  upload_date?: string;
  user_id?: number;
}

export interface DocumentUploadResponse {
  id: number;
  uuid: string;
  message: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

// Document View Response (from /view/{uuid} endpoint)
export interface DocumentViewResponse {
  uuid: string;
  original_filename: string;
  upload_timestamp: string;
  download_url: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// API Response Types
export interface ApiError {
  detail: string;
  status_code?: number;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}
