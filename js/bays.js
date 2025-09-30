// Bay Management for HAECO V6
class BayManager {
    constructor() {
        this.selectedBay = null;
        this.currentDate = new Date();
        this.init();
    }

    init() {
        this.renderBayLayout();
        this.updateCurrentDate();
        this.setupEventListeners();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.renderBayLayout();
        }, 30000);
    }

    renderBayLayout() {
        const container = document.getElementById('bayLayout');
        if (!container) return;

        container.innerHTML = '';
        container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: repeat(5, 80px);
            gap: 10px;
            padding: 20px;
            background: var(--gray-1);
            border-radius: var(--border-radius);
        `;

        const bays = window.haecoCore.bays;
        const bayLayout = {
            // Top line: Hangars 1,2,3 + P outside
            '1': {row: 1, col: 1}, '2': {row: 1, col: 2}, '3': {row: 1, col: 3},
            '4': {row: 1, col: 5}, '5': {row: 1, col: 6}, '6': {row: 1, col: 7},
            '7': {row: 1, col: 9}, '8': {row: 1, col: 10}, 'P': {row: 1, col: 12},
            // Middle line
            'A': {row: 3, col: 1}, 'B': {row: 3, col: 2}, 'F': {row: 3, col: 6},
            'J': {row: 3, col: 9}, 'Q': {row: 3, col: 12},
            // Bottom flexible line
            'C': {row: 5, col: 1}, 'D': {row: 5, col: 2}, 'E': {row: 5, col: 3},
            'G': {row: 5, col: 5}, 'H': {row: 5, col: 6}, 'K': {row: 5, col: 7},
            'L': {row: 5, col: 8}, 'N': {row: 5, col: 9}, 'R': {row: 5, col: 12}
        };
        
        Object.entries(bayLayout).forEach(([bayId, position]) => {
            const bay = bays[bayId];
            if (!bay) return;

            const bayElement = document.createElement('div');

            const date = new Date(this.currentDate);
            date.setHours(0, 0, 0, 0);
            const aircraftInBay = window.haecoCore.getAircraftForBayAndDate(bayId, date)
                    .find(aircraft => {
                        const arrival = new Date(aircraft.arrivalTime);
                        const departure = new Date(aircraft.departureTime);
                        return date >= arrival && date <= departure;
                    });

            bayElement.className = `bay-slot ${bay.type} ${bay.occupied && aircraftInBay? 'occupied' : ''}`;
            bayElement.style.gridRow = position.row;
            bayElement.style.gridColumn = position.col;
            bayElement.onclick = () => this.selectBay(bayId);
            
            let aircraftInfo = '';
            if (bay.occupied && bay.aircraft && aircraftInBay) {
                const aircraft = window.haecoCore.aircraft.find(a => a.id === bay.aircraft);
                aircraftInfo = aircraft ? `<div class="bay-aircraft">${aircraft.registration}</div>` : '';
            }

            bayElement.innerHTML = `
                <div class="bay-number">${bayId}</div>
                <div class="bay-type">${bay.category}</div>
                ${aircraftInfo}
            `;
            
            container.appendChild(bayElement);

            const layoutDescription = document.getElementById('layout-description');
            layoutDescription.innerHTML = "Display time: " + date.toString();
        });
        
        // Add hangar labels
        const labels = [
            {text: 'Hangar 1', row: 2, col: '1 / 4'},
            {text: 'Hangar 2', row: 2, col: '5 / 8'},
            {text: 'Hangar 3', row: 2, col: '9 / 11'},
            {text: 'Outside', row: 4, col: '1 / 13'}
        ];
        
        labels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.style.cssText = `
                grid-row: ${label.row};
                grid-column: ${label.col};
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                color: var(--gray-4);
                font-size: 12px;
                border: 1px dashed var(--gray-3);
                border-radius: 4px;
                background: var(--white);
            `;
            labelElement.textContent = label.text;
            container.appendChild(labelElement);
        });
    }

    selectBay(bayId) {
        this.selectedBay = bayId;
        this.showBayDetails(bayId);
        this.showDependencies(bayId);
        
        // Highlight selected bay
        document.querySelectorAll('.bay-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        event.target.closest('.bay-slot').classList.add('selected');
    }

    showBayDetails(bayId) {
        const container = document.getElementById('bayDetails');
        if (!container) return;

        const bay = window.haecoCore.bays[bayId];
        let html = `
            <div class="bay-info">
                <h4>Bay ${bayId} - ${bay.category}</h4>
                <div class="bay-properties">
                    <div class="property">
                        <strong>Type:</strong> ${bay.type}
                    </div>
                    <div class="property">
                        <strong>Status:</strong> 
                        <span class="status ${bay.occupied ? 'status-active' : 'status-inactive'}">
                            ${bay.occupied ? 'Occupied' : 'Available'}
                        </span>
                    </div>
                    <div class="property">
                        <strong>Capabilities:</strong> ${bay.capabilities ? bay.capabilities.join(', ') : 'Standard'}
                    </div>
        `;

        const date = new Date(this.currentDate);
        date.setHours(0, 0, 0, 0);
        const aircraftInBay = window.haecoCore.getAircraftForBayAndDate(bayId, date)
            .find(aircraft => {
                const arrival = new Date(aircraft.arrivalTime);
                const departure = new Date(aircraft.departureTime);
                return date >= arrival && date <= departure;
            });

        if (bay.occupied && bay.aircraft && aircraftInBay) {
            const aircraft = window.haecoCore.aircraft.find(a => a.id === bay.aircraft);
            if (aircraft) {
                html += `
                    <div class="aircraft-info mt-2">
                        <h5>Current Aircraft</h5>
                        <div class="property"><strong>Registration:</strong> ${aircraft.registration}</div>
                        <div class="property"><strong>Type:</strong> ${aircraft.type}</div>
                        <div class="property"><strong>Work:</strong> ${aircraft.workType}</div>
                        <div class="property"><strong>Priority:</strong> ${aircraft.priority}</div>
                        <div class="property"><strong>Arrival:</strong> ${new Date(aircraftInBay.arrivalTime).toLocaleString()}</div>
                        <div class="property"><strong>Departure:</strong> ${new Date(aircraftInBay.departureTime).toLocaleString()}</div>
                        <button class="btn btn-secondary" onclick="showAircraftTimeline('${aircraft.id}')">View Timeline</button>
                    </div>
                    <div class="bay-actions mt-2">
                        <button class="btn btn-warning" onclick="releaseFromBay('${bayId}')">Release Aircraft</button>
                    </div>
                `;
            }
        } else {
            html += `
                <div class="bay-actions mt-2">
                    <button class="btn btn-primary" onclick="showAssignToBay('${bayId}')">Assign Aircraft</button>
                </div>
            `;
        }

        // Bay Timeline
        html += `
            <div class="bay-timeline mt-2">
                <h5>Bay Timeline (Next 7 Days)</h5>
                <div id="bayTimeline-${bayId}" class="mini-timeline"></div>
            </div>
        `;

        html += '</div></div>';
        container.innerHTML = html;
        
        this.renderBayTimeline(bayId);
        this.visualizeDependencies(bayId);
    }

    showDependencies(bayId) {
        const container = document.getElementById('dependencyInfo');
        if (!container) return;

        const dependencies = window.haecoCore.calculateDependencies('temp', bayId);
        
        let html = `
            <div class="dependency-info">
                <h4>Movement Dependencies for Bay ${bayId}</h4>
        `;

        if (dependencies.length === 0) {
            html += '<p class="text-gray-4">No movement dependencies detected.</p>';
        } else {
            html += '<div class="dependency-list">';
            dependencies.forEach(depBay => {
                const bay = window.haecoCore.bays[depBay];
                const aircraft = bay.aircraft ? window.haecoCore.aircraft.find(a => a.id === bay.aircraft) : null;
                
                html += `
                    <div class="dependency-item">
                        <strong>Bay ${depBay}</strong> - ${aircraft ? aircraft.registration : 'Unknown'}
                        <div class="text-gray-4">Must be cleared for movement</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        const cost = window.haecoCore.calculateTowingCost('temp', bayId);
        html += `
            <div class="cost-info mt-2">
                <strong>Estimated Towing Cost:</strong> $${cost}
            </div>
        `;

        html += '</div>';
        container.innerHTML = html;
    }

    showAssignToBay(bayId) {
        const unassigned = window.haecoCore.aircraft.filter(a => !a.currentBay);
        
        if (unassigned.length === 0) {
            this.showNotification('No unassigned aircraft available', 'warning');
            return;
        }

        let options = '';
        unassigned.forEach(aircraft => {
            options += `<option value="${aircraft.id}">${aircraft.registration} - ${aircraft.type} (${aircraft.workType})</option>`;
        });

        const modal = this.createModal('Assign Aircraft to Bay ' + bayId, `
            <form id="assignForm">
                <div class="form-group">
                    <label class="form-label">Select Aircraft</label>
                    <select class="form-select" name="aircraftId" required>
                        <option value="">Choose aircraft...</option>
                        ${options}
                    </select>
                </div>
                <div class="flex gap-2 mt-2">
                    <button type="submit" class="btn btn-primary">Assign</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                </div>
            </form>
        `);

        const form = modal.querySelector('#assignForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const aircraftId = formData.get('aircraftId');
            
            try {
                window.haecoCore.assignBay(aircraftId, bayId);
                this.renderBayLayout();
                this.showBayDetails(bayId);
                modal.remove();
                this.showNotification('Aircraft assigned successfully', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        };
    }

    renderUtilizationTimeline() {
        const container = document.getElementById('utilizationTimeline');
        if (!container) return;

        const date = new Date(this.currentDate);
        date.setHours(0, 0, 0, 0);

        container.innerHTML = '';
        container.style.cssText = `
            display: grid;
            grid-template-columns: 80px repeat(24, 1fr);
            gap: 1px;
            background: var(--gray-2);
            border-radius: var(--border-radius);
            overflow: hidden;
        `;

        // Header row
        const header = document.createElement('div');
        header.style.cssText = 'display: contents; font-weight: 600;';
        header.innerHTML = '<div style="padding: 10px; background: var(--gray-3);">Bay</div>';
        
        for (let hour = 0; hour < 24; hour++) {
            header.innerHTML += `<div style="padding: 5px; background: var(--gray-3); text-align: center; font-size: 12px;">${hour.toString().padStart(2, '0')}</div>`;
        }
        container.appendChild(header);

        // Bay rows
        const bayOrder = ['1', '2', '3', '4', '5', '6', '7', '8', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'N', 'P', 'Q', 'R'];
        const aircraftColors = this.getAircraftColors();
        
        bayOrder.forEach(bayId => {
            const row = document.createElement('div');
            row.style.cssText = 'display: contents;';
            
            row.innerHTML = `<div style="padding: 10px; background: var(--white); font-weight: 600;">${bayId}</div>`;
            
            for (let hour = 0; hour < 24; hour++) {
                const cellDate = new Date(date);
                cellDate.setHours(hour);
                
                // Find aircraft in this bay during this hour
                const aircraftInBay = window.haecoCore.getAircraftForBayAndDate(bayId, cellDate)
                    .find(aircraft => {
                        const arrival = new Date(aircraft.arrivalTime);
                        const departure = new Date(aircraft.departureTime);
                        return cellDate >= arrival && cellDate <= departure;
                    });
                
                let cellStyle = 'padding: 5px; background: var(--white); border-right: 1px solid var(--gray-2); cursor: pointer; position: relative; min-height: 30px; display: flex; align-items: center; justify-content: center; font-size: 10px;';
                let cellContent = '';
                
                if (aircraftInBay) {
                    const color = aircraftColors[aircraftInBay.registration] || '#007AFF';
                    cellStyle = `padding: 5px; background: ${color}; color: white; border-right: 1px solid var(--gray-2); cursor: pointer; position: relative; min-height: 30px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600;`;
                    cellContent = aircraftInBay.registration.substring(0, 4);
                }
                
                const cellElement = document.createElement('div');
                cellElement.style.cssText = cellStyle;
                cellElement.innerHTML = cellContent;
                
                if (aircraftInBay) {
                    cellElement.onclick = () => this.showAircraftTimelineDetail(aircraftInBay, bayId, cellDate);
                    cellElement.title = `${aircraftInBay.registration} - ${aircraftInBay.type} (${aircraftInBay.workType})`;
                }
                
                row.appendChild(cellElement);
            }
            
            container.appendChild(row);
        });
    }

    setupEventListeners() {
        window.filterBays = () => this.filterBays();
        window.showDependencyView = () => this.showDependencyView();
        window.calculateAllDependencies = () => this.calculateAllDependencies();
        window.previousDay = () => this.previousDay();
        window.nextDay = () => this.nextDay();
        window.releaseFromBay = (bayId) => this.releaseFromBay(bayId);
        window.showAssignToBay = (bayId) => this.showAssignToBay(bayId);
        window.showAircraftTimeline = (aircraftId) => this.showAircraftTimeline(aircraftId);
        window.bayManager = this;
    }

    filterBays() {
        const filter = document.getElementById('bayFilter').value;
        const baySlots = document.querySelectorAll('.bay-slot');
        
        baySlots.forEach(slot => {
            const bay = slot.querySelector('.bay-number').textContent;
            const bayData = window.haecoCore.bays[bay];
            
            let show = true;
            
            switch (filter) {
                case 'available':
                    show = !bayData.occupied;
                    break;
                case 'occupied':
                    show = bayData.occupied;
                    break;
                case 'paint':
                case 'mte':
                case 'outer':
                case 'special':
                    show = bayData.type === filter;
                    break;
            }
            
            slot.style.display = show ? 'flex' : 'none';
        });
    }

    showDependencyView() {
        const modal = this.createModal('Bay Dependencies Overview', `
            <div id="dependencyOverview">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        `);

        setTimeout(() => {
            let html = '<div class="dependency-overview">';
            
            Object.keys(window.haecoCore.bays).forEach(bayId => {
                const dependencies = window.haecoCore.calculateDependencies('temp', bayId);
                const cost = window.haecoCore.calculateTowingCost('temp', bayId);
                
                html += `
                    <div class="dependency-card" style="
                        border: 1px solid var(--gray-2);
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 10px;
                        background: var(--white);
                    ">
                        <div class="flex justify-between">
                            <div>
                                <strong>Bay ${bayId}</strong>
                                <div class="text-gray-4">Dependencies: ${dependencies.length}</div>
                                <div class="text-gray-4">Towing Cost: $${cost}</div>
                            </div>
                            <div class="text-right">
                                ${dependencies.length > 0 ? 
                                    `<span class="status status-pending">${dependencies.length} deps</span>` : 
                                    '<span class="status status-active">Clear</span>'
                                }
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            modal.querySelector('#dependencyOverview').innerHTML = html;
        }, 500);
    }

    calculateAllDependencies() {
        const container = document.getElementById('dependencyInfo');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        setTimeout(() => {
            let html = '<div class="all-dependencies"><h4>All Bay Dependencies</h4>';
            
            Object.keys(window.haecoCore.bays).forEach(bayId => {
                const dependencies = window.haecoCore.calculateDependencies('temp', bayId);
                if (dependencies.length > 0) {
                    html += `
                        <div class="dependency-group">
                            <strong>Bay ${bayId}:</strong> ${dependencies.join(', ')}
                        </div>
                    `;
                }
            });
            
            html += '</div>';
            container.innerHTML = html;
        }, 1000);
    }

    releaseFromBay(bayId) {
        const bay = window.haecoCore.bays[bayId];
        if (!bay.occupied) return;

        const aircraft = window.haecoCore.aircraft.find(a => a.id === bay.aircraft);
        const aircraftName = aircraft ? aircraft.registration : 'Unknown';

        if (confirm(`Release ${aircraftName} from Bay ${bayId}?`)) {
            try {
                window.haecoCore.vacateBay(bayId);
                this.renderBayLayout();
                this.showBayDetails(bayId);
                this.showNotification(`${aircraftName} released from Bay ${bayId}`, 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    previousDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        this.updateCurrentDate();
        this.renderBayLayout();
        this.renderUtilizationTimeline();
    }

    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        this.updateCurrentDate();
        this.renderBayLayout()
        this.renderUtilizationTimeline();
    }

    updateCurrentDate() {
        const element = document.getElementById('currentDate');
        if (element) {
            element.textContent = this.currentDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        this.renderUtilizationTimeline();
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
                max-width: 600px;
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

    renderBayTimeline(bayId) {
        const container = document.getElementById(`bayTimeline-${bayId}`);
        if (!container) return;

        const aircraft = window.haecoCore.aircraft.filter(a => {
            const arrival = new Date(a.arrivalTime);
            const departure = new Date(a.departureTime);
            const now = new Date();
            const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return (arrival <= weekLater && departure >= now);
        });

        let html = '<div class="timeline-mini">';
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayAircraft = aircraft.filter(a => {
                const arrival = new Date(a.arrivalTime);
                const departure = new Date(a.departureTime);
                return date >= arrival && date <= departure && a.currentBay === bayId;
            });
            
            html += `<div class="timeline-day ${dayAircraft.length ? 'occupied' : 'free'}">
                ${date.getDate()}
                ${dayAircraft.length ? `<br><small>${dayAircraft[0].registration}</small>` : ''}
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    visualizeDependencies(bayId) {
        // Clear previous highlights
        document.querySelectorAll('.bay-slot').forEach(slot => {
            slot.classList.remove('dependency-highlight', 'selected-bay');
        });

        // Highlight selected bay
        const selectedBay = document.querySelector(`[onclick*="selectBay('${bayId}')"]`);
        if (selectedBay) selectedBay.classList.add('selected-bay');

        // Get and highlight dependencies
        const dependencies = window.haecoCore.calculateDependencies('temp', bayId);
        dependencies.forEach(depBayId => {
            const depBay = document.querySelector(`[onclick*="selectBay('${depBayId}')"]`);
            if (depBay) depBay.classList.add('dependency-highlight');
        });
    }

    showAircraftTimeline(aircraftId) {
        const aircraft = window.haecoCore.aircraft.find(a => a.id === aircraftId);
        if (!aircraft) return;

        const modal = this.createModal(`Aircraft Timeline - ${aircraft.registration}`, `
            <div class="aircraft-timeline">
                <div class="timeline-info">
                    <p><strong>Type:</strong> ${aircraft.type}</p>
                    <p><strong>Work:</strong> ${aircraft.workType}</p>
                    <p><strong>Priority:</strong> ${aircraft.priority}</p>
                    <p><strong>Current Bay:</strong> ${aircraft.currentBay || 'Unassigned'}</p>
                </div>
                <div class="timeline-chart" id="aircraftTimelineChart"></div>
            </div>
        `);

        // Render aircraft timeline chart
        setTimeout(() => {
            const chartContainer = document.getElementById('aircraftTimelineChart');
            if (chartContainer) {
                const arrival = new Date(aircraft.arrivalTime);
                const departure = new Date(aircraft.departureTime);
                const duration = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
                
                chartContainer.innerHTML = `
                    <div class="timeline-bar">
                        <div class="timeline-segment arrival">Arrival: ${arrival.toLocaleDateString()}</div>
                        <div class="timeline-segment duration">${duration} days in system</div>
                        <div class="timeline-segment departure">Departure: ${departure.toLocaleDateString()}</div>
                    </div>
                `;
            }
        }, 100);
    }

    getAircraftColors() {
        const colors = [
            '#007AFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', 
            '#5AC8FA', '#AF52DE', '#FF2D92', '#A2845E', '#8E8E93',
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        
        const aircraftColors = {};
        const aircraft = window.haecoCore.aircraft;
        
        aircraft.forEach((plane, index) => {
            aircraftColors[plane.registration] = colors[index % colors.length];
        });
        
        return aircraftColors;
    }

    showAircraftTimelineDetail(aircraft, bayId, selectedTime) {
        const modal = this.createModal(`Aircraft Details - ${aircraft.registration}`, `
            <div class="aircraft-detail">
                <div class="aircraft-info-grid">
                    <div class="info-item"><strong>Registration:</strong> ${aircraft.registration}</div>
                    <div class="info-item"><strong>Type:</strong> ${aircraft.type}</div>
                    <div class="info-item"><strong>Size:</strong> ${aircraft.size}</div>
                    <div class="info-item"><strong>Work Type:</strong> ${aircraft.workType}</div>
                    <div class="info-item"><strong>Priority:</strong> ${aircraft.priority}</div>
                    <div class="info-item"><strong>Current Bay:</strong> ${bayId}</div>
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
                    <div class="form-group">
                        <label>Reassign to Bay:</label>
                        <select id="editBay">
                            ${this.getBayOptions(bayId)}
                        </select>
                    </div>
                </div>
                
                <div class="towing-info mt-3">
                    <h4>Towing Information</h4>
                    <div id="towingDetails">Select a different bay to see towing details</div>
                </div>
                
                <div class="actions mt-3">
                    <button class="btn btn-primary" onclick="bayManager.updateAircraftDetails('${aircraft.id}', '${bayId}')">Update</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-warning" onclick="bayManager.releaseAircraft('${aircraft.id}', '${bayId}')">Release from Bay</button>
                </div>
            </div>
        `);
        
        // Setup bay change listener for towing calculation
        const baySelect = modal.querySelector('#editBay');
        const towingDetails = modal.querySelector('#towingDetails');
        
        baySelect.onchange = () => {
            const newBay = baySelect.value;
            if (newBay !== bayId) {
                const cost = window.haecoCore.calculateTowingCost(bayId, newBay);
                const dependencies = window.haecoCore.calculateDependencies(bayId, newBay);
                
                towingDetails.innerHTML = `
                    <div class="towing-cost"><strong>Towing Cost:</strong> $${cost}</div>
                    <div class="dependencies"><strong>Dependencies:</strong> ${dependencies.length > 0 ? dependencies.join(', ') : 'None'}</div>
                    <div class="suggestion"><strong>Suggestion:</strong> ${this.getTowingSuggestion(cost, dependencies)}</div>
                `;
            } else {
                towingDetails.innerHTML = 'Select a different bay to see towing details';
            }
        };
    }

    getBayOptions(currentBay) {
        const bays = window.haecoCore.bays;
        let options = '';
        
        Object.keys(bays).forEach(bayId => {
            const selected = bayId === currentBay ? 'selected' : '';
            const status = bays[bayId].occupied && bayId !== currentBay ? ' (Occupied)' : '';
            options += `<option value="${bayId}" ${selected}>Bay ${bayId}${status}</option>`;
        });
        
        return options;
    }

    getTowingSuggestion(cost, dependencies) {
        if (dependencies.length > 0) {
            return `⚠️ ${dependencies.length} bay(s) need to be cleared first. Consider alternative timing.`;
        }
        if (cost > 200) {
            return `💰 High towing cost. Consider if move is necessary or find closer bay.`;
        }
        if (cost < 100) {
            return `✅ Low cost move. Good option for optimization.`;
        }
        return `📊 Moderate cost. Evaluate based on operational needs.`;
    }

    updateAircraftDetails(aircraftId, currentBay) {
        const modal = document.querySelector('.modal-overlay');
        const arrivalInput = modal.querySelector('#editArrival');
        const departureInput = modal.querySelector('#editDeparture');
        const baySelect = modal.querySelector('#editBay');
        
        const updates = {
            arrivalTime: arrivalInput.value,
            departureTime: departureInput.value
        };
        
        const newBay = baySelect.value;
        
        try {
            // Update aircraft details
            window.haecoCore.updateAircraft(aircraftId, updates);
            
            // Handle bay reassignment if needed
            if (newBay !== currentBay) {
                window.haecoCore.assignBay(aircraftId, newBay);
                const cost = window.haecoCore.calculateTowingCost(currentBay, newBay);
                this.showNotification(`Aircraft moved to Bay ${newBay}. Towing cost: $${cost}`, 'success');
            } else {
                this.showNotification('Aircraft details updated successfully', 'success');
            }
            
            // Refresh displays
            this.renderBayLayout();
            this.renderUtilizationTimeline();
            if(this.selectedBay == currentBay){this.showBayDetails(currentBay);}
            modal.remove();
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    releaseAircraft(aircraftId, bayId) {
        if (confirm('Are you sure you want to release this aircraft from the bay?')) {
            try {
                window.haecoCore.vacateBay(bayId);
                this.renderBayLayout();
                this.renderUtilizationTimeline();
                document.querySelector('.modal-overlay').remove();
                this.showNotification('Aircraft released from bay', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
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
    window.bayManager = new BayManager();
});