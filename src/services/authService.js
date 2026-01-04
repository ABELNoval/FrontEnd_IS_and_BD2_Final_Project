import api from './api';

/**
 * Authentication service for JWT-based login
 */
export const authService = {
  /**
   * Login with username/email and password
   * @param {string} identifier - Email or username
   * @param {string} password - User password
   * @returns {Promise<{token: string, expiration: string, user: object}>}
   */
  async login(identifier, password) {
    const response = await api.post('/Auth/login', {
      identifier,
      password
    });
    console.log('Login response:', response.data);
    return response.data;
  },

  /**
   * Store authentication data in localStorage
   * @param {object} authData - Response from login endpoint
   */
  saveAuth(authData) {
    // Handle both camelCase and PascalCase from backend
    const token = authData.token || authData.Token;
    const expiration = authData.expiration || authData.Expiration;
    const user = authData.user || authData.User;
    
    console.log('Saving auth data:', { token: !!token, expiration, user });
    
    if (token) localStorage.setItem('token', token);
    if (expiration) localStorage.setItem('tokenExpiration', expiration);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Get stored token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get stored user data
   * @returns {object|null}
   */
  getUser() {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated and token is not expired
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) return false;
    
    return new Date(expiration) > new Date();
  },

  /**
   * Clear all authentication data (logout)
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');
  },

  /**
   * Get user initial for avatar display
   * @returns {string}
   */
  getUserInitial() {
    const user = this.getUser();
    // Handle both camelCase and PascalCase
    const name = user?.name || user?.Name;
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  }
};

export default authService;
