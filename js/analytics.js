// Analytics System for HAECO V6
class AnalyticsManager {
    constructor() {
        this.timeRange = 'week';
        this.currentPeriod = new Date();
        this.init();
    }

    init() {
        this.updateMetrics();
        this.renderCharts();
        this.renderActivityTimeline();
        this.renderPerformanceMetrics();
        this.renderActivityLog();
        this.updateCurrentPeriod();
        this.setupEventListeners();
        
        // Auto-refresh every 60 seconds
        setInterval(() => {
            this.updateMetrics();
            this.renderActivityLog();
        }, 60000);
    }

    updateMetrics() {
        const stats = window.haecoCore.getStatistics();
        const movements = this.getMovementsInRange();
        const aircraft = this.getAircraftInRange();
        
        // Bay Efficiency
        document.getElementById('bayEfficiency').textContent = stats.efficiency + '%';
        
        // Aircraft Processed
        document.getElementById('aircraftProcessed').textContent = aircraft.length;
        
        // Movement Cost
        const totalCost = movements.reduce((sum, movement) => sum + (movement.cost || 0), 0);
        //document.getElementById('movementCost').textContent = '$' + totalCost.toLocaleString();
        
        // Optimization Score (based on efficiency and AI recommendations)
        const optimizationScore = this.calculateOptimizationScore();
        document.getElementById('optimizationScore').textContent = optimizationScore;
    }

    calculateOptimizationScore() {
        const stats = window.haecoCore.getStatistics();
        const unassigned = window.haecoCore.aircraft.filter(a => !a.currentBay).length;
        const total = window.haecoCore.aircraft.length;
        
        let score = stats.efficiency;
        
        // Penalty for unassigned aircraft
        if (total > 0) {
            const assignmentRate = ((total - unassigned) / total) * 100;
            score = (score + assignmentRate) / 2;
        }
        
        return Math.round(score);
    }

    renderCharts() {
        this.renderBayTypeChart();
        this.renderWorkTypeChart();
    }

    renderBayTypeChart() {
        const container = document.getElementById('bayTypeChart');
        if (!container) return;

        const bayTypes = {
            paint: { count: 0, occupied: 0 },
            in: { count: 0, occupied: 0 },
            outer: { count: 0, occupied: 0 },
            special: { count: 0, occupied: 0 }
        };

        Object.values(window.haecoCore.bays).forEach(bay => {
            if (bayTypes[bay.type]) {
                bayTypes[bay.type].count++;
                if (bay.occupied) {
                    bayTypes[bay.type].occupied++;
                }
            }
        });

        let html = '<div class="chart-container">';
        
        Object.entries(bayTypes).forEach(([type, data]) => {
            const utilization = data.count > 0 ? Math.round((data.occupied / data.count) * 100) : 0;
            const color = this.getBayTypeColor(type);
            
            html += `
                <div class="chart-bar" style="margin-bottom: 15px;">
                    <div class="flex justify-between align-center mb-1">
                        <span style="text-transform: capitalize; font-weight: 600;">${type}</span>
                        <span class="text-gray-4">${data.occupied}/${data.count} (${utilization}%)</span>
                    </div>
                    <div style="background: var(--gray-2); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: ${color}; height: 100%; width: ${utilization}%; transition: var(--transition);"></div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderWorkTypeChart() {
        const container = document.getElementById('workTypeChart');
        if (!container) return;

        const workTypes = {};
        
        window.haecoCore.aircraft.forEach(aircraft => {
            const type = aircraft.workType;
            workTypes[type] = (workTypes[type] || 0) + 1;
        });

        const total = Object.values(workTypes).reduce((sum, count) => sum + count, 0);

        let html = '<div class="chart-container">';
        
        if (total === 0) {
            html += '<p class="text-center text-gray-4">No aircraft data available</p>';
        } else {
            Object.entries(workTypes).forEach(([type, count]) => {
                const percentage = Math.round((count / total) * 100);
                const color = this.getWorkTypeColor(type);
                
                html += `
                    <div class="chart-bar" style="margin-bottom: 15px;">
                        <div class="flex justify-between align-center mb-1">
                            <span style="text-transform: capitalize; font-weight: 600;">${type}</span>
                            <span class="text-gray-4">${count} (${percentage}%)</span>
                        </div>
                        <div style="background: var(--gray-2); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${color}; height: 100%; width: ${percentage}%; transition: var(--transition);"></div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderActivityTimeline() {
        const container = document.getElementById('activityTimeline');
        if (!container) return;

        const logs = this.getLogsInRange();
        
        container.innerHTML = '';
        container.style.cssText = `
            max-height: 400px;
            overflow-y: auto;
            padding: 20px;
            background: var(--gray-1);
            border-radius: var(--border-radius);
        `;

        if (logs.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-4">No activity in selected time range</p>';
            return;
        }

        // Group logs by date
        const groupedLogs = {};
        logs.forEach(log => {
            const date = new Date(log.timestamp).toDateString();
            if (!groupedLogs[date]) {
                groupedLogs[date] = [];
            }
            groupedLogs[date].push(log);
        });

        Object.entries(groupedLogs).forEach(([date, dayLogs]) => {
            const dateElement = document.createElement('div');
            dateElement.innerHTML = `
                <div style="font-weight: 600; color: var(--gray-6); margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid var(--gray-2);">
                    ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            `;
            container.appendChild(dateElement);

            dayLogs.forEach(log => {
                const logElement = document.createElement('div');
                logElement.className = 'timeline-item';
                logElement.style.cssText = 'margin-bottom: 10px; padding: 10px; background: var(--white); border-radius: 8px;';
                
                const time = new Date(log.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                logElement.innerHTML = `
                    <div class="flex justify-between align-center">
                        <div>
                            <strong>${log.action}</strong>
                            <div class="text-gray-4">${log.description}</div>
                        </div>
                        <div class="text-gray-4" style="font-size: 12px;">
                            ${time}<br>
                            ${log.user}
                        </div>
                    </div>
                `;
                
                container.appendChild(logElement);
            });
        });
    }

    renderPerformanceMetrics() {
        const tbody = document.getElementById('metricsTableBody');
        if (!tbody) return;

        const stats = window.haecoCore.getStatistics();
        const movements = this.getMovementsInRange();
        const aircraft = this.getAircraftInRange();
        
        const metrics = [
            {
                name: 'Bay Utilization',
                current: stats.efficiency + '%',
                target: '85%',
                status: stats.efficiency >= 85 ? 'success' : stats.efficiency >= 70 ? 'warning' : 'error'
            },
            {
                name: 'Assignment Rate',
                current: this.calculateAssignmentRate() + '%',
                target: '95%',
                status: this.calculateAssignmentRate() >= 95 ? 'success' : this.calculateAssignmentRate() >= 80 ? 'warning' : 'error'
            },
            {
                name: 'Average Towing Cost',
                current: '$' + this.calculateAverageTowingCost(),
                target: '$500',
                status: this.calculateAverageTowingCost() <= 500 ? 'success' : this.calculateAverageTowingCost() <= 750 ? 'warning' : 'error'
            },
            {
                name: 'Aircraft Throughput',
                current: aircraft.length,
                target: '50',
                status: aircraft.length >= 50 ? 'success' : aircraft.length >= 30 ? 'warning' : 'error'
            }
        ];

        tbody.innerHTML = '';
        
        metrics.forEach(metric => {
            const row = document.createElement('tr');
            const statusClass = {
                'success': 'status-active',
                'warning': 'status-pending',
                'error': 'status-inactive'
            }[metric.status];

            row.innerHTML = `
                <td><strong>${metric.name}</strong></td>
                <td>${metric.current}</td>
                <td>${metric.target}</td>
                <td><span class="status ${statusClass}">${metric.status.toUpperCase()}</span></td>
            `;
            
            tbody.appendChild(row);
        });
    }

    renderActivityLog() {
        const container = document.getElementById('activityLog');
        if (!container) return;

        const logs = window.haecoCore.logs.slice(0, 10); // Show last 10 activities
        
        container.innerHTML = '';

        if (logs.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-4">No recent activity</p>';
            return;
        }

        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.style.cssText = `
                padding: 10px;
                border-bottom: 1px solid var(--gray-2);
                transition: var(--transition);
            `;
            logElement.onmouseover = () => logElement.style.background = 'var(--gray-1)';
            logElement.onmouseout = () => logElement.style.background = 'transparent';

            const timeAgo = this.getTimeAgo(log.timestamp);
            
            logElement.innerHTML = `
                <div class="flex justify-between align-center">
                    <div>
                        <strong>${log.action}</strong>
                        <div class="text-gray-4" style="font-size: 14px;">${log.description}</div>
                    </div>
                    <div class="text-gray-4" style="font-size: 12px; text-align: right;">
                        ${timeAgo}<br>
                        ${log.user}
                    </div>
                </div>
            `;
            
            container.appendChild(logElement);
        });
    }

    setupEventListeners() {
        window.updateTimeRange = () => this.updateTimeRange();
        window.exportReport = () => this.exportReport();
        window.previousPeriod = () => this.previousPeriod();
        window.nextPeriod = () => this.nextPeriod();
        window.refreshActivityLog = () => this.renderActivityLog();
    }

    updateTimeRange() {
        this.timeRange = document.getElementById('timeRange').value;
        this.updateMetrics();
        this.renderCharts();
        this.renderActivityTimeline();
        this.renderPerformanceMetrics();
        this.updateCurrentPeriod();
    }

    previousPeriod() {
        switch (this.timeRange) {
            case 'today':
                this.currentPeriod.setDate(this.currentPeriod.getDate() - 1);
                break;
            case 'week':
                this.currentPeriod.setDate(this.currentPeriod.getDate() - 7);
                break;
            case 'month':
                this.currentPeriod.setMonth(this.currentPeriod.getMonth() - 1);
                break;
            case 'quarter':
                this.currentPeriod.setMonth(this.currentPeriod.getMonth() - 3);
                break;
        }
        this.updateCurrentPeriod();
        this.updateMetrics();
        this.renderCharts();
        this.renderActivityTimeline();
    }

    nextPeriod() {
        switch (this.timeRange) {
            case 'today':
                this.currentPeriod.setDate(this.currentPeriod.getDate() + 1);
                break;
            case 'week':
                this.currentPeriod.setDate(this.currentPeriod.getDate() + 7);
                break;
            case 'month':
                this.currentPeriod.setMonth(this.currentPeriod.getMonth() + 1);
                break;
            case 'quarter':
                this.currentPeriod.setMonth(this.currentPeriod.getMonth() + 3);
                break;
        }
        this.updateCurrentPeriod();
        this.updateMetrics();
        this.renderCharts();
        this.renderActivityTimeline();
    }

    updateCurrentPeriod() {
        const element = document.getElementById('currentPeriod');
        if (!element) return;

        let periodText = '';
        switch (this.timeRange) {
            case 'today':
                periodText = this.currentPeriod.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                break;
            case 'week':
                const weekStart = new Date(this.currentPeriod);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                periodText = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
                break;
            case 'month':
                periodText = this.currentPeriod.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                });
                break;
            case 'quarter':
                const quarter = Math.floor(this.currentPeriod.getMonth() / 3) + 1;
                periodText = `Q${quarter} ${this.currentPeriod.getFullYear()}`;
                break;
        }
        
        element.textContent = periodText;
    }

    exportReport() {
        const stats = window.haecoCore.getStatistics();
        const movements = this.getMovementsInRange();
        const aircraft = this.getAircraftInRange();
        const logs = this.getLogsInRange();

        const report = {
            generatedAt: new Date().toISOString(),
            timeRange: this.timeRange,
            period: this.currentPeriod.toISOString(),
            summary: {
                totalBays: stats.totalBays,
                occupiedBays: stats.occupiedBays,
                efficiency: stats.efficiency,
                aircraftProcessed: aircraft.length,
                totalMovements: movements.length,
                totalCost: movements.reduce((sum, m) => sum + (m.cost || 0), 0)
            },
            bayUtilization: this.getBayUtilizationData(),
            workTypeDistribution: this.getWorkTypeDistribution(),
            performanceMetrics: this.getPerformanceMetricsData(),
            activitySummary: logs.slice(0, 50)
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `haeco_analytics_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Helper methods
    getMovementsInRange() {
        const now = new Date();
        const startDate = this.getStartDate(now);
        
        return window.haecoCore.movements.filter(movement => {
            const movementDate = new Date(movement.plannedTime);
            return movementDate >= startDate && movementDate <= now;
        });
    }

    getAircraftInRange() {
        const now = new Date();
        const startDate = this.getStartDate(now);
        
        return window.haecoCore.aircraft.filter(aircraft => {
            const createdDate = new Date(aircraft.createdAt);
            return createdDate >= startDate && createdDate <= now;
        });
    }

    getLogsInRange() {
        const now = new Date();
        const startDate = this.getStartDate(now);
        
        return window.haecoCore.logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= now;
        });
    }

    getStartDate(endDate) {
        const start = new Date(endDate);
        
        switch (this.timeRange) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'quarter':
                start.setMonth(start.getMonth() - 3);
                break;
        }
        
        return start;
    }

    calculateAssignmentRate() {
        const total = window.haecoCore.aircraft.length;
        if (total === 0) return 100;
        
        const assigned = window.haecoCore.aircraft.filter(a => a.currentBay).length;
        return Math.round((assigned / total) * 100);
    }

    calculateAverageTowingCost() {
        const movements = this.getMovementsInRange();
        if (movements.length === 0) return 0;
        
        const totalCost = movements.reduce((sum, m) => sum + (m.cost || 0), 0);
        return Math.round(totalCost / movements.length);
    }

    getBayTypeColor(type) {
        const colors = {
            paint: 'var(--warning-orange)',
            in: 'var(--primary-blue)',
            outer: 'var(--gray-4)',
            special: 'var(--error-red)'
        };
        return colors[type] || 'var(--gray-4)';
    }

    getWorkTypeColor(type) {
        const colors = {
            paint: 'var(--warning-orange)',
            maintenance: 'var(--primary-blue)',
            inspection: 'var(--success-green)',
            storage: 'var(--gray-4)',
            special: 'var(--error-red)'
        };
        return colors[type] || 'var(--gray-4)';
    }

    getBayUtilizationData() {
        const data = {};
        Object.values(window.haecoCore.bays).forEach(bay => {
            if (!data[bay.type]) {
                data[bay.type] = { total: 0, occupied: 0 };
            }
            data[bay.type].total++;
            if (bay.occupied) {
                data[bay.type].occupied++;
            }
        });
        return data;
    }

    getWorkTypeDistribution() {
        const data = {};
        window.haecoCore.aircraft.forEach(aircraft => {
            data[aircraft.workType] = (data[aircraft.workType] || 0) + 1;
        });
        return data;
    }

    getPerformanceMetricsData() {
        const stats = window.haecoCore.getStatistics();
        return {
            bayUtilization: stats.efficiency,
            assignmentRate: this.calculateAssignmentRate(),
            averageTowingCost: this.calculateAverageTowingCost(),
            aircraftThroughput: this.getAircraftInRange().length
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});