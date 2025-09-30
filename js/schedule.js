// Schedule Management for HAECO V6
class ScheduleManager {
    constructor() {
        this.currentWeek = new Date();
        this.selectedAircraft = null;
        this.init();
    }

    init() {
        this.renderAircraftTable();
        this.renderTimeline();
        this.setupEventListeners();
        this.updateCurrentDate();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.renderAircraftTable();
            this.renderTimeline();
        }, 30000);
    }

    renderAircraftTable() {
        const tbody = document.getElementById('aircraftTableBody');
        if (!tbody) return;

        const aircraft = window.haecoCore.aircraft;
        const filter = document.getElementById('filterStatus')?.value || 'all';
        
        const filteredAircraft = filter === 'all' ? aircraft : 
            aircraft.filter(a => a.status === filter);

        tbody.innerHTML = '';

        if (filteredAircraft.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-gray-4">
                        No aircraft found. <a href="#" onclick="showAddAircraftModal()">Add aircraft</a> to get started.
                    </td>
                </tr>
            `;
            return;
        }

        filteredAircraft.forEach(aircraft => {
            const row = document.createElement('tr');
            const bayInfo = aircraft.currentBay ? 
                `<span class="status status-active">${aircraft.currentBay}</span>` : 
                '<span class="status status-pending">Unassigned</span>';
            
            const statusClass = {
                'scheduled': 'status-pending',
                'assigned': 'status-active',
                'completed': 'status-inactive'
            }[aircraft.status] || 'status-pending';

            row.innerHTML = `
                <td><strong>${aircraft.registration}</strong></td>
                <td>${aircraft.type}</td>
                <td>${aircraft.workType}</td>
                <td>${bayInfo}</td>
                <td><span class="status ${statusClass}">${aircraft.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="editAircraft('${aircraft.id}')">Edit</button>
                    <button class="btn btn-success" onclick="autoAssignAircraft('${aircraft.id}')">Auto Assign</button>
                    ${aircraft.currentBay ? 
                        `<button class="btn btn-warning" onclick="releaseAircraft('${aircraft.id}')">Release</button>` : 
                        ''
                    }
                    <button class="btn btn-secondary" onclick="deleteAircraft('${aircraft.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderTimeline() {
        const container = document.getElementById('timelineView');
        if (!container) return;

        const startDate = new Date(this.currentWeek);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        container.innerHTML = `
            <div class="enhanced-timeline">
                <div class="timeline-header-enhanced">
                    <div class="aircraft-column">Aircraft</div>
                    ${Array.from({length: 7}, (_, i) => {
                        const date = new Date(startDate);
                        date.setDate(date.getDate() + i);
                        const isToday = date.toDateString() === new Date().toDateString();
                        return `<div class="date-column ${isToday ? 'today' : ''}">
                            <div class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div class="day-date">${date.getDate()}</div>
                        </div>`;
                    }).join('')}
                </div>
                <div class="timeline-body">
                    ${this.renderTimelineRows(startDate)}
                </div>
            </div>
        `;
    }

    renderTimelineRows(startDate) {
        const aircraft = window.haecoCore.aircraft.filter(a => {
            const arrival = new Date(a.arrivalTime);
            const departure = new Date(a.departureTime);
            const weekEnd = new Date(startDate);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            return (arrival >= startDate && arrival < weekEnd) || 
                   (departure >= startDate && departure < weekEnd) ||
                   (arrival < startDate && departure > weekEnd);
        });

        if (aircraft.length === 0) {
            return '<div class="no-aircraft">No aircraft scheduled for this week</div>';
        }

        return aircraft.map(ac => {
            const priorityClass = {
                'urgent': 'priority-urgent',
                'high': 'priority-high', 
                'normal': 'priority-normal',
                'low': 'priority-low'
            }[ac.priority] || 'priority-normal';

            const cells = Array.from({length: 7}, (_, i) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                
                const arrival = new Date(ac.arrivalTime);
                const departure = new Date(ac.departureTime);
                
                const isActive = date >= new Date(arrival.toDateString()) && date <= new Date(departure.toDateString());
                const isArrival = date.toDateString() === arrival.toDateString();
                const isDeparture = date.toDateString() === departure.toDateString();
                
                let cellContent = '';
                let cellClass = 'timeline-cell-enhanced';
                
                if (isActive) {
                    cellClass += ` active ${priorityClass}`;
                    if (isArrival && isDeparture) {
                        cellContent = `<div class="cell-content"><span class="bay-info">${ac.currentBay || 'TBD'}</span><div class="day-type">A→D</div></div>`;
                    } else if (isArrival) {
                        cellContent = `<div class="cell-content"><span class="bay-info">${ac.currentBay || 'TBD'}</span><div class="day-type">ARR</div></div>`;
                    } else if (isDeparture) {
                        cellContent = `<div class="cell-content"><span class="bay-info">${ac.currentBay || 'TBD'}</span><div class="day-type">DEP</div></div>`;
                    } else {
                        cellContent = `<div class="cell-content"><span class="bay-info">${ac.currentBay || 'TBD'}</span></div>`;
                    }
                }
                
                return `<div class="${cellClass}">${cellContent}</div>`;
            }).join('');

            return `
                <div class="timeline-row-enhanced">
                    <div class="aircraft-info-enhanced">
                        <div class="aircraft-reg">${ac.registration}</div>
                        <div class="aircraft-details">${ac.type} • ${ac.workType}</div>
                        <div class="priority-badge ${priorityClass}">${ac.priority}</div>
                    </div>
                    ${cells}
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Global functions for buttons
        window.showAddAircraftModal = () => this.showAddAircraftModal();
        window.editAircraft = (id) => this.editAircraft(id);
        window.deleteAircraft = (id) => this.deleteAircraft(id);
        window.autoAssignAircraft = (id) => this.autoAssignAircraft(id);
        window.releaseAircraft = (id) => this.releaseAircraft(id);
        window.filterAircraft = () => this.renderAircraftTable();
        window.runOptimizer = () => this.runOptimizer();
        window.importSchedule = () => this.importSchedule();
        window.downloadCSVTemplate = () => this.downloadCSVTemplate();
        window.previousWeek = () => this.previousWeek();
        window.nextWeek = () => this.nextWeek();
        
        // Add timeline styles
        this.addTimelineStyles();
    }

    showAddAircraftModal() {
        const modal = this.createModal('Add Aircraft', `
            <form id="addAircraftForm">
                <div class="form-group">
                    <label class="form-label">Registration *</label>
                    <input type="text" class="form-input" name="registration" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Aircraft Type *</label>
                    <select class="form-select" name="type" required>
                        <option value="">Select Type</option>
                        <option value="A320">Airbus A320</option>
                        <option value="A330">Airbus A330</option>
                        <option value="A350">Airbus A350</option>
                        <option value="B737">Boeing 737</option>
                        <option value="B777">Boeing 777</option>
                        <option value="B787">Boeing 787</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Size</label>
                    <select class="form-select" name="size">
                        <option value="large">Large</option>
                        <option value="small">Small</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Work Type *</label>
                    <select class="form-select" name="workType" required>
                        <option value="">Select Work Type</option>
                        <option value="paint">Paint</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inspection">Inspection</option>
                        <option value="storage">Storage</option>
                        <option value="special">Special</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select" name="priority">
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Arrival Time *</label>
                    <input type="datetime-local" class="form-input" name="arrivalTime" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Departure Time *</label>
                    <input type="datetime-local" class="form-input" name="departureTime" required>
                </div>
                <div class="flex gap-2 mt-2">
                    <button type="submit" class="btn btn-primary">Add Aircraft</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                </div>
            </form>
        `);

        const form = modal.querySelector('#addAircraftForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const aircraftData = Object.fromEntries(formData);
            
            try {
                window.haecoCore.addAircraft(aircraftData);
                this.renderAircraftTable();
                this.renderTimeline();
                modal.remove();
                this.showNotification('Aircraft added successfully', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        };
    }

    editAircraft(id) {
        const aircraft = window.haecoCore.aircraft.find(a => a.id === id);
        if (!aircraft) return;

        const modal = this.createModal('Edit Aircraft', `
            <form id="editAircraftForm">
                <div class="form-group">
                    <label class="form-label">Registration *</label>
                    <input type="text" class="form-input" name="registration" value="${aircraft.registration}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Aircraft Type *</label>
                    <select class="form-select" name="type" required>
                        <option value="A320" ${aircraft.type === 'A320' ? 'selected' : ''}>Airbus A320</option>
                        <option value="A330" ${aircraft.type === 'A330' ? 'selected' : ''}>Airbus A330</option>
                        <option value="A350" ${aircraft.type === 'A350' ? 'selected' : ''}>Airbus A350</option>
                        <option value="B737" ${aircraft.type === 'B737' ? 'selected' : ''}>Boeing 737</option>
                        <option value="B777" ${aircraft.type === 'B777' ? 'selected' : ''}>Boeing 777</option>
                        <option value="B787" ${aircraft.type === 'B787' ? 'selected' : ''}>Boeing 787</option>
                        <option value="Other" ${aircraft.type === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Work Type *</label>
                    <select class="form-select" name="workType" required>
                        <option value="paint" ${aircraft.workType === 'paint' ? 'selected' : ''}>Paint</option>
                        <option value="maintenance" ${aircraft.workType === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="inspection" ${aircraft.workType === 'inspection' ? 'selected' : ''}>Inspection</option>
                        <option value="storage" ${aircraft.workType === 'storage' ? 'selected' : ''}>Storage</option>
                        <option value="special" ${aircraft.workType === 'special' ? 'selected' : ''}>Special</option>
                    </select>
                </div>
                <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-select" name="priority">
                <option value="normal" ${aircraft.priority === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="high" ${aircraft.priority === 'high' ? 'selected' : ''}>High</option>
                <option value="urgent" ${aircraft.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                <option value="low" ${aircraft.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
                </div>

                <div class="time-edit-section mt-3">
                    <h4>Schedule</h4>
                    <div class="form-group">
                        <label>Arrival Time:</label>
                        <input type="datetime-local" id="editArrival" value="${new Date(aircraft.arrivalTime).toISOString().slice(0, 16)}">
                    </div>
                    <div class="form-group">
                        <label>Departure Time:</label>
                        <input type="datetime-local" id="editDeparture" value="${new Date(aircraft.departureTime).toISOString().slice(0, 16)}">
                    </div>
                </div>

                <div class="flex gap-2 mt-2">
                    <button type="submit" class="btn btn-primary">Update Aircraft</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                </div>
            </form>
        `);

        const form = modal.querySelector('#editAircraftForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const updates = Object.fromEntries(formData);
            
            try {
                window.haecoCore.updateAircraft(id, updates);
                this.renderAircraftTable();
                modal.remove();
                this.showNotification('Aircraft updated successfully', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        };
    }

    deleteAircraft(id) {
        const aircraft = window.haecoCore.aircraft.find(a => a.id === id);
        if (!aircraft) return;

        if (confirm(`Are you sure you want to delete aircraft ${aircraft.registration}?`)) {
            try {
                window.haecoCore.removeAircraft(id);
                this.renderAircraftTable();
                this.renderTimeline();
                this.showNotification('Aircraft deleted successfully', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    autoAssignAircraft(id) {
        const aircraft = window.haecoCore.aircraft.find(a => a.id === id);
        if (!aircraft) return;

        try {
            const recommendations = window.aiEngine.optimizeBayAssignments([aircraft]);
            
            if (recommendations.length === 0) {
                this.showNotification('No suitable bay found for this aircraft', 'warning');
                return;
            }

            const best = recommendations[0];
            window.haecoCore.assignBay(aircraft.id, best.bayId);
            
            this.renderAircraftTable();
            this.showNotification(`${aircraft.registration} assigned to Bay ${best.bayId}`, 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    releaseAircraft(id) {
        const aircraft = window.haecoCore.aircraft.find(a => a.id === id);
        if (!aircraft || !aircraft.currentBay) return;

        if (confirm(`Release ${aircraft.registration} from Bay ${aircraft.currentBay}?`)) {
            try {
                window.haecoCore.vacateBay(aircraft.currentBay);
                this.renderAircraftTable();
                this.showNotification(`${aircraft.registration} released from Bay ${aircraft.currentBay}`, 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    runOptimizer() {
        const container = document.getElementById('optimizerResults');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        setTimeout(() => {
            try {
                const unassigned = window.haecoCore.aircraft.filter(a => !a.currentBay);
                
                if (unassigned.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-4">All aircraft are already assigned to bays.</p>';
                    return;
                }

                const recommendations = window.aiEngine.optimizeBayAssignments(unassigned);
                
                if (recommendations.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-4">No optimal assignments found at this time.</p>';
                    return;
                }

                let html = '<div class="optimizer-results">';
                recommendations.forEach(rec => {
                    html += `
                        <div class="recommendation-card" style="
                            border: 1px solid var(--gray-2);
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 10px;
                            background: var(--white);
                        ">
                            <div class="flex justify-between align-center">
                                <div>
                                    <strong>${rec.aircraftReg} → Bay ${rec.bayId}</strong>
                                    <div class="text-gray-4">Confidence: ${rec.confidence.toFixed(0)}%</div>
                                    <div class="text-gray-4">${rec.reasoning.join(', ')}</div>
                                </div>
                                <div class="flex gap-1">
                                    <button class="btn btn-success" onclick="applyRecommendation('${rec.aircraftId}', '${rec.bayId}')">Apply</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                
                html += `
                    <div class="mt-2">
                        <button class="btn btn-primary" onclick="applyAllRecommendations()">Apply All Recommendations</button>
                    </div>
                `;

                container.innerHTML = html;

                // Store recommendations for later use
                this.currentRecommendations = recommendations;

            } catch (error) {
                container.innerHTML = `<p class="text-center text-error">Error: ${error.message}</p>`;
            }
        }, 1000);
    }

    downloadCSVTemplate() {
        const csvContent = `registration,type,size,workType,priority,arrivalTime,departureTime,needsMTE
B-HUA,A330,large,maintenance,normal,2024-01-15T08:00:00,2024-01-17T16:00:00,false
B-HUB,A320,large,paint,high,2024-01-15T10:00:00,2024-01-20T14:00:00,false
B-HUC,B737,large,maintenance,normal,2024-01-15T14:00:00,2024-01-16T18:00:00,true`;
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'haeco_aircraft_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    importSchedule() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const imported = window.haecoCore.importCSV(e.target.result);
                        this.renderAircraftTable();
                        this.renderTimeline();
                        this.showNotification(`Successfully imported ${imported.length} aircraft`, 'success');
                    } catch (error) {
                        this.showNotification(`Import failed: ${error.message}`, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    previousWeek() {
        this.currentWeek.setDate(this.currentWeek.getDate() - 7);
        this.renderTimeline();
        this.updateCurrentDate();
    }

    nextWeek() {
        this.currentWeek.setDate(this.currentWeek.getDate() + 7);
        this.renderTimeline();
        this.updateCurrentDate();
    }

    updateCurrentDate() {
        const element = document.getElementById('currentDate');
        if (element) {
            element.textContent = this.currentWeek.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
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

    addTimelineStyles() {
        if (document.getElementById('timeline-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'timeline-styles';
        style.textContent = `
            .enhanced-timeline {
                background: var(--white);
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: var(--shadow);
            }
            
            .timeline-header-enhanced {
                display: grid;
                grid-template-columns: 200px repeat(7, 1fr);
                background: var(--gray-1);
                border-bottom: 2px solid var(--gray-2);
            }
            
            .aircraft-column {
                padding: 15px;
                font-weight: 700;
                color: var(--gray-6);
                border-right: 1px solid var(--gray-2);
            }
            
            .date-column {
                padding: 10px;
                text-align: center;
                border-right: 1px solid var(--gray-2);
            }
            
            .date-column.today {
                background: var(--primary-blue);
                color: var(--white);
            }
            
            .day-name {
                font-weight: 600;
                font-size: 12px;
                margin-bottom: 2px;
            }
            
            .day-date {
                font-size: 18px;
                font-weight: 700;
            }
            
            .timeline-row-enhanced {
                display: grid;
                grid-template-columns: 200px repeat(7, 1fr);
                border-bottom: 1px solid var(--gray-2);
                min-height: 60px;
            }
            
            .timeline-row-enhanced:hover {
                background: var(--gray-1);
            }
            
            .aircraft-info-enhanced {
                padding: 10px 15px;
                border-right: 1px solid var(--gray-2);
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .aircraft-reg {
                font-weight: 700;
                font-size: 16px;
                color: var(--gray-6);
            }
            
            .aircraft-details {
                font-size: 12px;
                color: var(--gray-4);
                margin: 2px 0;
            }
            
            .priority-badge {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: 600;
                text-transform: uppercase;
                width: fit-content;
            }
            
            .priority-urgent {
                background: var(--error-red);
                color: var(--white);
            }
            
            .priority-high {
                background: var(--warning-orange);
                color: var(--white);
            }
            
            .priority-normal {
                background: var(--gray-3);
                color: var(--gray-6);
            }
            
            .priority-low {
                background: var(--gray-2);
                color: var(--gray-4);
            }
            
            .timeline-cell-enhanced {
                border-right: 1px solid var(--gray-2);
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 60px;
                position: relative;
            }
            
            .timeline-cell-enhanced.active {
                background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
                color: var(--white);
            }
            
            .timeline-cell-enhanced.active.priority-urgent {
                background: linear-gradient(135deg, var(--error-red), #FF6B6B);
            }
            
            .timeline-cell-enhanced.active.priority-high {
                background: linear-gradient(135deg, var(--warning-orange), #FFB347);
            }
            
            .cell-content {
                text-align: center;
                font-size: 12px;
            }
            
            .bay-info {
                font-weight: 700;
                font-size: 14px;
                display: block;
            }
            
            .day-type {
                font-size: 10px;
                opacity: 0.8;
                margin-top: 2px;
                font-weight: 600;
            }
            
            .no-aircraft {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: var(--gray-4);
                font-style: italic;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Global functions for optimizer
window.applyRecommendation = (aircraftId, bayId) => {
    try {
        window.haecoCore.assignBay(aircraftId, bayId);
        window.scheduleManager.renderAircraftTable();
        window.scheduleManager.showNotification('Assignment applied successfully', 'success');
        window.scheduleManager.runOptimizer(); // Refresh recommendations
    } catch (error) {
        window.scheduleManager.showNotification(error.message, 'error');
    }
};

window.applyAllRecommendations = () => {
    if (!window.scheduleManager.currentRecommendations) return;
    
    let applied = 0;
    let errors = 0;
    
    window.scheduleManager.currentRecommendations.forEach(rec => {
        try {
            window.haecoCore.assignBay(rec.aircraftId, rec.bayId);
            applied++;
        } catch (error) {
            errors++;
        }
    });
    
    window.scheduleManager.renderAircraftTable();
    window.scheduleManager.showNotification(
        `Applied ${applied} assignments${errors > 0 ? `, ${errors} failed` : ''}`, 
        errors > 0 ? 'warning' : 'success'
    );
    window.scheduleManager.runOptimizer(); // Refresh recommendations
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleManager = new ScheduleManager();
});