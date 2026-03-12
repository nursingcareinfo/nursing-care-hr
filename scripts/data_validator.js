/**
 * Data Validator for HR Employee Records
 * Handles cleaning and validation of raw extracted data.
 */

class DataValidator {
    static cleanName(name) {
        if (!name) return '';
        return name.trim().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    static validatePhone(phone) {
        // Basic international format check
        return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''));
    }

    static process(rawData) {
        const errors = [];
        const cleaned = {
            firstName: this.cleanName(rawData.firstName),
            lastName: this.cleanName(rawData.lastName),
            email: rawData.email?.toLowerCase().trim(),
            phone: rawData.phone?.replace(/\s/g, ''),
            dob: rawData.dob, // Expected format YYYY-MM-DD
            taxId: rawData.taxId?.toUpperCase().trim(),
        };

        if (!cleaned.firstName) errors.push('First name is required');
        if (!cleaned.lastName) errors.push('Last name is required');
        if (cleaned.email && !this.validateEmail(cleaned.email)) errors.push('Invalid email format');
        if (cleaned.phone && !this.validatePhone(cleaned.phone)) errors.push('Invalid phone format');
        if (!cleaned.taxId) errors.push('Tax ID is required');

        return {
            isValid: errors.length === 0,
            data: cleaned,
            errors: errors
        };
    }
}

module.exports = DataValidator;
