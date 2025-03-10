/**
 * Utility function to get the correct site URL based on the environment
 * This ensures consistent URL handling across the application
 */

/**
 * Returns the appropriate site URL based on the current environment
 * @returns {string} The site URL (production or development)
 */
export const getSiteUrl = () => {
  // For Supabase email templates and other server-side contexts
  // Always prioritize the production URL for authentication flows
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.lineupai.app';
  }
  
  if (typeof window === 'undefined') return 'https://www.lineupai.app';
  
  // For production (Vercel)
  if (window.location.hostname === 'lineupai.vercel.app' || 
      window.location.hostname === 'www.lineupai.app') {
    return 'https://www.lineupai.app';
  }
  
  // For local development
  return 'http://localhost:3000';
};

/**
 * Returns the appropriate API URL based on the current environment
 * @returns {string} The API URL (production or development)
 */
export const getApiUrl = () => {
  if (typeof window === 'undefined') return '';
  
  // For production (Vercel)
  if (window.location.hostname === 'lineupai.vercel.app') {
    return 'https://lineupai.vercel.app/api';
  }
  
  // For local development
  return 'http://localhost:5000/api';
}; 