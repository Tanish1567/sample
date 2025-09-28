// Modified frontend code to work with the backend API
document.addEventListener('DOMContentLoaded', () => {
  // Check if we have a logged in user in localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    state.currentUser = user;
    state.currentRole = user.role;
    renderApp();
  }

  // Override the signup function
  window.handleSignup = async function() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.querySelector('input[name="role"]:checked').value;
    
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const userData = { name, email, password, role };
      const user = await window.medicalApi.registerUser(userData);
      
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Update state
      state.currentUser = user;
      state.currentRole = user.role;
      
      // Render the app
      renderApp();
      
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  };
  
  // Override the login function
  window.handleLogin = async function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    
    try {
      const credentials = { email, password };
      const user = await window.medicalApi.loginUser(credentials);
      
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Update state
      state.currentUser = user;
      state.currentRole = user.role;
      
      // Render the app
      renderApp();
      
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };
  
  // Override the logout function
  window.handleLogout = function() {
    // Clear localStorage
    localStorage.removeItem('currentUser');
    
    // Reset state
    state.currentUser = null;
    state.currentRole = null;
    
    // Render the app
    renderApp();
  };
  
  // Override the renderDoctorDashboard function to fetch patients from API
  window.renderDoctorDashboardWithAPI = async function(doctorId) {
    try {
      // Fetch patients from API
      const patients = await window.medicalApi.getPatients();
      
      // Update state
      state.patients = patients;
      
      // Call the original renderDoctorDashboard function
      renderDoctorDashboard(doctorId);
      
    } catch (error) {
      console.error('Error loading doctor dashboard:', error);
      alert('Failed to load patients data');
    }
  };
  
  // Override the renderPatientDashboard function to fetch patient data from API
  window.renderPatientDashboardWithAPI = async function(patientId) {
    try {
      // Fetch patient data from API
      const patient = await window.medicalApi.getPatientById(patientId);
      
      // Fetch patient reports from API
      const reports = await window.medicalApi.getPatientReports(patientId);
      
      // Update state
      const patientIndex = state.patients.findIndex(p => p.id === patientId);
      if (patientIndex !== -1) {
        state.patients[patientIndex] = patient;
      } else {
        state.patients.push(patient);
      }
      
      // Update reports in state
      state.reports = reports;
      
      // Call the original renderPatientDashboard function
      renderPatientDashboard(patientId);
      
    } catch (error) {
      console.error('Error loading patient dashboard:', error);
      alert('Failed to load patient data');
    }
  };
});