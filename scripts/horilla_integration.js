/**
 * Horilla API Integration Script
 * Pushes validated and approved employee data to the HRMS.
 */

const axios = require('axios');

/**
 * Horilla API configuration and client.
 */
class HorillaClient {
    /**
     * Creates Horilla client with configuration.
     * @param {Object} config - Configuration object.
     * @param {string} config.baseUrl - Horilla API base URL.
     * @param {string} config.apiKey - API authentication token.
     */
    constructor(config) {
        this.baseUrl = config.baseUrl || 'http://localhost:8000';
        this.apiKey = config.apiKey;

        if (!this.apiKey) {
            throw new Error('Horilla API key is required');
        }

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Validates employee data before sending to API.
     * @param {Object} employeeData - Employee data to validate.
     * @returns {{isValid: boolean, errors: string[]}} - Validation result.
     */
    validateEmployeeData(employeeData) {
        const errors = [];

        if (!employeeData.firstName || !employeeData.lastName) {
            errors.push('First name and last name are required');
        }

        if (employeeData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
            errors.push('Invalid email format');
        }

        if (employeeData.phone && !/^\+?[1-9]\d{1,14}$/.test(employeeData.phone.replace(/\s/g, ''))) {
            errors.push('Invalid phone format');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Pushes employee data to Horilla HRMS.
     * @param {Object} employeeData - Employee data to push.
     * @returns {Promise<Object>} - API response data.
     */
    async pushEmployee(employeeData) {
        const validation = this.validateEmployeeData(employeeData);
        if (!validation.isValid) {
            const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
            error.code = 'VALIDATION_ERROR';
            throw error;
        }

        try {
            const payload = {
                first_name: employeeData.firstName,
                last_name: employeeData.lastName,
                email: employeeData.email,
                phone: employeeData.phone,
                employee_id: employeeData.taxId,
                date_of_birth: employeeData.dob,
                joining_date: employeeData.joiningDate || new Date().toISOString().split('T')[0]
            };

            const response = await this.client.post('/api/v1/employees/', payload);
            console.log(`Successfully created employee: ${response.data.id}`);
            return response.data;

        } catch (error) {
            if (error.code === 'VALIDATION_ERROR') {
                throw error;
            }

            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            console.error('Error pushing to Horilla:', errorMessage);

            const apiError = new Error(`Horilla API error: ${errorMessage}`);
            apiError.code = 'API_ERROR';
            apiError.status = error.response?.status;
            throw apiError;
        }
    }

    /**
     * Pushes multiple employees in batch.
     * @param {Array<Object>} employees - Array of employee data.
     * @returns {Promise<{success: Object[], failed: Array<{data: Object, error: Error}>}>}
     */
    async pushEmployeesBatch(employees) {
        const success = [];
        const failed = [];

        for (const employee of employees) {
            try {
                const result = await this.pushEmployee(employee);
                success.push(result);
            } catch (error) {
                failed.push({ data: employee, error: error });
                console.error(`Failed to push employee ${employee.firstName} ${employee.lastName}:`, error.message);
            }
        }

        console.log(`Batch complete: ${success.length} succeeded, ${failed.length} failed`);
        return { success, failed };
    }
}

module.exports = HorillaClient;
