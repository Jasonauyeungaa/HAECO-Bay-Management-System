// AI Chat Assistant for HAECO V6
class ChatAssistant {
    constructor() {
        this.currentSessionId = this.generateSessionId();
        this.messages = [];
        this.isTyping = false;
        this.chatHistory = this.loadChatHistory();
        this.init();
    }

    init() {
        this.startNewChat();
        this.renderMessages();
        this.renderChatHistory();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    generateSessionId() {
        return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    loadChatHistory() {
        const stored = localStorage.getItem('haeco_v6_chat_history');
        return stored ? JSON.parse(stored) : [];
    }

    saveChatHistory() {
        // Keep only last 20 chat sessions
        if (this.chatHistory.length > 20) {
            this.chatHistory = this.chatHistory.slice(-20);
        }
        localStorage.setItem('haeco_v6_chat_history', JSON.stringify(this.chatHistory));
    }

    startNewChat() {
        // Save current chat to history if it has messages
        if (this.messages.length > 0) {
            this.saveChatToHistory();
        }
        
        // Start new session
        this.currentSessionId = this.generateSessionId();
        this.messages = [];
        this.renderMessages();
        this.renderChatHistory();
        this.addWelcomeMessage();
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
        
        // Remove existing session with same ID
        this.chatHistory = this.chatHistory.filter(chat => chat.id !== this.currentSessionId);
        
        // Add to beginning of history
        this.chatHistory.unshift(chatSession);
        this.saveChatHistory();
    }

    generateChatTitle() {
        const userMessages = this.messages.filter(m => m.sender === 'user');
        if (userMessages.length > 0) {
            const firstMessage = userMessages[0].content;
            return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        }
        return 'New Chat Session';
    }

    loadChatFromHistory(sessionId) {
        const chatSession = this.chatHistory.find(chat => chat.id === sessionId);
        if (chatSession) {
            // Save current chat first
            this.saveChatToHistory();
            
            // Load selected chat
            this.currentSessionId = sessionId;
            this.messages = [...chatSession.messages];
            this.renderMessages();
            this.renderChatHistory();
        }
    }

    saveMessages() {
        // Auto-save current session to history periodically
        this.saveChatToHistory();
    }

    addWelcomeMessage() {
        if (this.messages.length === 0) {
            this.addMessage('ai', 'Hello! I\'m your HAECO Bay Management AI Assistant. I can help you with:\n\n• Bay status and availability\n• Aircraft assignments and recommendations\n• System statistics and reports\n• Current time and date\n• Optimization suggestions\n\nWhat would you like to know?');
            this.renderSuggestions();
        }
    }

    addMessage(sender, content, timestamp = null) {
        const message = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            sender: sender, // 'user' or 'ai'
            content: content,
            timestamp: timestamp || new Date().toISOString()
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        return message;
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
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

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        // Update suggestions after rendering
        this.renderSuggestions();
    }

    formatMessage(content) {
        // Convert line breaks to HTML
        content = content.replace(/\n/g, '<br>');
        
        // Format bullet points
        content = content.replace(/^• (.+)$/gm, '<div style="margin-left: 15px;">• $1</div>');
        
        // Format bold text
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        return content;
    }

    setupEventListeners() {
        const form = document.getElementById('chatForm');
        const input = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.sendMessage();
            };
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            input.addEventListener('input', () => {
                if (sendButton) {
                    sendButton.disabled = !input.value.trim();
                }
            });
        }

        // Global functions
        window.askQuickQuestion = (question) => this.askQuickQuestion(question);
        window.startNewChat = () => this.startNewChat();
        window.loadChatFromHistory = (sessionId) => this.loadChatFromHistory(sessionId);
        window.deleteChatFromHistory = (sessionId) => this.deleteChatFromHistory(sessionId);
        window.clearAllChatHistory = () => this.clearAllChatHistory();
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();

        // Process AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.processAIResponse(message);
            this.addMessage('ai', response);
        }, 1000 + Math.random() * 1000); // Simulate thinking time
    }

    processAIResponse(query) {
        try {
            return window.aiEngine.processQuery(query);
        } catch (error) {
            return "I'm sorry, I encountered an error processing your request. Please try again or contact support.";
        }
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const container = document.getElementById('chatMessages');
        
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

    askQuickQuestion(question) {
        const input = document.getElementById('chatInput');
        if (input) {
            input.value = question;
            this.sendMessage();
        }
    }

    renderChatHistory() {
        const container = document.getElementById('chatHistory');
        if (!container) return;

        if (this.chatHistory.length === 0) {
            container.innerHTML = '<div class="no-history">No chat history yet</div>';
            return;
        }

        let html = '<div class="chat-history-list">';
        
        this.chatHistory.forEach(chat => {
            const isActive = chat.id === this.currentSessionId;
            const date = new Date(chat.timestamp).toLocaleDateString();
            const time = new Date(chat.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            html += `
                <div class="chat-history-item ${isActive ? 'active' : ''}" onclick="loadChatFromHistory('${chat.id}')">
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-meta">
                        <span class="chat-date">${date} ${time}</span>
                        <span class="chat-count">${chat.messageCount} messages</span>
                        <button class="delete-chat" onclick="event.stopPropagation(); deleteChatFromHistory('${chat.id}')" title="Delete chat">×</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    deleteChatFromHistory(sessionId) {
        if (confirm('Delete this chat session?')) {
            this.chatHistory = this.chatHistory.filter(chat => chat.id !== sessionId);
            this.saveChatHistory();
            this.renderChatHistory();
            
            // If deleting current session, start new chat
            if (sessionId === this.currentSessionId) {
                this.currentSessionId = this.generateSessionId();
                this.messages = [];
                this.renderMessages();
                this.addWelcomeMessage();
            }
        }
    }

    clearAllChatHistory() {
        if (confirm('Clear all chat history? This cannot be undone.')) {
            this.chatHistory = [];
            this.saveChatHistory();
            this.renderChatHistory();
        }
    }

    getSuggestions() {
        const suggestions = [
            'What bays are available?',
            'Show system statistics',
            'What time is it?',
            'Recommend assignments',
            'Show bay dependencies',
            'Current efficiency rate',
            'Aircraft in system',
            'Go to dashboard',
            'Optimize all bays',
            'Show recent activity'
        ];
        
        // Randomize and return 4 suggestions
        return suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    renderSuggestions() {
        const container = document.getElementById('chatSuggestions');
        if (!container) return;

        const suggestions = this.getSuggestions();
        
        container.innerHTML = `
            <div class="suggestion-buttons">
                ${suggestions.map(suggestion => 
                    `<button class="suggestion-btn" onclick="askQuickQuestion('${suggestion}')">${suggestion}</button>`
                ).join('')}
            </div>
        `;
    }

    exportChat() {
        const chatData = {
            currentSession: {
                id: this.currentSessionId,
                messages: this.messages
            },
            chatHistory: this.chatHistory,
            exportedAt: new Date().toISOString(),
            user: window.authSystem?.currentUser?.username || 'unknown'
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `haeco_chat_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatAssistant = new ChatAssistant();
});