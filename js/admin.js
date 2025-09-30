// Admin System for HAECO V6
class AdminManager {
    constructor() {
        this.init();
    }

    init() {
        this.updateSystemInfo();
        this.renderUsersTable();
        this.loadSettings();
        this.renderSystemLogs();
        this.setupEventListeners();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.updateSystemInfo();
            this.renderSystemLogs();
        }, 30000);
    }

    updateSystemInfo() {
        // Update current user
        const currentUser = window.authSystem?.currentUser;
        if (currentUser) {
            document.getElementById('currentUser').textContent = `${currentUser.name} (${currentUser.role})`;
        }

        // Update storage usage
        this.updateStorageInfo();
        
        // Update data counts
        this.updateDataCounts();
    }

    updateStorageInfo() {
        const aircraftData = localStorage.getItem('haeco_v6_aircraft') || '[]';
        const bayData = localStorage.getItem('haeco_v6_bays') || '{}';
        const logData = localStorage.getItem('haeco_v6_logs') || '[]';
        const userData = localStorage.getItem('haeco_v6_users') || '{}';

        const aircraftSize = new Blob([aircraftData]).size;
        const baySize = new Blob([bayData]).size;
        const logSize = new Blob([logData]).size;
        const userSize = new Blob([userData]).size;
        const totalSize = aircraftSize + baySize + logSize + userSize;

        document.getElementById('aircraftStorage').textContent = this.formatBytes(aircraftSize);
        document.getElementById('bayStorage').textContent = this.formatBytes(baySize);
        document.getElementById('logStorage').textContent = this.formatBytes(logSize);
        document.getElementById('totalStorage').textContent = this.formatBytes(totalSize);
    }

    updateDataCounts() {
        document.getElementById('aircraftCount').textContent = `${window.haecoCore.aircraft.length} records`;
        //document.getElementById('movementCount').textContent = `${window.haecoCore.movements.length} records`;
        document.getElementById('logCount').textContent = `${window.haecoCore.logs.length} entries`;
    }

    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        const users = window.authSystem.getAllUsers();
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            const lastLogin = user.lastLogin ? 
                new Date(user.lastLogin).toLocaleDateString() : 
                'Never';

            const isSystemUser = ['demo', 'admin'].includes(user.username);

            row.innerHTML = `
                <td><strong>${user.username}</strong></td>
                <td>${user.name}</td>
                <td><span class="status ${user.role === 'admin' ? 'status-active' : 'status-pending'}">${user.role}</span></td>
                <td>${lastLogin}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editUser('${user.username}')" ${isSystemUser ? 'disabled' : ''}>Edit</button>
                    <button class="btn btn-warning" onclick="deleteUser('${user.username}')" ${isSystemUser ? 'disabled' : ''}>Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadSettings() {
        const settings = window.haecoCore.settings;
        const form = document.getElementById('settingsForm');
        if (!form) return;

        form.autoSaveInterval.value = settings.autoSaveInterval / 1000; // Convert to seconds
        form.maxLogEntries.value = settings.maxLogEntries;
        form.defaultTowingCost.value = settings.defaultTowingCost;
        form.aiIntelligenceLevel.value = settings.aiIntelligenceLevel;
    }

    renderSystemLogs() {
        const container = document.getElementById('systemLogs');
        if (!container) return;

        const filter = document.getElementById('logFilter')?.value || 'all';
        let logs = window.haecoCore.logs;

        if (filter !== 'all') {
            logs = logs.filter(log => log.action === filter);
        }

        container.innerHTML = '';

        if (logs.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-4">No logs found</p>';
            return;
        }

        logs.slice(0, 50).forEach(log => { // Show last 50 logs
            const logElement = document.createElement('div');
            logElement.style.cssText = `
                padding: 12px;
                border-bottom: 1px solid var(--gray-2);
                transition: var(--transition);
            `;
            logElement.onmouseover = () => logElement.style.background = 'var(--gray-1)';
            logElement.onmouseout = () => logElement.style.background = 'transparent';

            const timestamp = new Date(log.timestamp).toLocaleString();
            
            logElement.innerHTML = `
                <div class="flex justify-between align-center">
                    <div>
                        <strong>${log.action}</strong>
                        <div class="text-gray-4">${log.description}</div>
                    </div>
                    <div class="text-gray-4" style="font-size: 12px; text-align: right;">
                        ${timestamp}<br>
                        ${log.user}
                    </div>
                </div>
            `;
            
            container.appendChild(logElement);
        });
    }

    setupEventListeners() {
        // Global functions for buttons
        window.showAddUserModal = () => this.showAddUserModal();
        window.editUser = (username) => this.editUser(username);
        window.deleteUser = (username) => this.deleteUser(username);
        window.saveSettings = () => this.saveSettings();
        window.backupData = () => this.backupData();
        window.clearLogs = () => this.clearLogs();
        window.resetSystem = () => this.resetSystem();
        window.importData = () => this.importData();
        window.exportAllData = () => this.exportAllData();
        window.exportAircraftData = () => this.exportAircraftData();
        window.exportBayData = () => this.exportBayData();
        window.exportMovementData = () => this.exportMovementData();
        window.exportLogData = () => this.exportLogData();
        window.clearAircraftData = () => this.clearAircraftData();
        window.resetBayData = () => this.resetBayData();
        window.clearMovementData = () => this.clearMovementData();
        window.clearLogData = () => this.clearLogData();
        window.filterLogs = () => this.renderSystemLogs();
        window.refreshLogs = () => this.renderSystemLogs();
    }

    showAddUserModal() {
        const modal = this.createModal('Add New User', `
            <form id="addUserForm">
                <div class="form-group">
                    <label class="form-label">Username *</label>
                    <input type="text" class="form-input" name="username" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email">
                </div>
                <div class="form-group">
                    <label class="form-label">Password *</label>
                    <input type="password" class="form-input" name="password" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Role</label>
                    <select class="form-select" name="role">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="flex gap-2 mt-2">
                    <button type="submit" class="btn btn-primary">Add User</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                </div>
            </form>
        `);

        const form = modal.querySelector('#addUserForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const userData = Object.fromEntries(formData);
            
            try {
                window.authSystem.createUser(userData);
                this.renderUsersTable();
                modal.remove();
                this.showNotification('User created successfully', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        };
    }

    editUser(username) {
        const users = window.authSystem.getAllUsers();
        const user = users.find(u => u.username === username);
        if (!user) return;

        const modal = this.createModal('Edit User', `
            <form id="editUserForm">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-input" value="${user.username}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-input" name="name" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email" value="${user.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">New Password (leave blank to keep current)</label>
                    <input type="password" class="form-input" name="password">
                </div>
                <div class="form-group">
                    <label class="form-label">Role</label>
                    <select class="form-select" name="role">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="flex gap-2 mt-2">
                    <button type="submit" class="btn btn-primary">Update User</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                </div>
            </form>
        `);

        const form = modal.querySelector('#editUserForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const updates = Object.fromEntries(formData);
            
            // Remove empty password
            if (!updates.password) {
                delete updates.password;
            }
            
            try {
                window.authSystem.updateUser(username, updates);
                this.renderUsersTable();
                modal.remove();
                this.showNotification('User updated successfully', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        };
    }

    deleteUser(username) {
        if (confirm(`Are you sure you want to delete user "${username}"?`)) {
            try {
                window.authSystem.deleteUser(username);
                this.renderUsersTable();
                this.showNotification('User deleted successfully', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    saveSettings() {
        const form = document.getElementById('settingsForm');
        if (!form) return;

        const formData = new FormData(form);
        const settings = {
            autoSaveInterval: parseInt(formData.get('autoSaveInterval')) * 1000, // Convert to milliseconds
            maxLogEntries: parseInt(formData.get('maxLogEntries')),
            defaultTowingCost: parseInt(formData.get('defaultTowingCost')),
            aiIntelligenceLevel: parseInt(formData.get('aiIntelligenceLevel'))
        };

        window.haecoCore.settings = { ...window.haecoCore.settings, ...settings };
        window.haecoCore.saveSettings();

        // Update AI engine intelligence level
        if (window.aiEngine) {
            window.aiEngine.intelligenceLevel = settings.aiIntelligenceLevel;
        }

        this.showNotification('Settings saved successfully', 'success');
    }

    backupData() {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '6.0',
            data: {
                aircraft: window.haecoCore.aircraft,
                bays: window.haecoCore.bays,
                movements: window.haecoCore.movements,
                logs: window.haecoCore.logs,
                settings: window.haecoCore.settings,
                users: window.authSystem.getAllUsers()
            }
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `haeco_v6_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Backup created successfully', 'success');
    }

    clearLogs() {
        if (confirm('Are you sure you want to clear all system logs?')) {
            window.haecoCore.logs = [];
            window.haecoCore.saveLogs();
            this.renderSystemLogs();
            this.updateSystemInfo();
            this.showNotification('System logs cleared', 'success');
        }
    }

    resetSystem() {
        if (confirm('Are you sure you want to reset the entire system? This will clear all data except user accounts.')) {
            // Clear all data except users
            window.haecoCore.aircraft = [];
            window.haecoCore.movements = [];
            window.haecoCore.logs = [];
            
            // Reset bays to default state
            Object.keys(window.haecoCore.bays).forEach(bayId => {
                window.haecoCore.bays[bayId].occupied = false;
                window.haecoCore.bays[bayId].aircraft = null;
            });

            window.haecoCore.saveAll();
            
            this.updateSystemInfo();
            this.renderSystemLogs();
            this.showNotification('System reset successfully', 'success');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (data.data) {
                            // Full backup restore
                            if (confirm('This will replace all current data. Continue?')) {
                                if (data.data.aircraft) window.haecoCore.aircraft = data.data.aircraft;
                                if (data.data.bays) window.haecoCore.bays = data.data.bays;
                                if (data.data.movements) window.haecoCore.movements = data.data.movements;
                                if (data.data.logs) window.haecoCore.logs = data.data.logs;
                                if (data.data.settings) window.haecoCore.settings = data.data.settings;
                                
                                window.haecoCore.saveAll();
                                this.updateSystemInfo();
                                this.renderSystemLogs();
                                this.loadSettings();
                                this.showNotification('Data imported successfully', 'success');
                            }
                        } else {
                            this.showNotification('Invalid backup file format', 'error');
                        }
                    } catch (error) {
                        this.showNotification(`Import failed: ${error.message}`, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    exportAllData() {
        const data = window.haecoCore.exportData('json');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `haeco_v6_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportAircraftData() {
        const data = window.haecoCore.convertToCSV(window.haecoCore.aircraft);
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aircraft_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportBayData() {
        const bayData = Object.entries(window.haecoCore.bays).map(([id, bay]) => ({
            id,
            type: bay.type,
            category: bay.category,
            occupied: bay.occupied,
            aircraft: bay.aircraft
        }));
        
        const data = window.haecoCore.convertToCSV(bayData);
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bay_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportMovementData() {
        const data = window.haecoCore.convertToCSV(window.haecoCore.movements);
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movement_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportLogData() {
        const data = window.haecoCore.convertToCSV(window.haecoCore.logs);
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `log_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearAircraftData() {
        if (confirm('Are you sure you want to clear all aircraft data?')) {
            window.haecoCore.aircraft = [];
            window.haecoCore.saveAircraft();
            this.updateSystemInfo();
            this.showNotification('Aircraft data cleared', 'success');
        }
    }

    resetBayData() {
        if (confirm('Are you sure you want to reset all bay assignments?')) {
            Object.keys(window.haecoCore.bays).forEach(bayId => {
                window.haecoCore.bays[bayId].occupied = false;
                window.haecoCore.bays[bayId].aircraft = null;
            });
            
            // Update aircraft status
            window.haecoCore.aircraft.forEach(aircraft => {
                aircraft.currentBay = null;
                aircraft.status = 'scheduled';
            });
            
            window.haecoCore.saveBays();
            window.haecoCore.saveAircraft();
            this.showNotification('Bay data reset', 'success');
        }
    }

    clearMovementData() {
        if (confirm('Are you sure you want to clear all movement data?')) {
            window.haecoCore.movements = [];
            window.haecoCore.saveMovements();
            this.updateSystemInfo();
            this.showNotification('Movement data cleared', 'success');
        }
    }

    clearLogData() {
        if (confirm('Are you sure you want to clear all log data?')) {
            window.haecoCore.logs = [];
            window.haecoCore.saveLogs();
            this.renderSystemLogs();
            this.updateSystemInfo();
            this.showNotification('Log data cleared', 'success');
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: var(--white);
                border-radius: var(--border-radius);
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: var(--gray-6);">${title}</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: var(--gray-4);
                    ">&times;</button>
                </div>
                <div>${content}</div>
            </div>
        `;

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        document.body.appendChild(modal);
        return modal;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? 'var(--success-green)' : 
                        type === 'error' ? 'var(--error-red)' : 
                        type === 'warning' ? 'var(--warning-orange)' : 'var(--primary-blue)'};
        `;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});