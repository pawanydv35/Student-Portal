const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Password Service - Utility functions for password operations
 */
class PasswordService {
  
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @param {number} saltRounds - Number of salt rounds (default: 12)
   * @returns {Promise<string>} - Hashed password
   */
  static async hashPassword(password, saltRounds = 12) {
    if (!password) {
      throw new Error('Password is required');
    }
    
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }
  
  /**
   * Compare a plain text password with a hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} - True if passwords match
   */
  static async comparePassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Generate a secure random password
   * @param {number} length - Password length (default: 12)
   * @returns {string} - Generated password
   */
  static generateSecurePassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
  
  /**
   * Generate a temporary password for new users
   * @returns {string} - Temporary password
   */
  static generateTemporaryPassword() {
    return this.generateSecurePassword(10);
  }
  
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  static validatePasswordStrength(password) {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password cannot exceed 128 characters');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    // Check for common weak patterns
    const commonPatterns = [
      /(.)\1{2,}/, // Three or more repeated characters
      /123456|654321|abcdef|qwerty/i, // Common sequences
      /password|admin|user|login/i // Common words
    ];
    
    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns and is not secure');
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  }
  
  /**
   * Calculate password strength score
   * @param {string} password - Password to analyze
   * @returns {Object} - Strength analysis
   */
  static calculatePasswordStrength(password) {
    if (!password) return { score: 0, level: 'Very Weak' };
    
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 3, 30);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[@$!%*?&]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9@$!%*?&]/.test(password)) score += 5;
    
    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123456|654321|abcdef|qwerty/i.test(password)) score -= 15;
    if (/password|admin|user|login/i.test(password)) score -= 20;
    
    score = Math.max(0, Math.min(100, score));
    
    let level;
    if (score < 30) level = 'Very Weak';
    else if (score < 50) level = 'Weak';
    else if (score < 70) level = 'Fair';
    else if (score < 85) level = 'Good';
    else level = 'Strong';
    
    return { score, level };
  }
  
  /**
   * Generate a password reset token
   * @returns {string} - Reset token
   */
  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Hash a reset token for storage
   * @param {string} token - Reset token
   * @returns {string} - Hashed token
   */
  static hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

module.exports = PasswordService;