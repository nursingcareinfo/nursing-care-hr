/**
 * Horilla API Integration Script
 * Pushes validated and approved employee data to the HRMS.
 */

const axios = require('axios');

async function pushToHorilla(employeeData) {
    const HORILLA_URL = process.env.HORILLA_BASE_URL || 'http://localhost:8000';
    const API_KEY = process.env.HORILLA_API_KEY;

    try {
        const response = await axios.post(`${HORILLA_URL}/api/v1/employees/`, {
            first_name: employeeData.firstName,
            last_name: employeeData.lastName,
            email: employeeData.email,
            phone: employeeData.phone,
            employee_id: employeeData.taxId, // Mapping Tax ID to Employee ID for now
            date_of_birth: employeeData.dob,
            joining_date: employeeData.joiningDate || new Date().toISOString().split('T')[0],
            // Add other Horilla-specific fields here
        }, {
            headers: {
                'Authorization': `Token ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Successfully created employee: ${response.data.id}`);
        return response.data;
    } catch (error) {
        console.error('Error pushing to Horilla:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { pushToHorilla };
