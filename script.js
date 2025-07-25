// College Attendance Tracker - Pure JavaScript Implementation

class AttendanceTracker {
    constructor() {
        this.currentUser = null;
        this.subjects = [];
        this.attendanceRecords = {};
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.checkAuthState();
    }

    bindEvents() {
        // Login/Register form handlers
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Navigation between login/register
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('register');
        });
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('login');
        });

        // Dashboard handlers
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('addSubjectForm').addEventListener('submit', (e) => this.addSubject(e));
        document.getElementById('editSubjectForm').addEventListener('submit', (e) => this.updateSubject(e));
        
        // Event listeners for modals are now handled inline in the modal content
    }

    checkAuthState() {
        if (this.currentUser) {
            this.showDashboard();
        } else {
            this.showScreen('login');
        }
    }

    showScreen(screen) {
        document.getElementById('loginScreen').style.display = screen === 'login' ? 'block' : 'none';
        document.getElementById('registerScreen').style.display = screen === 'register' ? 'block' : 'none';
        document.getElementById('dashboardScreen').style.display = screen === 'dashboard' ? 'block' : 'none';
    }

    handleLogin(e) {
        e.preventDefault();
        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem('attendanceUsers') || '{}');
        
        if (users[studentId] && users[studentId].password === password) {
            this.currentUser = users[studentId];
            this.loadUserData();
            this.showDashboard();
            this.showAlert('Login successful!', 'success');
        } else {
            this.showAlert('Invalid student ID or password!', 'danger');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const studentId = document.getElementById('regStudentId').value;
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        const users = JSON.parse(localStorage.getItem('attendanceUsers') || '{}');
        
        if (users[studentId]) {
            this.showAlert('Student ID already exists!', 'danger');
            return;
        }

        // Check if email exists
        const emailExists = Object.values(users).some(user => user.email === email);
        if (emailExists) {
            this.showAlert('Email already registered!', 'danger');
            return;
        }

        // Create new user
        users[studentId] = {
            studentId,
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('attendanceUsers', JSON.stringify(users));
        this.showAlert('Registration successful! Please login.', 'success');
        this.showScreen('login');
    }

    showDashboard() {
        this.showScreen('dashboard');
        document.getElementById('currentStudentName').textContent = this.currentUser.name;
        document.getElementById('welcomeName').textContent = this.currentUser.name;
        this.loadSubjects();
        this.updateStats();
    }

    logout() {
        this.currentUser = null;
        this.subjects = [];
        this.attendanceRecords = {};
        this.showScreen('login');
        this.showAlert('You have been logged out.', 'info');
    }

    loadUserData() {
        if (!this.currentUser) return;
        
        const userKey = `attendance_${this.currentUser.studentId}`;
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        
        this.subjects = userData.subjects || [];
        this.attendanceRecords = userData.attendanceRecords || {};
    }

    saveUserData() {
        if (!this.currentUser) return;
        
        const userKey = `attendance_${this.currentUser.studentId}`;
        const userData = {
            subjects: this.subjects,
            attendanceRecords: this.attendanceRecords
        };
        
        localStorage.setItem(userKey, JSON.stringify(userData));
    }

    addSubject(e) {
        e.preventDefault();
        const name = document.getElementById('subjectName').value;
        const code = document.getElementById('subjectCode').value;
        const credits = parseInt(document.getElementById('credits').value);
        const totalClassesPlanned = parseInt(document.getElementById('totalClassesPlanned').value) || 0;

        const subject = {
            id: Date.now(),
            name,
            code,
            credits,
            totalClasses: 0,
            attendedClasses: 0,
            totalClassesPlanned,
            createdAt: new Date().toISOString()
        };

        this.subjects.push(subject);
        this.attendanceRecords[subject.id] = {};
        this.saveUserData();
        this.loadSubjects();
        this.updateStats();

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
        modal.hide();
        document.getElementById('addSubjectForm').reset();
        
        this.showAlert(`Subject "${name}" added successfully!`, 'success');
    }

    loadSubjects() {
        const container = document.getElementById('subjectsContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.subjects.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = '';

        this.subjects.forEach(subject => {
            const totalClasses = subject.totalClasses || 0;
            const attendedClasses = subject.attendedClasses || 0;
            const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
            const status = this.getAttendanceStatus(percentage);
            const remainingClasses = Math.max(0, totalClasses - attendedClasses);
            const classesNeededFor75 = Math.max(0, Math.ceil(totalClasses * 0.75) - attendedClasses);

            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 mb-4';
            
            col.innerHTML = `
                <div class="card subject-card status-${status}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0">${this.escapeHtml(subject.name)}</h5>
                            <small class="opacity-75">${subject.code} (${subject.credits} credits)</small>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3 text-center">
                            <div class="col-3">
                                <div class="h6 mb-0 text-primary">${totalClasses}</div>
                                <small class="text-muted">Held</small>
                            </div>
                            <div class="col-3">
                                <div class="h6 mb-0 text-success">${attendedClasses}</div>
                                <small class="text-muted">Present</small>
                            </div>
                            <div class="col-3">
                                <div class="h6 mb-0 text-danger">${totalClasses - attendedClasses}</div>
                                <small class="text-muted">Absent</small>
                            </div>
                            <div class="col-3">
                                <div class="h6 mb-0 text-info">${subject.totalClassesPlanned || 'N/A'}</div>
                                <small class="text-muted">Planned</small>
                            </div>
                        </div>
                        
                        ${subject.totalClassesPlanned ? `
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span>Progress</span>
                                <span>${totalClasses}/${subject.totalClassesPlanned} classes</span>
                            </div>
                            <div class="progress mb-2" style="height: 6px;">
                                <div class="progress-bar bg-info" style="width: ${Math.min((totalClasses / subject.totalClassesPlanned) * 100, 100)}%"></div>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span>Attendance</span>
                                <span class="fw-bold">${percentage.toFixed(1)}%</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-${status === 'safe' ? 'success' : status === 'warning' ? 'warning' : 'danger'}" 
                                     style="width: ${Math.min(percentage, 100)}%"></div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <span class="badge status-badge status-${status}">
                                ${status === 'safe' ? '✓ Safe (≥75%)' : status === 'warning' ? '⚠ Warning (65-74%)' : '⚠ At Risk (<65%)'}
                            </span>
                        </div>

                        <div class="mb-3">
                            <small class="text-muted">
                                ${classesNeededFor75 > 0 
                                    ? `Attend ${classesNeededFor75} more to reach 75%`
                                    : percentage >= 75 
                                        ? '✓ Target achieved!'
                                        : totalClasses === 0 
                                            ? 'Start marking attendance'
                                            : 'Keep attending classes'
                                }
                            </small>
                        </div>

                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm flex-fill" onclick="window.attendanceApp.openEditModal(${subject.id})">
                                <i class="fas fa-edit me-1"></i>Edit Today
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="window.attendanceApp.editSubjectDetails(${subject.id})" title="Edit Subject Details">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
    }

    openEditModal(subjectId) {
        this.currentSubjectId = subjectId;
        const subject = this.subjects.find(s => s.id === subjectId);
        
        document.getElementById('attendanceModalTitle').textContent = `${subject.name} - Mark Today's Attendance`;
        
        // Show today's date and options
        this.showTodaysAttendance(subjectId);
        
        const modal = new bootstrap.Modal(document.getElementById('markAttendanceModal'));
        modal.show();
    }

    showTodaysAttendance(subjectId) {
        const container = document.getElementById('recentAttendance');
        const subject = this.subjects.find(s => s.id === subjectId);
        
        const totalClasses = subject.totalClasses || 0;
        const attendedClasses = subject.attendedClasses || 0;
        const currentPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        const classesNeededFor75 = Math.max(0, Math.ceil(totalClasses * 0.75) - attendedClasses);
        
        const today = new Date().toLocaleDateString();

        container.innerHTML = `
            <div class="text-center mb-4">
                <h5>Today: ${today}</h5>
                <p class="text-muted">Was there a class today? Mark your attendance:</p>
            </div>
            
            <div class="d-flex justify-content-center gap-3 mb-4">
                <button type="button" class="btn btn-success btn-lg" onclick="window.attendanceApp.markTodayAttendance(true)">
                    <i class="fas fa-check me-2"></i>Present
                </button>
                <button type="button" class="btn btn-danger btn-lg" onclick="window.attendanceApp.markTodayAttendance(false)">
                    <i class="fas fa-times me-2"></i>Absent
                </button>
            </div>

            <div class="row g-3 mt-3">
                <div class="col-6">
                    <div class="text-center p-2 bg-light rounded">
                        <h6 class="text-primary mb-0">${totalClasses}</h6>
                        <small class="text-muted">Total Classes</small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="text-center p-2 bg-light rounded">
                        <h6 class="text-success mb-0">${attendedClasses}</h6>
                        <small class="text-muted">Attended</small>
                    </div>
                </div>
            </div>
            
            <div class="mt-3 p-3 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <span>Current: ${currentPercentage.toFixed(1)}%</span>
                    <small class="text-muted">
                        ${classesNeededFor75 > 0 
                            ? `Need ${classesNeededFor75} more to reach 75%`
                            : '✓ Target achieved!'
                        }
                    </small>
                </div>
            </div>
        `;
    }

    markTodayAttendance(isPresent) {
        if (!this.currentSubjectId) return;

        const subject = this.subjects.find(s => s.id === this.currentSubjectId);
        if (!subject) return;

        if (isPresent) {
            // Increase both total and attended classes
            subject.totalClasses = (subject.totalClasses || 0) + 1;
            subject.attendedClasses = (subject.attendedClasses || 0) + 1;
        } else {
            // Increase only total classes (new class held but absent)
            subject.totalClasses = (subject.totalClasses || 0) + 1;
        }

        this.saveUserData();
        this.loadSubjects();
        this.updateStats();
        this.showTodaysAttendance(this.currentSubjectId);

        const status = isPresent ? 'Present' : 'Absent';
        this.showAlert(`Marked ${status} for today`, 'success');
    }

    editSubjectDetails(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        this.currentSubjectId = subjectId;

        // Populate the edit form
        document.getElementById('editSubjectName').value = subject.name;
        document.getElementById('editSubjectCode').value = subject.code;
        document.getElementById('editCredits').value = subject.credits;
        document.getElementById('editTotalClassesPlanned').value = subject.totalClassesPlanned || '';
        document.getElementById('editTotalClasses').value = subject.totalClasses || 0;
        document.getElementById('editAttendedClasses').value = subject.attendedClasses || 0;

        const modal = new bootstrap.Modal(document.getElementById('editSubjectModal'));
        modal.show();
    }

    updateSubject(e) {
        e.preventDefault();
        if (!this.currentSubjectId) return;

        const subject = this.subjects.find(s => s.id === this.currentSubjectId);
        if (!subject) return;

        // Update subject details
        subject.name = document.getElementById('editSubjectName').value;
        subject.code = document.getElementById('editSubjectCode').value;
        subject.credits = parseInt(document.getElementById('editCredits').value);
        subject.totalClassesPlanned = parseInt(document.getElementById('editTotalClassesPlanned').value) || 0;
        subject.totalClasses = parseInt(document.getElementById('editTotalClasses').value) || 0;
        subject.attendedClasses = parseInt(document.getElementById('editAttendedClasses').value) || 0;

        // Ensure attended classes doesn't exceed total classes
        if (subject.attendedClasses > subject.totalClasses) {
            subject.attendedClasses = subject.totalClasses;
        }

        this.saveUserData();
        this.loadSubjects();
        this.updateStats();

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSubjectModal'));
        modal.hide();
        document.getElementById('editSubjectForm').reset();
        
        this.showAlert(`Subject "${subject.name}" updated successfully!`, 'success');
    }

    getAttendanceStatus(percentage) {
        if (percentage >= 75) return 'safe';
        if (percentage >= 65) return 'warning';
        return 'danger';
    }

    getPredictionMessage(attended, total, percentage) {
        if (total === 0) return 'No classes recorded yet';
        
        if (percentage >= 75) {
            const canMiss = Math.floor(attended / 0.75 - total);
            return canMiss > 0 ? `You can miss ${canMiss} more class${canMiss !== 1 ? 'es' : ''}` : 'Attend all remaining classes';
        } else {
            const needed = Math.ceil((0.75 * total - attended) / 0.25);
            return `Attend next ${needed} class${needed !== 1 ? 'es' : ''} to reach 75%`;
        }
    }

    updateStats() {
        const totalSubjects = this.subjects.length;
        let totalPercentage = 0;
        let safeCount = 0;
        let riskCount = 0;

        this.subjects.forEach(subject => {
            const totalClasses = subject.totalClasses || 0;
            const attendedClasses = subject.attendedClasses || 0;
            const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
            
            totalPercentage += percentage;
            
            const status = this.getAttendanceStatus(percentage);
            if (status === 'safe') {
                safeCount++;
            } else if (status === 'danger') {
                riskCount++;
            }
        });

        const avgAttendance = totalSubjects > 0 ? (totalPercentage / totalSubjects) : 0;

        document.getElementById('totalSubjects').textContent = totalSubjects;
        document.getElementById('avgAttendance').textContent = `${avgAttendance.toFixed(1)}%`;
        document.getElementById('safeSubjects').textContent = safeCount;
        document.getElementById('riskSubjects').textContent = riskCount;
    }

    showAlert(message, type) {
        const container = document.getElementById('alertContainer');
        
        // Remove existing alerts
        container.innerHTML = '';

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        container.appendChild(alertDiv);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
window.attendanceApp = new AttendanceTracker();