// Floating Chatbot for HAECO V6
class FloatingChatbot {
    constructor() {
        this.isOpen = false;
        this.currentSessionId = this.generateSessionId();
        this.messages = [];
        this.isTyping = false;
        this.chatHistory = this.loadChatHistory();
        this.init();
    }

    init() {
        this.startNewChat();
        this.createChatbot();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    generateSessionId() {
        return 'floating_chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    loadChatHistory() {
        const stored = localStorage.getItem('haeco_v6_floating_chat_history');
        return stored ? JSON.parse(stored) : [];
    }

    saveChatHistory() {
        if (this.chatHistory.length > 15) {
            this.chatHistory = this.chatHistory.slice(-15);
        }
        localStorage.setItem('haeco_v6_floating_chat_history', JSON.stringify(this.chatHistory));
    }

    startNewChat() {
        if (this.messages.length > 0) {
            this.saveChatToHistory();
        }
        
        this.currentSessionId = this.generateSessionId();
        this.messages = [];
    }

    saveChatToHistory() {
        if (this.messages.length === 0) return;
        
        const chatSession = {
            id: this.currentSessionId,
            timestamp: new Date().toISOString(),
            title: this.generateChatTitle(),
            messages: [...this.messages],
            messageCount: this.messages.length
        };
        
        this.chatHistory = this.chatHistory.filter(chat => chat.id !== this.currentSessionId);
        this.chatHistory.unshift(chatSession);
        this.saveChatHistory();
    }

    generateChatTitle() {
        const userMessages = this.messages.filter(m => m.sender === 'user');
        if (userMessages.length > 0) {
            const firstMessage = userMessages[0].content;
            return firstMessage.length > 25 ? firstMessage.substring(0, 25) + '...' : firstMessage;
        }
        return 'Quick Chat';
    }

    saveMessages() {
        this.saveChatToHistory();
    }

    createChatbot() {
        const chatbot = document.createElement('div');
        chatbot.className = 'floating-chatbot';
        chatbot.innerHTML = `
            <div class="floating-chat-window" id="floatingChatWindow">
                <div class="floating-chat-header">
                    <div class="floating-chat-info">
                        <div class="floating-chat-title">✈️ HAECO Aviation Intelligence</div>
                        <div class="floating-chat-status">🟢 Online • Professional AI Assistant</div>
                    </div>
                    <div class="floating-chat-controls">
                        <button class="chat-control-btn" onclick="floatingChat.startNewChat()" title="New Chat">🆕</button>
                        <button class="chat-control-btn" onclick="floatingChat.toggleHistory()" title="Chat History">📋</button>
                        <button class="chat-close" onclick="floatingChat.toggleChat()">×</button>
                    </div>
                </div>
                <div class="floating-chat-history" id="floatingChatHistory" style="display: none;"></div>
                <div class="floating-chat-messages" id="floatingChatMessages"></div>
                <div class="floating-chat-suggestions" id="floatingChatSuggestions"></div>
                <div class="floating-chat-input">
                    <input type="text" id="floatingChatInput" placeholder="Ask about bay management, aircraft scheduling, or system operations..." />
                    <button onclick="floatingChat.sendMessage()" class="send-btn">Send</button>
                </div>
            </div>
            <button class="chat-toggle" onclick="floatingChat.toggleChat()">
                <div class="chat-toggle-content">
                    <div class="chat-icon">🎯</div>
                    <div class="chat-label">AI Assistant</div>
                    <div class="chat-subtitle">Professional Support</div>
                </div>
            </button>
        `;
        document.body.appendChild(chatbot);
    }

    setupEventListeners() {
        const input = document.getElementById('floatingChatInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    addWelcomeMessage() {
        if (this.messages.length === 0) {
            this.addMessage('ai', 'Welcome to HAECO Professional AI Assistant ✈️\n\nI provide intelligent support for:\n\n🏢 **Bay Management**\n• Real-time status monitoring\n• Assignment optimization\n• Dependency analysis\n\n📊 **Operations Intelligence**\n• Performance analytics\n• Predictive insights\n• Cost optimization\n\n🎯 **Professional Services**\n• System navigation\n• Quick actions\n• Expert recommendations\n\nHow may I assist you today?');
            this.showSuggestions();
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('floatingChatWindow');
        if (window) {
            window.classList.toggle('open', this.isOpen);
            if (this.isOpen) {
                this.renderMessages();
                this.showSuggestions();
                document.getElementById('floatingChatInput')?.focus();
            }
        }
    }

    addMessage(sender, content, timestamp = null) {
        const message = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            sender: sender,
            content: content,
            timestamp: timestamp || new Date().toISOString()
        };

        this.messages.push(message);
        this.saveMessages();
        if (this.isOpen) {
            this.renderMessages();
        }
        return message;
    }

    renderMessages() {
        const container = document.getElementById('floatingChatMessages');
        if (!container) return;

        container.innerHTML = '';

        this.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `chat-message ${message.sender}`;
            
            const time = new Date(message.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            messageElement.innerHTML = `
                <div class="message-bubble">
                    <div class="message-content">${this.formatMessage(message.content)}</div>
                    <div class="message-time" style="font-size: 11px; opacity: 0.7; margin-top: 5px;">${time}</div>
                </div>
            `;

            container.appendChild(messageElement);
        });

        container.scrollTop = container.scrollHeight;
    }

    formatMessage(content) {
        content = content.replace(/\n/g, '<br>');
        content = content.replace(/^• (.+)$/gm, '<div style="margin-left: 15px;">• $1</div>');
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        return content;
    }

    sendMessage() {
        const input = document.getElementById('floatingChatInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';
        
        // Hide suggestions after sending
        const suggestions = document.getElementById('floatingChatSuggestions');
        if (suggestions) suggestions.innerHTML = '';
        
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.processAIResponse(message);
            this.addMessage('ai', response);
            // Show new suggestions after response
            setTimeout(() => this.showSuggestions(), 500);
        }, 1000 + Math.random() * 1000);
    }

    processAIResponse(query) {
        try {
            // Check for action commands first
            const action = this.checkForActions(query);
            if (action) {
                return action;
            }
            
            if (window.aiEngine) {
                return window.aiEngine.processQuery(query);
            } else {
                return this.getBasicResponse(query);
            }
        } catch (error) {
            return "I'm sorry, I encountered an error. Please try again.";
        }
    }

    checkForActions(query) {
        const lowerQuery = query.toLowerCase();
        
        // Navigation actions
        if (lowerQuery.includes('go to') || lowerQuery.includes('navigate to') || lowerQuery.includes('open')) {
            if (lowerQuery.includes('dashboard')) {
                setTimeout(() => window.location.href = this.getRelativePath() + 'pages/dashboard/index.html', 1500);
                return 'Navigating to Dashboard...';
            }
            if (lowerQuery.includes('schedule')) {
                setTimeout(() => window.location.href = this.getRelativePath() + 'pages/schedule/index.html', 1500);
                return 'Opening Schedule page...';
            }
            if (lowerQuery.includes('bay') && (lowerQuery.includes('status') || lowerQuery.includes('management'))) {
                setTimeout(() => window.location.href = this.getRelativePath() + 'pages/bays/index.html', 1500);
                return 'Opening Bay Status page...';
            }
            if (lowerQuery.includes('analytics') || lowerQuery.includes('reports')) {
                setTimeout(() => window.location.href = this.getRelativePath() + 'pages/analytics/index.html', 1500);
                return 'Opening Analytics page...';
            }
            if (lowerQuery.includes('admin')) {
                setTimeout(() => window.location.href = this.getRelativePath() + 'pages/admin/index.html', 1500);
                return 'Opening Admin page...';
            }
        }
        
        // Quick actions
        if (lowerQuery.includes('add aircraft')) {
            setTimeout(() => {
                window.location.href = this.getRelativePath() + 'pages/schedule/index.html';
                setTimeout(() => {
                    if (window.showAddAircraftModal) window.showAddAircraftModal();
                }, 1000);
            }, 1500);
            return 'Opening Add Aircraft form...';
        }
        
        if (lowerQuery.includes('optimize') || lowerQuery.includes('recommend assignments')) {
            if (window.aiEngine && window.aiEngine.optimizeAllAssignments) {
                const result = window.aiEngine.optimizeAllAssignments();
                return `AI Optimization Complete:\n\n${result.summary}\n\nRecommendations: ${result.recommendations.length} assignments suggested.`;
            }
            return 'AI optimization is not available right now. Please try from the Schedule page.';
        }
        
        return null;
    }
    
    getRelativePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return '../../';
        }
        return './';
    }

    getBasicResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('time') || lowerQuery.includes('date')) {
            return `Current time: ${new Date().toLocaleString()}`;
        }
        
        if (lowerQuery.includes('bay') && lowerQuery.includes('available')) {
            const stats = window.haecoCore?.getStatistics();
            if (stats) {
                const availableBays = this.getAvailableBaysList();
                return `There are ${stats.availableBays} available bays out of ${stats.totalBays} total bays.\n\nAvailable bays: ${availableBays}`;
            }
            return 'Unable to get bay information.';
        }
        
        if (lowerQuery.includes('statistics') || lowerQuery.includes('stats')) {
            const stats = window.haecoCore?.getStatistics();
            if (stats) {
                return `**System Statistics:**\n\n• Total Bays: ${stats.totalBays}\n• Occupied: ${stats.occupiedBays}\n• Available: ${stats.availableBays}\n• Aircraft in System: ${stats.totalAircraft}\n• Efficiency: ${stats.efficiency}%`;
            }
            return 'Unable to get system statistics.';
        }
        
        if (lowerQuery.includes('aircraft') && (lowerQuery.includes('count') || lowerQuery.includes('how many'))) {
            const stats = window.haecoCore?.getStatistics();
            return stats ? `There are currently ${stats.totalAircraft} aircraft in the system.` : 'Unable to get aircraft information.';
        }
        
        if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
            return '🚀 **HAECO AI Assistant Capabilities:**\n\n🏢 **Bay Management**\n• Check bay status and availability\n• View assignments and schedules\n• Get dependency information\n\n✈️ **Aircraft Operations**\n• Add new aircraft to system\n• Optimize bay assignments\n• Track aircraft movements\n\n📊 **System Intelligence**\n• Real-time statistics\n• Performance analytics\n• Predictive insights\n\n🧭 **Smart Navigation**\n• Quick page switching\n• Contextual suggestions\n• Voice-like commands\n\n💡 **Try saying:**\n• "Show available bays"\n• "Go to schedule page"\n• "What\'s the current efficiency?"\n• "Optimize all assignments"';
        }
        
        // Smart contextual responses
        if (lowerQuery.includes('bay') || lowerQuery.includes('aircraft') || lowerQuery.includes('schedule')) {
            return '🤖 I\'m here to help with your bay management needs! \n\n💡 **Quick suggestions:**\n• "Show bay status" - Get current bay availability\n• "System statistics" - View performance metrics\n• "Go to [page]" - Navigate anywhere\n• "Help" - See all my capabilities\n\nWhat specific information do you need?';
        }
        
        return '😊 I\'m your intelligent HAECO assistant! I can help with bay management, aircraft scheduling, system navigation, and much more.\n\n🗣️ **Try asking:**\n• "What can you do?"\n• "Show statistics"\n• "Go to dashboard"\n• "Available bays"\n\nI\'m designed to understand natural language, so feel free to ask me anything!';
    }
    
    getAvailableBaysList() {
        if (!window.haecoCore?.bays) return 'N/A';
        
        const availableBays = Object.keys(window.haecoCore.bays)
            .filter(bayId => !window.haecoCore.bays[bayId].occupied)
            .sort();
            
        return availableBays.length > 0 ? availableBays.join(', ') : 'None';
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const container = document.getElementById('floatingChatMessages');
        
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message ai typing-indicator';
        typingElement.innerHTML = `
            <div class="message-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        container.appendChild(typingElement);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showSuggestions() {
        const container = document.getElementById('floatingChatSuggestions');
        if (!container) return;

        const suggestions = this.getSuggestions();
        
        container.innerHTML = `
            <div class="suggestion-chips">
                ${suggestions.map(suggestion => 
                    `<button class="suggestion-chip" onclick="floatingChat.sendSuggestion('${suggestion}')">${suggestion}</button>`
                ).join('')}
            </div>
        `;
    }

    toggleHistory() {
        const historyContainer = document.getElementById('floatingChatHistory');
        const messagesContainer = document.getElementById('floatingChatMessages');
        
        if (historyContainer.style.display === 'none') {
            this.renderChatHistory();
            historyContainer.style.display = 'block';
            messagesContainer.style.display = 'none';
        } else {
            historyContainer.style.display = 'none';
            messagesContainer.style.display = 'block';
        }
    }

    renderChatHistory() {
        const container = document.getElementById('floatingChatHistory');
        if (!container) return;

        if (this.chatHistory.length === 0) {
            container.innerHTML = '<div class="no-history">No previous conversations</div>';
            return;
        }

        let html = '<div class="floating-history-header"><h4>Recent Conversations</h4></div><div class="floating-history-list">';
        
        this.chatHistory.slice(0, 10).forEach(chat => {
            const date = new Date(chat.timestamp).toLocaleDateString();
            const time = new Date(chat.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            html += `
                <div class="floating-history-item" onclick="floatingChat.loadChatFromHistory('${chat.id}')">
                    <div class="history-title">${chat.title}</div>
                    <div class="history-meta">${date} ${time} • ${chat.messageCount} msgs</div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    loadChatFromHistory(sessionId) {
        const chatSession = this.chatHistory.find(chat => chat.id === sessionId);
        if (chatSession) {
            this.saveChatToHistory();
            this.currentSessionId = sessionId;
            this.messages = [...chatSession.messages];
            this.toggleHistory(); // Hide history, show messages
            this.renderMessages();
        }
    }

    getSuggestions() {
        const currentPage = window.location.pathname;
        const stats = window.haecoCore?.getStatistics();
        
        const professionalSuggestions = [
            'System Status Overview',
            'Bay Availability Report',
            'Optimization Recommendations',
            'Current Operations Summary'
        ];
        
        const contextSuggestions = [];
        
        if (currentPage.includes('dashboard')) {
            contextSuggestions.push('Navigate to Schedule', 'View Analytics Dashboard');
        } else if (currentPage.includes('schedule')) {
            contextSuggestions.push('Optimize All Assignments', 'Bay Status Check');
        } else if (currentPage.includes('bays')) {
            contextSuggestions.push('Dependency Analysis', 'Utilization Metrics');
        } else if (currentPage.includes('analytics')) {
            contextSuggestions.push('Performance Insights', 'Efficiency Analysis');
        } else {
            contextSuggestions.push('System Navigation', 'Quick Status Check');
        }
        
        const allSuggestions = [...professionalSuggestions, ...contextSuggestions];
        return allSuggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    sendSuggestion(suggestion) {
        const input = document.getElementById('floatingChatInput');
        if (input) {
            input.value = suggestion;
            this.sendMessage();
        }
    }
}

// Initialize floating chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not on login page
    if (!document.body.classList.contains('login-page')) {
        window.floatingChat = new FloatingChatbot();
    }
});