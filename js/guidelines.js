// Guidelines System for HAECO V6
class GuidelinesManager {
    constructor() {
        this.guidelines = this.loadGuidelines();
        this.init();
    }

    init() {
        this.addGuidelinesButton();
    }

    loadGuidelines() {
        return {
            bayAssignment: {
                title: "Bay Assignment Guidelines",
                content: `
                <h4>Bay Types & Usage:</h4>
                <ul>
                    <li><strong>Paint Bays (1,3,7,8):</strong> Paint work only</li>
                    <li><strong>In Bays (1,2,3,4,6,7,8):</strong> General maintenance & inspections</li>
                    <li><strong>Outside Bays (A,B,J,C,D,E,F,G,H,K,L,N,P,Q,R):</strong> Storage & basic work</li>
                    <li><strong>Special Bay (5):</strong> Small aircraft only</li>
                </ul>
                <h4>Assignment Priority:</h4>
                <ol>
                    <li>Urgent priority→ Paint/In bays</li>
                    <li>High priority → Available In/Paint bays</li>
                    <li>Normal/Low priority→ Outside bays or remaining bay</li>
                </ol>
                `
            },
            operations: {
                title: "Operations Guidelines",
                content: `
                <h4>Aircraft Import:</h4>
                <ul>
                    <li>Use CSV template with: registration, type, size, workType, priority, arrivalTime, departureTime</li>
                    <li>DateTime format: YYYY-MM-DDTHH:MM:SS</li>
                    <li>Aircraft ready for auto-assignment after import</li>
                </ul>
                <h4>Towing Operations:</h4>
                <ul>
                    <li>Base time: 15 minutes towing + 45 minutes AA approval</li>
                    <li>Distance factor: +5 minutes per grid unit</li>
                    <li>Check dependencies before movement</li>
                </ul>
                <h4>Best Practices:</h4>
                <ul>
                    <li>Use Auto-Assign for optimal placement</li>
                    <li>Monitor bay timeline for conflicts</li>
                    <li>Export data regularly for backup</li>
                </ul>
                `
            },
            troubleshooting: {
                title: "Troubleshooting Guide",
                content: `
                <h4>Common Issues:</h4>
                <ul>
                    <li><strong>CSV Import Failed:</strong> Check datetime format and required fields</li>
                    <li><strong>Cannot Assign Aircraft:</strong> Verify bay compatibility and availability</li>
                    <li><strong>Dependency Conflicts:</strong> Clear blocking bays first</li>
                </ul>
                <h4>Data Management:</h4>
                <ul>
                    <li>Clear browser cache if performance issues</li>
                    <li>Export data before system reset</li>
                    <li>Use Admin page for system maintenance</li>
                </ul>
                `
            }
        };
    }

    addGuidelinesButton() {
        // Add guidelines button to all pages
        const headers = document.querySelectorAll('.header-actions');
        headers.forEach(header => {
            if (!header.querySelector('.guidelines-btn')) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary guidelines-btn';
                btn.innerHTML = '📖 Guidelines';
                btn.onclick = () => this.showGuidelines();
                header.appendChild(btn);
            }
        });
    }

    showGuidelines() {
        const modal = this.createModal('Guidelines', `
            <div class="guidelines-tabs">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="showGuidelineTab('bayAssignment')">Bay Assignment</button>
                    <button class="tab-btn" onclick="showGuidelineTab('operations')">Operations</button>
                    <button class="tab-btn" onclick="showGuidelineTab('troubleshooting')">Troubleshooting</button>
                </div>
                <div class="tab-content">
                    <div id="tab-bayAssignment" class="tab-panel active">
                        <h3>${this.guidelines.bayAssignment.title}</h3>
                        ${this.guidelines.bayAssignment.content}
                    </div>
                    <div id="tab-operations" class="tab-panel">
                        <h3>${this.guidelines.operations.title}</h3>
                        ${this.guidelines.operations.content}
                    </div>
                    <div id="tab-troubleshooting" class="tab-panel">
                        <h3>${this.guidelines.troubleshooting.title}</h3>
                        ${this.guidelines.troubleshooting.content}
                    </div>
                </div>
            </div>
        `);

        // Add tab functionality
        window.showGuidelineTab = (tabId) => {
            modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            modal.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            modal.querySelector(`[onclick="showGuidelineTab('${tabId}')"]`).classList.add('active');
            modal.querySelector(`#tab-${tabId}`).classList.add('active');
        };
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
                max-width: 800px;
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

    getGuidelineText(topic) {
        return this.guidelines[topic]?.content.replace(/<[^>]*>/g, '') || 'Guidelines not found.';
    }
}

// Initialize guidelines system
window.guidelinesManager = new GuidelinesManager();