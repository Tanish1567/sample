// API Service for Medical Dashboard
const API_URL = 'http://localhost:3000/api';

// API Functions
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function getPatients() {
    try {
        const response = await fetch(`${API_URL}/patients`);
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to fetch patients');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
}

async function getPatientById(patientId) {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`);
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to fetch patient');
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching patient ${patientId}:`, error);
        throw error;
    }
}

async function getPatientReports(patientId) {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/reports`);
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to fetch patient reports');
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching reports for patient ${patientId}:`, error);
        throw error;
    }
}

async function getDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
}

// Export the API functions
window.medicalApi = {
    registerUser,
    loginUser,
    getPatients,
    getPatientById,
    getPatientReports,
    getDoctors
};