/**
 * Centralized API Configuration
 * 
 * This file provides a single source of truth for the backend API URL.
 * The URL is read from environment variables, making it easy to switch
 * between development, staging, and production environments.
 */

// Get API URL from environment variable, fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const FE_URL = import.meta.env.FRONTEND_URL || 'https://vaurlis.vercel.app';
// Log API URL in development mode for debugging
if (import.meta.env.DEV) {
  console.log(' API URL:', API_URL);
}

// Optional: Export other API-related configurations
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

// Helper function to get authorization headers
export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`
});

export default API_URL;
