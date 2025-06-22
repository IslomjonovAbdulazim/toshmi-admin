// API Configuration and Helper Functions
// Maktab Boshqaruv Tizimi - API

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://islomjonovabdulazim-toshmi-backend-ac2b.twc1.net',
    VERSION: 'v1',
    TIMEOUT: 30000, // 30 seconds
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000 // 1 second
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// API Error Types
const API_ERRORS = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR'
};

// Global API state
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
function setAuthToken(token) {
    authToken = token;
    localStorage.setItem('authToken', token);
}

/**
 * Clear authentication token
 */
function clearAuthToken() {
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

/**
 * Get authentication token
 * @returns {string|null} JWT token
 */
function getAuthToken() {
    return authToken || localStorage.getItem('authToken');
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Set current user data
 * @param {Object} user - User object
 */
function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Get current user data
 * @returns {Object} User object
 */
function getCurrentUser() {
    return currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
}

/**
 * Create request headers
 * @param {Object} additionalHeaders - Additional headers
 * @returns {Object} Headers object
 */
function createHeaders(additionalHeaders = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...additionalHeaders
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Create full URL
 * @param {string} endpoint - API endpoint
 * @returns {string} Full URL
 */
function createUrl(endpoint) {
    // Remove leading slash if present
    endpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_CONFIG.BASE_URL}/${endpoint}`;
}

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise<any>} Parsed response data
 */
async function handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data;
    try {
        data = isJson ? await response.json() : await response.text();
    } catch (error) {
        throw new APIError('Response parsing failed', API_ERRORS.SERVER_ERROR, response.status);
    }

    if (!response.ok) {
        // Handle specific HTTP status codes
        switch (response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
                clearAuthToken();
                window.location.href = 'login.html';
                throw new APIError(data.message || 'Avtorizatsiya talab qilinadi', API_ERRORS.AUTH_ERROR, response.status);
            
            case HTTP_STATUS.FORBIDDEN:
                throw new APIError(data.message || 'Ruxsat berilmagan', API_ERRORS.AUTH_ERROR, response.status);
            
            case HTTP_STATUS.NOT_FOUND:
                throw new APIError(data.message || 'Ma\'lumot topilmadi', API_ERRORS.NOT_FOUND_ERROR, response.status);
            
            case HTTP_STATUS.BAD_REQUEST:
                throw new APIError(data.message || 'Noto\'g\'ri so\'rov', API_ERRORS.VALIDATION_ERROR, response.status, data.errors);
            
            default:
                throw new APIError(data.message || 'Server xatosi', API_ERRORS.SERVER_ERROR, response.status);
        }
    }

    return data;
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, type, status, details = null) {
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.status = status;
        this.details = details;
    }
}

/**
 * Retry function for failed requests
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries
 * @returns {Promise<any>} Result of successful call
 */
async function retry(fn, retries = API_CONFIG.RETRY_COUNT, delay = API_CONFIG.RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0 && error.type === API_ERRORS.NETWORK_ERROR) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, retries - 1, delay * 2); // Exponential backoff
        }
        throw error;
    }
}

/**
 * Main API call function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<any>} API response data
 */
async function apiCall(endpoint, options = {}) {
    const {
        method = 'GET',
        data = null,
        headers: additionalHeaders = {},
        timeout = API_CONFIG.TIMEOUT,
        retryCount = API_CONFIG.RETRY_COUNT,
        ...fetchOptions
    } = options;

    const url = createUrl(endpoint);
    const headers = createHeaders(additionalHeaders);

    const requestOptions = {
        method,
        headers,
        ...fetchOptions
    };

    // Add body for POST, PUT, PATCH requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        if (data instanceof FormData) {
            // Remove Content-Type header for FormData (browser sets it with boundary)
            delete headers['Content-Type'];
            requestOptions.body = data;
        } else {
            requestOptions.body = JSON.stringify(data);
        }
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestOptions.signal = controller.signal;

    try {
        const makeRequest = async () => {
            try {
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);
                return handleResponse(response);
            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    throw new APIError('So\'rov vaqti tugadi', API_ERRORS.TIMEOUT_ERROR);
                }
                
                if (error instanceof APIError) {
                    throw error;
                }
                
                // Network or other fetch errors
                throw new APIError('Tarmoq xatosi', API_ERRORS.NETWORK_ERROR);
            }
        };

        return await retry(makeRequest, retryCount);
    } catch (error) {
        console.error('API Call Error:', {
            endpoint,
            method,
            error: error.message,
            type: error.type,
            status: error.status
        });
        throw error;
    }
}

// Convenience methods
const api = {
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<any>} API response data
     */
    get: (endpoint, options = {}) => {
        return apiCall(endpoint, { ...options, method: 'GET' });
    },

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise<any>} API response data
     */
    post: (endpoint, data = null, options = {}) => {
        return apiCall(endpoint, { ...options, method: 'POST', data });
    },

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise<any>} API response data
     */
    put: (endpoint, data = null, options = {}) => {
        return apiCall(endpoint, { ...options, method: 'PUT', data });
    },

    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise<any>} API response data
     */
    patch: (endpoint, data = null, options = {}) => {
        return apiCall(endpoint, { ...options, method: 'PATCH', data });
    },

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<any>} API response data
     */
    delete: (endpoint, options = {}) => {
        return apiCall(endpoint, { ...options, method: 'DELETE' });
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.API = {
        api,
        apiCall,
        setAuthToken,
        clearAuthToken,
        getAuthToken,
        isAuthenticated,
        setCurrentUser,
        getCurrentUser,
        APIError,
        API_ERRORS,
        HTTP_STATUS
    };
}

// Default export
const API = {
    api,
    apiCall,
    setAuthToken,
    clearAuthToken,
    getAuthToken,
    isAuthenticated,
    setCurrentUser,
    getCurrentUser,
    APIError,
    API_ERRORS,
    HTTP_STATUS
};