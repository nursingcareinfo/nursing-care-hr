/**
 * Data Validator for HR Employee Records
 * Handles cleaning and validation of raw extracted data.
 */

const DataValidator = {
    /**
     * Capitalizes each word in a name string.
     * @param {string} name - The name to clean.
     * @returns {string} - Cleaned name with proper capitalization.
     */
    cleanName(name) {
        if (!name || name === 'No record') {
            return '';
        }
        return name.trim()
            .split(/\s+/)  // Split on one or more whitespace characters
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .filter(word => word.length > 0)  // Remove empty strings
            .join(' ');
    },

    /**
     * Validates email format.
     * @param {string} email - The email to validate.
     * @returns {boolean} - True if valid email format.
     */
    validateEmail(email) {
        if (!email || email === 'No record') {
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(email).toLowerCase());
    },

    /**
     * Validates phone number format (Pakistan numbers).
     * Accepts: +92XXXXXXXXXX, 0XXXXXXXXXX, 0XXX-XXXXXXX
     * @param {string} phone - The phone number to validate.
     * @returns {boolean} - True if valid phone format.
     */
    validatePhone(phone) {
        if (!phone || phone === 'No record') {
            return false;
        }
        const cleaned = phone.replace(/\s/g, '');
        const pakistanFormat = /^(\+92|0[0-9]{10}|0[0-9]{3}-[0-9]{7})$/;
        const internationalFormat = /^\+?[1-9]\d{9,14}$/;  // Minimum 10 digits for E.164
        return pakistanFormat.test(cleaned) || internationalFormat.test(cleaned);
    },

    /**
     * Processes and validates raw employee data.
     * @param {Object} rawData - Raw employee data from source.
     * @returns {{isValid: boolean, data: Object, errors: string[]}} - Validation result.
     */
    process(rawData) {
        const errors = [];

        const cleanedData = {
            assigned_id: rawData.assigned_id,
            name: this.cleanName(rawData.name),
            father_husband_name: rawData.father_husband_name === 'No record' ? null : this.cleanName(rawData.father_husband_name),
            date_of_birth: rawData.date_of_birth === 'No record' ? null : rawData.date_of_birth,
            gender: rawData.gender === 'No record' ? null : rawData.gender,
            cnic: rawData.cnic === 'No record' ? null : rawData.cnic,
            designation: rawData.designation === 'No record' ? null : rawData.designation,
            contact_1: rawData.contact_1 === 'No record' ? null : rawData.contact_1,
            district: rawData.district === 'No record' ? null : rawData.district,
            religion: rawData.religion === 'No record' ? null : rawData.religion,
            marital_status: rawData.marital_status === 'No record' ? null : rawData.marital_status,
            age: rawData.age === 'No record' ? null : rawData.age,
            payment_mode: rawData.payment_mode === 'No record' ? null : rawData.payment_mode,
            languages: rawData.languages === 'No record' ? null : rawData.languages
        };

        // Validation rules
        if (!cleanedData.name) {
            errors.push('Name is required');
        }

        if (cleanedData.contact_1 && cleanedData.contact_1 !== 'No record' && !this.validatePhone(cleanedData.contact_1)) {
            errors.push('Invalid phone format for Contact 1');
        }

        return {
            isValid: errors.length === 0,
            data: cleanedData,
            errors: errors
        };
    }
};

module.exports = DataValidator;
