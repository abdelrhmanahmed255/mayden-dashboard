import type { 
  Document, 
  DocumentUploadResponse, 
  DocumentListResponse, 
  DocumentViewResponse,
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  RegisterResponse,
  ApiError 
} from '../types';

// Base API URL - Production API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pdf-backend-xi.vercel.app';

// Public base URL for PDF documents - auto-detects from environment or current host
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://www.maydenfz.ae');

// Get the current app base URL (for constructing public-facing URLs)
export const getAppBaseUrl = (): string => {
  return PUBLIC_BASE_URL;
};

// Token management
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add auth token if available (don't add Content-Type for FormData)
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON requests (not for FormData)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

// ==================== Authentication API ====================

export const authApi = {
  /**
   * Register a new admin user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login with username and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },
};

// ==================== Documents API ====================

export const documentsApi = {
  /**
   * Upload a PDF document
   */
  upload: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<DocumentUploadResponse>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * List all documents
   */
  list: async (): Promise<DocumentListResponse> => {
    return apiRequest<DocumentListResponse>('/documents/');
  },

  /**
   * Get a single document by ID
   */
  getById: async (documentId: number): Promise<Document> => {
    return apiRequest<Document>(`/documents/${documentId}`);
  },

  /**
   * Delete a document by ID
   */
  delete: async (documentId: number): Promise<void> => {
    return apiRequest<void>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Public API (No Auth Required) ====================

export const publicApi = {
  /**
   * Get document view metadata (returns actual PDF URL in download_url)
   */
  getViewMetadata: async (documentUuid: string): Promise<DocumentViewResponse> => {
    const response = await fetch(`${API_BASE_URL}/view/${documentUuid}`);
    if (!response.ok) {
      throw new Error(`Failed to get document metadata: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get the API view endpoint URL (returns JSON metadata)
   */
  getViewUrl: (documentUuid: string): string => {
    return `${API_BASE_URL}/view/${documentUuid}`;
  },

  /**
   * Get document download URL from API (direct PDF file)
   */
  getDownloadUrl: (documentUuid: string, filename: string): string => {
    return `${PUBLIC_BASE_URL}/uploads/portal/user_documents/${documentUuid}/${encodeURIComponent(filename)}`;
  },

  /**
   * Get embeddable PDF URL
   */
  getEmbedUrl: (documentUuid: string, filename: string): string => {
    return `${PUBLIC_BASE_URL}/uploads/portal/user_documents/${documentUuid}/${encodeURIComponent(filename)}`;
  },

  /**
   * Get the document path relative to uploads folder
   * Format: /uploads/portal/user_documents/{documentUuid}/{filename}
   */
  getDocumentPath: (documentUuid: string, filename: string): string => {
    return `/uploads/portal/user_documents/${documentUuid}/${encodeURIComponent(filename)}`;
  },

  /**
   * Get full document URL with public base URL
   * Format: https://www.maydenfz.ae/uploads/portal/user_documents/{documentUuid}/{filename}
   */
  getFullDocumentUrl: (documentUuid: string, filename: string): string => {
    return `${PUBLIC_BASE_URL}/uploads/portal/user_documents/${documentUuid}/${encodeURIComponent(filename)}`;
  },
};

// Export base URL for external use
export { API_BASE_URL };
