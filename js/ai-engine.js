// AI Engine for HAECO V6 - Smart Bay Assignment and Optimization
class AIEngine {
    constructor() {
        this.intelligenceLevel = 3; // Default level
        this.priorities = {
            workType: 0.4,
            priority: 0.3,
            efficiency: 0.2,
            cost: 0.1
        };
    }

    // Main optimization function
    optimizeBayAssignments(aircraft = null) {
        const aircraftToOptimize = aircraft || window.haecoCore.aircraft.filter(a => !a.currentBay);
        const availableBays = Object.keys(window.haecoCore.bays).filter(bayId => 
            !window.haecoCore.bays[bayId].occupied
        );

        const recommendations = [];

        for (const aircraft of aircraftToOptimize) {
            const recommendation = this.findOptimalBay(aircraft, availableBays);
            if (recommendation) {
                recommendations.push(recommendation);
                // Remove bay from available list for next iteration
                const bayIndex = availableBays.indexOf(recommendation.bayId);
                if (bayIndex > -1) availableBays.splice(bayIndex, 1);
            }
        }

        return this.rankRecommendations(recommendations);
    }

    findOptimalBay(aircraft, availableBays) {
        const scores = [];

        for (const bayId of availableBays) {
            const bay = window.haecoCore.bays[bayId];
            
            if (!window.haecoCore.validateBayAssignment(aircraft, bay)) {
                continue;
            }

            const score = this.calculateBayScore(aircraft, bay, bayId);
            scores.push({
                aircraftId: aircraft.id,
                aircraftReg: aircraft.registration,
                bayId: bayId,
                score: score.total,
                reasoning: score.reasoning,
                confidence: score.confidence
            });
        }

        if (scores.length === 0) return null;

        // Return highest scoring bay
        scores.sort((a, b) => b.score - a.score);
        return scores[0];
    }

    calculateBayScore(aircraft, bay, bayId) {
        let score = 0;
        const reasoning = [];
        
        // Work type compatibility (40% weight)
        const workTypeScore = this.getWorkTypeScore(aircraft.workType, bay.type);
        score += workTypeScore * this.priorities.workType;
        reasoning.push(`Work type match: ${workTypeScore.toFixed(1)}/10`);

        // Priority handling (30% weight)
        const priorityScore = this.getPriorityScore(aircraft.priority, bay.type);
        score += priorityScore * this.priorities.priority;
        reasoning.push(`Priority handling: ${priorityScore.toFixed(1)}/10`);

        // Efficiency (20% weight)
        const efficiencyScore = this.getEfficiencyScore(aircraft, bay, bayId);
        score += efficiencyScore * this.priorities.efficiency;
        reasoning.push(`Efficiency: ${efficiencyScore.toFixed(1)}/10`);

        // Cost consideration (10% weight)
        const costScore = this.getCostScore(aircraft, bayId);
        score += costScore * this.priorities.cost;
        reasoning.push(`Cost efficiency: ${costScore.toFixed(1)}/10`);

        // Intelligence level adjustments
        score = this.applyIntelligenceModifiers(score, aircraft, bay, bayId);

        const confidence = Math.min(95, Math.max(60, score * 10));

        return {
            total: score,
            reasoning: reasoning,
            confidence: confidence
        };
    }

    getWorkTypeScore(workType, bayType) {
        const compatibility = {
            'paint': { 'paint': 10, 'in': 6, 'mte': 3, 'outer': 2, 'special': 1 },
            'maintenance': { 'mte': 10, 'in': 8, 'paint': 6, 'outer': 4, 'special': 2 },
            'inspection': { 'in': 10, 'paint': 8, 'outer': 6, 'mte': 4, 'special': 2 },
            'storage': { 'outer': 10, 'in': 3, 'paint': 2, 'mte': 2, 'special': 1 },
            'special': { 'special': 10, 'in': 4, 'paint': 3, 'mte': 2, 'outer': 1 }
        };

        return compatibility[workType]?.[bayType] || 1;
    }

    getPriorityScore(priority, bayType) {
        const priorityWeights = {
            'urgent': 10,
            'high': 8,
            'normal': 6,
            'low': 4
        };

        const bayPriorityBonus = {
            'paint': 2,
            'in': 1.5,
            'mte': 1.2,
            'special': 3,
            'outer': 1
        };

        const baseScore = priorityWeights[priority] || 6;
        const bonus = bayPriorityBonus[bayType] || 1;
        
        return Math.min(10, baseScore * bonus);
    }

    getEfficiencyScore(aircraft, bay, bayId) {
        let score = 5; // Base score

        // Size efficiency
        if (aircraft.size === 'small' && bay.type === 'special') {
            score += 3; // Perfect match
        } else if (aircraft.size === 'large' && ['paint', 'in'].includes(bay.type)) {
            score += 2; // Good match
        }

        // Proximity to related bays
        const proximityBonus = this.calculateProximityBonus(bayId, aircraft.workType);
        score += proximityBonus;

        // Avoid overuse of premium bays for simple work
        if (['storage'].includes(aircraft.workType) && ['paint', 'special'].includes(bay.type)) {
            score -= 2;
        }

        return Math.max(1, Math.min(10, score));
    }

    getCostScore(aircraft, bayId) {
        // Calculate movement cost from current position
        const currentBay = aircraft.currentBay;
        if (!currentBay) return 8; // No movement cost

        const movementCost = window.haecoCore.calculateTowingCost(currentBay, bayId);
        const maxCost = window.haecoCore.settings.defaultTowingCost * 2;
        
        // Invert cost (lower cost = higher score)
        return Math.max(1, 10 - (movementCost / maxCost) * 9);
    }

    calculateProximityBonus(bayId, workType) {
        // Define bay clusters for different work types
        const clusters = {
            'paint': ['1', '3', '7', '8'],
            'maintenance': ['A', 'B', 'J', '2', '4', '6'],
            'inspection': ['1', '2', '3', '4', '6', '7', '8'],
            'storage': ['C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'N', 'P', 'Q', 'R']
        };

        const relevantCluster = clusters[workType] || [];
        return relevantCluster.includes(bayId) ? 1 : 0;
    }

    applyIntelligenceModifiers(baseScore, aircraft, bay, bayId) {
        let score = baseScore;

        switch (this.intelligenceLevel) {
            case 1: // Basic
                // No modifications
                break;
            case 2: // Standard
                // Small adjustments for obvious mismatches
                if (aircraft.size === 'large' && bay.type === 'special') {
                    score *= 0.1;
                }
                break;
            case 3: // Advanced
                // Consider dependencies and conflicts
                score *= this.getDependencyModifier(bayId);
                break;
            case 4: // Expert
                // Predictive scheduling
                score *= this.getPredictiveModifier(aircraft, bayId);
                break;
            case 5: // Master
                // Full optimization with future planning
                score *= this.getStrategicModifier(aircraft, bay, bayId);
                break;
        }

        return score;
    }

    getDependencyModifier(bayId) {
        // Check if bay assignment would create movement conflicts
        const dependencies = window.haecoCore.calculateDependencies('temp', bayId);
        return dependencies.length > 0 ? 0.8 : 1.0;
    }

    getPredictiveModifier(aircraft, bayId) {
        // Consider future aircraft arrivals
        const futureConflicts = this.checkFutureConflicts(aircraft, bayId);
        return futureConflicts ? 0.7 : 1.1;
    }

    getStrategicModifier(aircraft, bay, bayId) {
        // Full strategic planning
        let modifier = 1.0;
        
        // Reserve premium bays for high-priority work
        if (bay.type === 'paint' && aircraft.priority === 'low') {
            modifier *= 0.6;
        }
        
        // Optimize for batch processing
        const similarAircraft = window.haecoCore.aircraft.filter(a => 
            a.workType === aircraft.workType && !a.currentBay
        );
        if (similarAircraft.length > 1) {
            modifier *= 1.2; // Bonus for grouping similar work
        }

        return modifier;
    }

    checkFutureConflicts(aircraft, bayId) {
        // Simple future conflict detection
        const departureTime = new Date(aircraft.departureTime);
        const futureAircraft = window.haecoCore.aircraft.filter(a => {
            const arrivalTime = new Date(a.arrivalTime);
            return arrivalTime > new Date() && arrivalTime < departureTime;
        });

        return futureAircraft.length > 0;
    }

    rankRecommendations(recommendations) {
        // Sort by score and add ranking
        recommendations.sort((a, b) => b.score - a.score);
        
        return recommendations.map((rec, index) => ({
            ...rec,
            rank: index + 1,
            recommendation: this.getRecommendationText(rec)
        }));
    }

    getRecommendationText(rec) {
        const confidence = rec.confidence;
        let text = `Assign ${rec.aircraftReg} to Bay ${rec.bayId}`;
        
        if (confidence >= 90) {
            text += " (Highly Recommended)";
        } else if (confidence >= 75) {
            text += " (Recommended)";
        } else if (confidence >= 60) {
            text += " (Consider)";
        } else {
            text += " (Alternative)";
        }

        return text;
    }

    // Chatbot AI functions
    processQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Import/Export commands
        if (lowerQuery.includes('import') || lowerQuery.includes('export')) {
            return this.getImportExportResponse(lowerQuery);
        }
        
        // Guidelines and help
        if (lowerQuery.includes('guide') || lowerQuery.includes('how to') || lowerQuery.includes('help')) {
            return this.getGuidelineResponse(lowerQuery);
        }
        
        // Scenario queries
        if (lowerQuery.includes('scenario') || lowerQuery.includes('situation') || lowerQuery.includes('what if')) {
            return this.getScenarioResponse(lowerQuery);
        }
        
        // Time and date queries
        if (lowerQuery.includes('time') || lowerQuery.includes('date')) {
            return this.getTimeResponse();
        }
        
        // Bay status queries
        if (lowerQuery.includes('bay') && (lowerQuery.includes('status') || lowerQuery.includes('available'))) {
            return this.getBayStatusResponse();
        }
        
        // Aircraft queries
        if (lowerQuery.includes('aircraft') || lowerQuery.includes('plane')) {
            return this.getAircraftResponse(lowerQuery);
        }
        
        // Assignment suggestions
        if (lowerQuery.includes('assign') || lowerQuery.includes('recommend')) {
            return this.getAssignmentResponse(lowerQuery);
        }
        
        // Statistics queries
        if (lowerQuery.includes('stat') || lowerQuery.includes('report')) {
            return this.getStatisticsResponse();
        }
        
        // MTE queries
        if (lowerQuery.includes('mte')) {
            return this.getMTEResponse();
        }
        
        // General help
        return this.getHelpResponse(lowerQuery);
    }

    getTimeResponse() {
        const now = new Date();
        return `Current time: ${now.toLocaleString()}. Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }

    getBayStatusResponse() {
        const stats = window.haecoCore.getStatistics();
        const availableBays = Object.keys(window.haecoCore.bays).filter(bayId => 
            !window.haecoCore.bays[bayId].occupied
        );
        
        return `Bay Status: ${stats.occupiedBays} occupied, ${stats.availableBays} available. Available bays: ${availableBays.join(', ')}.`;
    }

    getAircraftResponse(query) {
        const aircraft = window.haecoCore.aircraft;
        
        if (query.includes('count') || query.includes('how many')) {
            return `There are currently ${aircraft.length} aircraft in the system.`;
        }
        
        if (query.includes('scheduled')) {
            const scheduled = aircraft.filter(a => a.status === 'scheduled').length;
            return `${scheduled} aircraft are scheduled for arrival.`;
        }
        
        return `Aircraft overview: ${aircraft.length} total aircraft in system.`;
    }

    getAssignmentResponse(query) {
        const unassigned = window.haecoCore.aircraft.filter(a => !a.currentBay);
        
        if (unassigned.length === 0) {
            return "All aircraft are currently assigned to bays.";
        }
        
        const recommendations = this.optimizeBayAssignments(unassigned.slice(0, 3));
        
        if (recommendations.length === 0) {
            return "No suitable bay assignments found at this time.";
        }
        
        let response = `I recommend the following assignments:\n`;
        recommendations.slice(0, 3).forEach(rec => {
            response += `• ${rec.recommendation} (${rec.confidence.toFixed(0)}% confidence)\n`;
        });
        
        return response;
    }

    getStatisticsResponse() {
        const stats = window.haecoCore.getStatistics();
        return `System Statistics:
• Total Bays: ${stats.totalBays}
• Occupied: ${stats.occupiedBays}
• Available: ${stats.availableBays}
• Efficiency: ${stats.efficiency}%
• Aircraft: ${stats.totalAircraft}`;
    }

    getImportExportResponse(query) {
        if (query.includes('import')) {
            return "To import aircraft data:\n1. Download CSV template from Schedule page\n2. Fill in: registration, type, size, workType, priority, arrivalTime, departureTime, needsMTE\n3. Use 'Import CSV' button\n4. Aircraft will be ready for auto-assignment";
        }
        if (query.includes('export')) {
            return "Export options:\n• Dashboard: Export all data (JSON)\n• Schedule: Export aircraft data (CSV)\n• Analytics: Export reports\n• Admin: Full system backup\n\nUse the export buttons in each section.";
        }
        return "I can help with import/export operations. Ask about 'import CSV' or 'export data'.";
    }

    getGuidelineResponse(query) {
        if (query.includes('bay') || query.includes('assign')) {
            return "Bay Assignment Guidelines:\n• Paint Bays (1,3,7,8): Paint work only\n• In Bays (1,2,3,4,6,7,8): General maintenance\n• Outside Bays (A,B,J,C,D,E,F,G,H,K,L,N,P,Q,R): Storage & basic work\n• A,B,J: Can activate MTE for urgent maintenance (becomes In Bay)\n• Special Bay (5): Small aircraft only\n\nClick 📖 Guidelines button for detailed information.";
        }
        if (query.includes('mte')) {
            return "MTE Guidelines:\n• Only 2 MTE units available system-wide\n• A,B,J are Outside Bays by default\n• MTE auto-activates for urgent maintenance aircraft\n• When MTE active: A,B,J become In Bays\n• Regular maintenance uses standard In Bays";
        }
        return "System Guidelines:\n• Use Auto-Assign for optimal placement\n• Import CSV with proper datetime format\n• Monitor 7-day bay timeline for conflicts\n• Check towing times for movement planning\n• Click 📖 Guidelines on any page for help";
    }

    getScenarioResponse(query) {
        if (query.includes('urgent') || query.includes('emergency')) {
            return "Urgent Aircraft Scenario:\n1. System checks for available In/Paint bays\n2. If none available, activates MTE on A,B,J (max 2)\n3. A,B,J transform from Outside to In Bay\n4. Aircraft gets priority assignment\n5. MTE deactivates when aircraft leaves\n\nExample: Urgent B777 maintenance → Bay A activates MTE → becomes In Bay";
        }
        if (query.includes('full') || query.includes('busy')) {
            return "High Capacity Scenario:\n• Paint bays: 4 aircraft max\n• In bays: 7 aircraft max\n• MTE activation: 2 urgent aircraft max\n• Outside bays: 12+ aircraft\n• Special bay: 1 small aircraft\n\nTotal capacity: ~25 aircraft with optimal assignment";
        }
        return "Common Scenarios:\n• 'Urgent aircraft' → MTE activation\n• 'Full capacity' → Capacity planning\n• 'Movement conflict' → Dependency checking\n• 'Timeline view' → 7-day bay visualization\n\nAsk about specific scenarios for detailed guidance.";
    }

    getMTEResponse() {
        const activeMTE = Object.values(window.haecoCore.bays).filter(b => b.mteActive).length;
        const mteCapableBays = Object.entries(window.haecoCore.bays)
            .filter(([id, bay]) => bay.mteCapable)
            .map(([id]) => id);
        const activeMTEBays = Object.entries(window.haecoCore.bays)
            .filter(([id, bay]) => bay.mteActive)
            .map(([id]) => id);
        
        return `MTE Status:\n• Available Units: ${2 - activeMTE}/2\n• MTE Capable Bays: ${mteCapableBays.join(', ')}\n• Currently Active: ${activeMTEBays.length ? activeMTEBays.join(', ') : 'None'}\n\nMTE auto-activates for urgent maintenance aircraft, transforming Outside Bays to In Bays.`;
    }

    getHelpResponse(query) {
        const responses = [
            "I can help with bay assignments, aircraft scheduling, import/export, and system guidelines. What would you like to know?",
            "Ask me about: bay guidelines, MTE usage, import CSV, export data, or optimization recommendations.",
            "Try: 'How to assign bays?', 'MTE status', 'Import guidelines', or 'Export data'",
            "Available commands: guidelines, import/export help, bay status, aircraft info, recommendations"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Predictive functions
    predictNextAssignment(aircraftId) {
        const aircraft = window.haecoCore.aircraft.find(a => a.id === aircraftId);
        if (!aircraft) return null;
        
        const recommendations = this.optimizeBayAssignments([aircraft]);
        return recommendations[0] || null;
    }

    suggestOptimalSchedule(timeframe = 7) {
        // Suggest optimal schedule for next N days
        const suggestions = [];
        const aircraft = window.haecoCore.aircraft.filter(a => a.status === 'scheduled');
        
        aircraft.forEach(ac => {
            const prediction = this.predictNextAssignment(ac.id);
            if (prediction) {
                suggestions.push({
                    aircraft: ac.registration,
                    suggestedBay: prediction.bayId,
                    confidence: prediction.confidence,
                    reasoning: prediction.reasoning
                });
            }
        });
        
        return suggestions;
    }
}

// Initialize AI Engine
window.aiEngine = new AIEngine();