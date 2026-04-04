/**
 * Check if an institute has an active premium subscription.
 * Dual Logic: is_premium must be true AND premium_expires_at must be in the future.
 * 
 * @param {Object} institute The institute object to check.
 * @returns {boolean} True if premium is active.
 */
export const isPremiumActive = (institute) => {
    if (!institute) return false;

    // Prioritize backend pre-computed status if available
    if (institute.hasOwnProperty('is_premium_active')) {
        return Boolean(institute.is_premium_active);
    }

    if (!institute.is_premium) return false;
    if (!institute.premium_expires_at) return true; // If somehow premium but no expiry, assume active

    // Secure date parsing for SQL format (YYYY-MM-DD HH:MM:SS)
    const dateStr = String(institute.premium_expires_at).includes('T') 
        ? institute.premium_expires_at 
        : String(institute.premium_expires_at).replace(/-/g, "/");
        
    const expiryDate = new Date(dateStr);
    const now = new Date();
    
    return expiryDate > now;
};
