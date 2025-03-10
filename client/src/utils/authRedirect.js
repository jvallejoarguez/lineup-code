/**
 * Utility functions for handling authentication redirects
 */

/**
 * Extracts and processes authentication parameters from URL hash
 * Used for handling email confirmation and password reset links
 * 
 * @returns {Object|null} Authentication parameters or null if not present
 */
export const extractAuthParamsFromHash = () => {
  if (typeof window === 'undefined' || !window.location.hash) {
    return null;
  }

  try {
    // Check if hash contains auth parameters
    if (window.location.hash.includes('access_token') || 
        window.location.hash.includes('error_code')) {
      
      // Extract parameters from hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Return structured auth params
      return {
        accessToken: hashParams.get('access_token'),
        refreshToken: hashParams.get('refresh_token'),
        expiresIn: hashParams.get('expires_in'),
        expiresAt: hashParams.get('expires_at'),
        tokenType: hashParams.get('token_type'),
        type: hashParams.get('type'),
        errorCode: hashParams.get('error_code'),
        errorDescription: hashParams.get('error_description')
      };
    }
  } catch (error) {
    console.error('Error extracting auth params from hash:', error);
  }
  
  return null;
};

/**
 * Clears authentication parameters from the URL
 * Should be called after processing auth parameters to prevent token exposure
 */
export const clearAuthParamsFromUrl = () => {
  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
    window.history.replaceState(
      null, 
      document.title, 
      window.location.pathname + window.location.search
    );
  }
}; 