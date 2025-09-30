// Authentication System for HAECO V6
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        if (window.location.pathname.includes('dashboard') && !this.currentUser) {
            window.location.href = '../index.html';
            return;
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    loadUsers() {
        const defaultUsers = {
            'demo': {
                username: 'demo',
                password: 'demo123',
                role: 'admin',
                name: 'Demo User',
                email: 'demo@haeco.com',
                lastLogin: null
            },
            'admin': {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'Administrator',
                email: 'admin@haeco.com',
                lastLogin: null
            }
        };

        const stored = localStorage.getItem('haeco_v6_users');
        return stored ? { ...defaultUsers, ...JSON.parse(stored) } : defaultUsers;
    }

    saveUsers() {
        const usersToSave = { ...this.users };
        delete usersToSave.demo;
        delete usersToSave.admin;
        localStorage.setItem('haeco_v6_users', JSON.stringify(usersToSave));
    }

    getCurrentUser() {
        const stored = sessionStorage.getItem('haeco_v6_current_user');
        return stored ? JSON.parse(stored) : null;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        sessionStorage.setItem('haeco_v6_current_user', JSON.stringify(user));
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (this.validateLogin(username, password)) {
            const user = this.users[username];
            user.lastLogin = new Date().toISOString();
            this.setCurrentUser(user);
            this.saveUsers();
            window.location.href = 'pages/dashboard/index.html';
        } else {
            this.showError('Invalid username or password');
        }
    }

    validateLogin(username, password) {
        const user = this.users[username];
        return user && user.password === password;
    }

    logout() {
        sessionStorage.removeItem('haeco_v6_current_user');
        window.location.href = '../../index.html';
    }

    showError(message) {
        const existing = document.querySelector('.error-message');
        if (existing) existing.remove();

        const error = document.createElement('div');
        error.className = 'error-message';
        error.style.cssText = `
            background: var(--error-red);
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            text-align: center;
            font-weight: 500;
        `;
        error.textContent = message;

        const form = document.getElementById('loginForm');
        form.appendChild(error);

        setTimeout(() => error.remove(), 3000);
    }

    createUser(userData) {
        if (this.users[userData.username]) {
            throw new Error('Username already exists');
        }

        this.users[userData.username] = {
            ...userData,
            lastLogin: null
        };
        this.saveUsers();
        return true;
    }

    updateUser(username, userData) {
        if (!this.users[username]) {
            throw new Error('User not found');
        }

        this.users[username] = { ...this.users[username], ...userData };
        this.saveUsers();
        return true;
    }

    deleteUser(username) {
        if (['demo', 'admin'].includes(username)) {
            throw new Error('Cannot delete system users');
        }

        delete this.users[username];
        this.saveUsers();
        return true;
    }

    getAllUsers() {
        return Object.values(this.users);
    }
}

// Initialize auth system
window.authSystem = new AuthSystem();