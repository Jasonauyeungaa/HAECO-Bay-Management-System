// Core Data Management System for HAECO V6
class HaecoCore {
    constructor() {
        this.bays = this.initializeBays();
        this.aircraft = this.loadAircraft();
        this.movements = this.loadMovements();
        this.logs = this.loadLogs();
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.autoSave();
    }

    // Bay Management
    initializeBays() {
        const bayConfig = {
            // Paint Bays
            '1': { type: 'paint', category: 'Paint Bay', occupied: false, aircraft: null, capabilities: ['paint', 'in'] },
            '3': { type: 'paint', category: 'Paint Bay', occupied: false, aircraft: null, capabilities: ['paint', 'in'] },
            '7': { type: 'paint', category: 'Paint Bay', occupied: false, aircraft: null, capabilities: ['paint', 'in'] },
            '8': { type: 'paint', category: 'Paint Bay', occupied: false, aircraft: null, capabilities: ['paint', 'in'] },
            
            // In Bays
            '2': { type: 'in', category: 'In Bay', occupied: false, aircraft: null, capabilities: ['in'] },
            '4': { type: 'in', category: 'In Bay', occupied: false, aircraft: null, capabilities: ['in'] },
            '6': { type: 'in', category: 'In Bay', occupied: false, aircraft: null, capabilities: ['in'] },
            
            // Outer Bays (A, B, J, R are now regular outer bays)
            'A': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'B': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'J': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            
            // Outer Bays
            'C': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'D': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'E': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'F': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'G': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'H': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'K': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'L': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'N': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'P': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'Q': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            'R': { type: 'outer', category: 'Outer Bay', occupied: false, aircraft: null, capabilities: ['outer'] },
            
            // Special Bay
            '5': { type: 'special', category: 'Special Bay', occupied: false, aircraft: null, capabilities: ['special'], smallAircraftOnly: true }
        };

        const stored = localStorage.getItem('haeco_v6_bays');
        return stored ? { ...bayConfig, ...JSON.parse(stored) } : bayConfig;
    }

    loadAircraft() {
        const stored = localStorage.getItem('haeco_v6_aircraft');
        return stored ? JSON.parse(stored) : [];
    }

    loadMovements() {
        const stored = localStorage.getItem('haeco_v6_movements');
        return stored ? JSON.parse(stored) : [];
    }

    loadLogs() {
        const stored = localStorage.getItem('haeco_v6_logs');
        return stored ? JSON.parse(stored) : [];
    }

    loadSettings() {
        const defaults = {
            autoSaveInterval: 30000,
            maxLogEntries: 1000,
            defaultTowingCost: 500,
            aiIntelligenceLevel: 3
        };
        const stored = localStorage.getItem('haeco_v6_settings');
        return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    }

    // Save Methods
    saveBays() {
        localStorage.setItem('haeco_v6_bays', JSON.stringify(this.bays));
    }

    saveAircraft() {
        localStorage.setItem('haeco_v6_aircraft', JSON.stringify(this.aircraft));
    }

    saveMovements() {
        localStorage.setItem('haeco_v6_movements', JSON.stringify(this.movements));
    }

    saveLogs() {
        localStorage.setItem('haeco_v6_logs', JSON.stringify(this.logs));
    }

    saveSettings() {
        localStorage.setItem('haeco_v6_settings', JSON.stringify(this.settings));
    }

    saveAll() {
        this.saveBays();
        this.saveAircraft();
        this.saveMovements();
        this.saveLogs();
        this.saveSettings();
    }

    // Aircraft Management
    addAircraft(aircraftData) {
        const aircraft = {
            id: this.generateId(),
            registration: aircraftData.registration,
            type: aircraftData.type,
            size: aircraftData.size || 'large',
            arrivalTime: aircraftData.arrivalTime,
            departureTime: aircraftData.departureTime,
            workType: aircraftData.workType,
            priority: aircraftData.priority || 'normal',
            currentBay: null,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        this.aircraft.push(aircraft);
        this.saveAircraft();
        this.addLog('Aircraft Added', `${aircraft.registration} scheduled for ${aircraft.workType}`);
        return aircraft;
    }

    updateAircraft(id, updates) {
        const index = this.aircraft.findIndex(a => a.id === id);
        if (index !== -1) {
            this.aircraft[index] = { ...this.aircraft[index], ...updates };
            this.saveAircraft();
            this.addLog('Aircraft Updated', `${this.aircraft[index].registration} updated`);
            return this.aircraft[index];
        }
        return null;
    }

    removeAircraft(id) {
        const index = this.aircraft.findIndex(a => a.id === id);
        if (index !== -1) {
            const aircraft = this.aircraft[index];
            if (aircraft.currentBay) {
                this.vacateBay(aircraft.currentBay);
            }
            this.aircraft.splice(index, 1);
            this.saveAircraft();
            this.addLog('Aircraft Removed', `${aircraft.registration} removed from system`);
            return true;
        }
        return false;
    }

    // Bay Operations
    assignBay(aircraftId, bayId) {
        const aircraft = this.aircraft.find(a => a.id === aircraftId);
        const bay = this.bays[bayId];

        if (!aircraft || !bay) return false;

        // Check if bay is available for the aircraft's time period
        if (!this.isBayAvailableForPeriod(bayId, aircraft.arrivalTime, aircraft.departureTime, aircraftId)) {
            throw new Error(`Bay ${bayId} is not available for the requested time period`);
        }

        if (!this.validateBayAssignment(aircraft, bay)) {
            throw new Error(`Aircraft ${aircraft.registration} cannot be assigned to bay ${bayId}`);
        }

        // Vacate current bay if any
        if (aircraft.currentBay) {
            this.vacateBay(aircraft.currentBay);
        }

        // Assign new bay
        bay.occupied = true;
        bay.aircraft = aircraft.id;
        aircraft.currentBay = bayId;
        aircraft.status = 'assigned';

        this.saveBays();
        this.saveAircraft();
        this.addLog('Bay Assignment', `${aircraft.registration} assigned to bay ${bayId}`);
        return true;
    }

    vacateBay(bayId) {
        const bay = this.bays[bayId];
        if (!bay) return false;

        if (bay.aircraft) {
            const aircraft = this.aircraft.find(a => a.id === bay.aircraft);
            if (aircraft) {
                aircraft.currentBay = null;
                aircraft.status = 'available';
            }
        }

        bay.occupied = false;
        bay.aircraft = null;

        this.saveBays();
        this.saveAircraft();
        this.addLog('Bay Vacated', `Bay ${bayId} is now available`);
        return true;
    }

    validateBayAssignment(aircraft, bay) {
        // Special bay only for small aircraft
        if (bay.type === 'special' && aircraft.size !== 'small') {
            return false;
        }

        // Work type compatibility - all bays can now accept aircraft based on work type
        const workTypeBayMap = {
            'paint': ['paint', 'in'],
            'maintenance': ['in', 'paint', 'outer'],
            'inspection': ['in', 'paint', 'outer'],
            'storage': ['outer'],
            'special': ['special'],
            'mte': ['outer'] // MTE work can be done in any outer bay
        };

        const compatibleBays = workTypeBayMap[aircraft.workType] || ['outer'];
        return compatibleBays.includes(bay.type);
    }

    // Movement Planning
    planMovement(fromBay, toBay, aircraftId) {
        const movement = {
            id: this.generateId(),
            aircraftId: aircraftId,
            fromBay: fromBay,
            toBay: toBay,
            cost: this.calculateTowingCost(fromBay, toBay),
            plannedTime: new Date().toISOString(),
            status: 'planned',
            dependencies: this.calculateDependencies(fromBay, toBay)
        };

        this.movements.push(movement);
        this.saveMovements();
        this.addLog('Movement Planned', `Movement from ${fromBay} to ${toBay} planned`);
        return movement;
    }

    calculateTowingCost(fromBay, toBay) {
        // Realistic bay positions based on hangar layout
        const bayPositions = {
            // Top line (Hangars 1,2,3 + P outside)
            '1': [0, 0], '2': [1, 0], '3': [2, 0], '4': [4, 0], '5': [5, 0], '6': [6, 0], '7': [8, 0], '8': [9, 0], 'P': [11, 0],
            // Middle line (A,B in H1, F middle, J in H3, Q outside)
            'A': [0, 2], 'B': [1, 2], 'F': [5, 2], 'J': [8, 2], 'Q': [11, 2],
            // Bottom flexible line (outside hangars)
            'C': [0, 4], 'D': [1, 4], 'E': [2, 4], 'G': [4, 4], 'H': [5, 4], 'K': [6, 4], 'L': [7, 4], 'N': [8, 4], 'R': [11, 4]
        };

        const from = bayPositions[fromBay] || [0, 0];
        const to = bayPositions[toBay] || [0, 0];
        const distance = Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2));
        
        // Base towing time (15 min) + AA approval time (45 min) + distance factor
        const towingTime = 15 + Math.round(distance * 5); // 5 min per distance unit
        const approvalTime = 45; // AA approval time
        const totalTime = towingTime + approvalTime;
        
        // Cost calculation: $50 per 15-min block
        return Math.round((totalTime / 15) * 50);
    }

    calculateDependencies(fromBay, toBay) {
        const dependencies = [];
        const adjacentBays = this.getAdjacentBays(fromBay);
        const pathBays = this.getPathBays(fromBay, toBay);
        
        return [...adjacentBays, ...pathBays].filter(bay => 
            bay !== fromBay && bay !== toBay && this.bays[bay]?.occupied
        );
    }

    getAdjacentBays(bayId) {
        // Define adjacent bays based on hangar layout
        const adjacency = {
            // Top line adjacencies
            '1': ['2', 'A'], '2': ['1', '3', 'B'], '3': ['2', 'C'],
            '4': ['5', 'F'], '5': ['4', '6'], '6': ['5', 'F'],
            '7': ['8', 'J'], '8': ['7', 'J'], 'P': ['Q'],
            // Middle line adjacencies
            'A': ['1', 'B', 'C'], 'B': ['2', 'A', 'D'], 'F': ['4', '6', 'G', 'H'],
            'J': ['7', '8', 'L', 'N'], 'Q': ['P', 'R'],
            // Bottom line adjacencies
            'C': ['3', 'A', 'D'], 'D': ['C', 'B', 'E'], 'E': ['D'],
            'G': ['F', 'H'], 'H': ['G', 'F', 'K'], 'K': ['H', 'L'],
            'L': ['K', 'J', 'N'], 'N': ['L', 'J'], 'R': ['Q']
        };
        return adjacency[bayId] || [];
    }

    getPathBays(fromBay, toBay) {
        // Calculate path between hangars that might block movement
        const hangarPaths = {
            // Paths between different hangar areas
            'hangar1_to_hangar2': ['4'],
            'hangar2_to_hangar3': ['6', '7'],
            'hangar1_to_outside': ['3', 'C'],
            'hangar2_to_outside': ['F', 'G'],
            'hangar3_to_outside': ['J', 'L']
        };
        
        const fromHangar = this.getBayHangar(fromBay);
        const toHangar = this.getBayHangar(toBay);
        
        if (fromHangar !== toHangar) {
            const pathKey = `${fromHangar}_to_${toHangar}`;
            return hangarPaths[pathKey] || [];
        }
        
        return [];
    }

    getBayHangar(bayId) {
        const hangarMap = {
            '1': 'hangar1', '2': 'hangar1', '3': 'hangar1', 'A': 'hangar1', 'B': 'hangar1',
            '4': 'hangar2', '5': 'hangar2', '6': 'hangar2', 'F': 'hangar2',
            '7': 'hangar3', '8': 'hangar3', 'J': 'hangar3',
            'C': 'outside', 'D': 'outside', 'E': 'outside', 'G': 'outside', 'H': 'outside',
            'K': 'outside', 'L': 'outside', 'N': 'outside', 'P': 'outside', 'Q': 'outside', 'R': 'outside'
        };
        return hangarMap[bayId] || 'outside';
    }

    // Bay availability checking for time periods
    isBayAvailableForPeriod(bayId, startTime, endTime, excludeAircraftId = null) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        // Check if any aircraft conflicts with this time period
        const conflictingAircraft = this.aircraft.find(aircraft => {
            if (aircraft.id === excludeAircraftId) return false;
            if (aircraft.currentBay !== bayId) return false;
            
            const aircraftStart = new Date(aircraft.arrivalTime);
            const aircraftEnd = new Date(aircraft.departureTime);
            
            // Check for overlap
            return start < aircraftEnd && end > aircraftStart;
        });
        
        return !conflictingAircraft;
    }

    // Get aircraft scheduled for a specific bay and date
    getAircraftForBayAndDate(bayId, date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return this.aircraft.filter(aircraft => {
            if (aircraft.currentBay !== bayId) return false;
            
            const arrival = new Date(aircraft.arrivalTime);
            const departure = new Date(aircraft.departureTime);
            
            // Check if aircraft is in bay during this date
            return arrival < nextDay && departure >= targetDate;
        });
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addLog(action, description) {
        const log = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            action: action,
            description: description,
            user: window.authSystem?.currentUser?.username || 'system'
        };

        this.logs.unshift(log);
        
        // Keep only recent logs
        if (this.logs.length > this.settings.maxLogEntries) {
            this.logs = this.logs.slice(0, this.settings.maxLogEntries);
        }

        this.saveLogs();
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            dateTimeElement.textContent = now.toLocaleString();
        }
    }

    autoSave() {
        setInterval(() => {
            this.saveAll();
        }, this.settings.autoSaveInterval);
    }

    // Statistics
    getStatistics() {
        const totalBays = Object.keys(this.bays).length;
        const occupiedBays = Object.values(this.bays).filter(bay => bay.occupied).length;
        const totalAircraft = this.aircraft.length;
        const efficiency = totalBays > 0 ? Math.round((occupiedBays / totalBays) * 100) : 0;

        return {
            totalBays,
            occupiedBays,
            totalAircraft,
            efficiency,
            availableBays: totalBays - occupiedBays
        };
    }

    // Data Import/Export
    importCSV(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const imported = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const aircraft = {};
                
                headers.forEach((header, index) => {
                    aircraft[header.toLowerCase()] = values[index];
                });

                if (aircraft.registration) {
                    // Ensure proper data types and defaults
                    aircraft.size = aircraft.size || 'large';
                    aircraft.priority = aircraft.priority || 'normal';
                    aircraft.worktype = aircraft.worktype || 'maintenance';
                    
                    // Fix datetime format and field names
                    if (aircraft.arrivaltime) {
                        aircraft.arrivalTime = aircraft.arrivaltime.includes('T') ? aircraft.arrivaltime : aircraft.arrivaltime + 'T08:00:00';
                        delete aircraft.arrivaltime;
                    }
                    if (aircraft.departuretime) {
                        aircraft.departureTime = aircraft.departuretime.includes('T') ? aircraft.departuretime : aircraft.departuretime + 'T16:00:00';
                        delete aircraft.departuretime;
                    }
                    if (aircraft.worktype) {
                        aircraft.workType = aircraft.worktype;
                        delete aircraft.worktype;
                    }
                    if (aircraft.needsmte !== undefined) {
                        aircraft.needsMTE = aircraft.needsmte === 'true' || aircraft.needsmte === true;
                        delete aircraft.needsmte;
                    }
                    
                    imported.push(this.addAircraft(aircraft));
                }
            }
        }

        this.addLog('Data Import', `Imported ${imported.length} aircraft from CSV`);
        return imported;
    }

    exportData(format = 'json') {
        const data = {
            bays: this.bays,
            aircraft: this.aircraft,
            movements: this.movements,
            logs: this.logs.slice(0, 100), // Export recent logs only
            exportedAt: new Date().toISOString()
        };

        if (format === 'csv') {
            return this.convertToCSV(this.aircraft);
        }

        return JSON.stringify(data, null, 2);
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header] || '').join(','))
        ].join('\n');

        return csvContent;
    }
}

// Initialize core system
window.haecoCore = new HaecoCore();