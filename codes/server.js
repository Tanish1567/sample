const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage paths
const DB_DIR = path.join(__dirname, 'db');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const PATIENTS_FILE = path.join(DB_DIR, 'patients.json');
const DOCTORS_FILE = path.join(DB_DIR, 'doctors.json');
const REPORTS_FILE = path.join(DB_DIR, 'reports.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
}

// Initialize database files if they don't exist
function initializeDbFile(filePath, initialData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }
}

initializeDbFile(USERS_FILE);
initializeDbFile(PATIENTS_FILE);
initializeDbFile(DOCTORS_FILE);
initializeDbFile(REPORTS_FILE);

// Helper functions to read/write data
function readData(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        return false;
    }
}

// Generate random patient data
function generateRandomPatients(count = 10) {
    const patients = [];
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Olivia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const age = Math.floor(Math.random() * 50) + 18;
        
        patients.push({
            id: `p${i + 1}`,
            name: `${firstName} ${lastName}`,
            age: age,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
            weight: Math.floor(50 + Math.random() * 50),
            height: Math.floor(150 + Math.random() * 50),
            heartRate: Math.floor(60 + Math.random() * 40),
            bloodPressure: `${Math.floor(110 + Math.random() * 40)}/${Math.floor(70 + Math.random() * 20)}`
        });
    }
    
    return patients;
}

// Generate sample doctors
function generateDoctors() {
    return [
        { id: 'd1', name: 'Dr. Meera Joshi', specialization: 'General Medicine', email: 'meera.joshi@example.com' },
        { id: 'd2', name: 'Dr. Raj Patel', specialization: 'Cardiology', email: 'raj.patel@example.com' },
        { id: 'd3', name: 'Dr. Sarah Wilson', specialization: 'Pediatrics', email: 'sarah.wilson@example.com' }
    ];
}

// Generate sample reports
function generateReports(patientIds) {
    const reports = [];
    const reportTypes = ['Blood Test', 'X-Ray', 'ECG', 'MRI', 'CT Scan', 'Ultrasound'];
    
    patientIds.forEach(patientId => {
        const reportCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < reportCount; i++) {
            const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            reports.push({
                id: `r${reports.length + 1}`,
                patientId: patientId,
                type: reportType,
                date: date.toISOString().split('T')[0],
                doctorId: `d${Math.floor(Math.random() * 3) + 1}`,
                findings: `Sample findings for ${reportType}. All values are within normal range.`,
                impression: `Normal ${reportType} results. No significant abnormalities detected.`
            });
        }
    });
    
    return reports;
}

// Initialize with sample data if empty
let patients = readData(PATIENTS_FILE);
if (patients.length === 0) {
    patients = generateRandomPatients(10);
    writeData(PATIENTS_FILE, patients);
}

let doctors = readData(DOCTORS_FILE);
if (doctors.length === 0) {
    doctors = generateDoctors();
    writeData(DOCTORS_FILE, doctors);
}

let reports = readData(REPORTS_FILE);
if (reports.length === 0) {
    reports = generateReports(patients.map(p => p.id));
    writeData(REPORTS_FILE, reports);
}

// API Routes
// User registration
app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const users = readData(USERS_FILE);
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    const newUser = {
        id: `user${users.length + 1}`,
        name,
        email,
        password, // In a real app, this should be hashed
        role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    if (writeData(USERS_FILE, users)) {
        // If role is patient, also create a patient record
        if (role === 'patient') {
            const patients = readData(PATIENTS_FILE);
            const newPatient = {
                id: `p${patients.length + 1}`,
                name,
                email,
                age: Math.floor(Math.random() * 50) + 18, // Random age
                userId: newUser.id
            };
            
            patients.push(newPatient);
            writeData(PATIENTS_FILE, patients);
        }
        
        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } else {
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = readData(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Return user without password
    const { password: pwd, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// Get all patients
app.get('/api/patients', (req, res) => {
    const patients = readData(PATIENTS_FILE);
    res.json(patients);
});

// Get patient by ID
app.get('/api/patients/:id', (req, res) => {
    const patients = readData(PATIENTS_FILE);
    const patient = patients.find(p => p.id === req.params.id);
    
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
});

// Get reports for a patient
app.get('/api/patients/:id/reports', (req, res) => {
    const reports = readData(REPORTS_FILE);
    const patientReports = reports.filter(r => r.patientId === req.params.id);
    res.json(patientReports);
});

// Get all doctors
app.get('/api/doctors', (req, res) => {
    const doctors = readData(DOCTORS_FILE);
    res.json(doctors);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});