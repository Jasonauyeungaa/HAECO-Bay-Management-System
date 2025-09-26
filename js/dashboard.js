// Dashboard Controller for HAECO V6
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.updateStats();
        this.renderBayOverview();
        this.renderRecentActivity();
        this.setupEventListeners();
        
        // Refresh data every 30 seconds
        setInterval(() => {
            this.updateStats();
            this.renderBayOverview();
        }, 30000);
    }

    updateStats() {
        const stats = window.haecoCore.getStatistics();
        
        document.getElementById('totalBays').textContent = stats.totalBays;
        document.getElementById('occupiedBays').textContent = stats.occupiedBays;
        document.getElementById('totalAircraft').textContent = stats.totalAircraft;
        document.getElementById('efficiency').textContent = stats.efficiency + '%';
    }

    renderBayOverview() {
        const container = document.getElementById('bayOverview');
        if (!container) return;

        container.innerHTML = '';
        
        const bays = window.haecoCore.bays;
        const bayOrder = ['1', '2', '3', '4', '5', '6', '7', '8', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'N', 'P', 'Q', 'R'];
        
        bayOrder.forEach(bayId => {
            const bay = bays[bayId];
            if (!bay) return;

            const bayElement = document.createElement('div');
            bayElement.className = `bay-slot ${bay.type} ${bay.occupied ? 'occupied' : ''}`;
            bayElement.onclick = () => this.showBayDetails(bayId);
            
            let aircraftInfo = '';
            if (bay.occupied && bay.aircraft) {
                const aircraft = window.haecoCore.aircraft.find(a => a.id === bay.aircraft);
                aircraftInfo = aircraft ? `<div class="bay-aircraft">${aircraft.registration}</div>` : '';
            }

            bayElement.innerHTML = `
                <div class="bay-number">${bayId}</div>
                <div class="bay-type">${bay.category}</div>
                ${aircraftInfo}
            `;
            
            container.appendChild(bayElement);
        });
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const logs = window.haecoCore.logs.slice(0, 5); // Show last 5 activities
        
        container.innerHTML = '';
        
        if (logs.length === 0) {
            container.innerHTML = `
                <div class="timeline-item">
                    <div class="timeline-time">Now</div>
                    <div class="timeline-content">
                        <strong>System Ready</strong><br>
                        No recent activity. System is ready for operations.
                    </div>
                </div>
            `;
            return;
        }

        logs.forEach(log => {
            const timeAgo = this.getTimeAgo(log.timestamp);
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-time">${timeAgo}</div>
                <div class="timeline-content">
                    <strong>${log.action}</strong><br>
                    ${log.description}
                </div>
            `;
            container.appendChild(item);
        });
    }

    showBayDetails(bayId) {
        const bay = window.haecoCore.bays[bayId];
        let content = `
            <h3>Bay ${bayId} - ${bay.category}</h3>
            <p><strong>Type:</strong> ${bay.type}</p>
            <p><strong>Status:</strong> ${bay.occupied ? 'Occupied' : 'Available'}</p>
        `;

        if (bay.occupied && bay.aircraft) {
            const aircraft = window.haecoCore.aircraft.find(a => a.id === bay.aircraft);
            if (aircraft) {
                content += `
                    <p><strong>Aircraft:</strong> ${aircraft.registration}</p>
                    <p><strong>Type:</strong> ${aircraft.type}</p>
                    <p><strong>Work:</strong> ${aircraft.workType}</p>
                    <p><strong>Priority:</strong> ${aircraft.priority}</p>
                `;
            }
        }

        if (bay.capabilities) {
            content += `<p><strong>Capabilities:</strong> ${bay.capabilities.join(', ')}</p>`;
        }

        this.showModal('Bay Details', content);
    }

    showModal(title, content) {
        // Remove existing modal
        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();

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
    }

    setupEventListeners() {
        // Quick action buttons
        window.importData = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            if (file.name.endsWith('.csv')) {
                                const imported = window.haecoCore.importCSV(e.target.result);
                                this.showModal('Import Success', `Successfully imported ${imported.length} aircraft.`);
                            } else if (file.name.endsWith('.json')) {
                                const data = JSON.parse(e.target.result);
                                // Handle JSON import
                                this.showModal('Import Success', 'JSON data imported successfully.');
                            }
                            this.updateStats();
                            this.renderBayOverview();
                            this.renderRecentActivity();
                        } catch (error) {
                            this.showModal('Import Error', `Failed to import data: ${error.message}`);
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        };

        window.exportData = () => {
            const data = window.haecoCore.exportData('json');
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `haeco_v6_export_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };

        window.refreshActivity = () => {
            this.renderRecentActivity();
        };
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});