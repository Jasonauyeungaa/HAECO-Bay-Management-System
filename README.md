# HAECO Bay Management System V6

## ✈️ Aircraft Movement & Bay Management System (HAECO Hackathon Project)

## 🚀 Overview

A zero-install, browser-based web application (HTML/CSS/JavaScript) developed for the AWS AI Hackathon Hong Kong 2025.
The system automates aircraft bay scheduling, movement planning, and optimization for HAECO’s maintenance base (23 bays).

## ▶️ Demo
Video Demo:

## ▶️ How to Run
	1.	Download this repository (or the /V6 folder).
	2.	Open the folder on your computer.
	3.	Locate index.html.
	4.	Double-click index.html → it will open in your default browser.
	5.	Login with demo credentials (if enabled):
	•	User: demo / demo123
	•	Admin: admin / admin123
	6.	Start exploring the dashboard and scheduling system.

✅ No installation, server, or extra setup required.

## ✨ Key Features
	•	Zero-install Web App → Run directly in any modern browser (Chrome, Firefox, Safari, Edge)
	•	AI-powered Optimization → Amazon Q Developer / Kiro used for bay allocation intelligence
	•	Constraint-based Scheduling → Handles bay dependencies, aircraft types, paint bays, MTE usage
	•	Visualization & Analytics → Interactive dashboard, utilization metrics, cost reports
	•	Export & Data Control → CSV/JSON/XML export, import support for maintenance schedules
	•	AI Assistant (Chatbot) → Natural language queries for bay status, conflicts, and scheduling help

### 🤖 AI Assistant
- **Smart Chatbot**: Natural language processing for bay status, recommendations, and system queries
- **Predictive Analytics**: Forecast optimal schedules and identify potential conflicts
- **Real-time Responses**: Current time, date, bay status, and operational insights
- **Quick Actions**: Pre-configured queries for common operations

### 📊 Analytics & Reporting
- **Real-time Statistics**: Bay utilization, efficiency metrics, and operational KPIs
- **Movement Tracking**: Complete audit trail of all aircraft movements and assignments
- **Cost Analysis**: Towing cost calculations and optimization recommendations
- **Timeline Visualization**: 24-hour utilization charts and 7-day scheduling views

### 🔐 User Management
- **Role-based Access**: Admin and user roles with appropriate permissions
- **Session Management**: Secure login/logout with session persistence
- **User Profiles**: Complete user management with authentication

## 🏗️ Architecture

### Frontend Structure
```
V6/
├── index.html              # Login page
├── css/
│   └── main.css           # Unified UI-style CSS
├── js/
│   ├── auth.js            # Authentication system
│   ├── core.js            # Core data management
│   ├── ai-engine.js       # AI optimization engine
│   ├── dashboard.js       # Dashboard controller
│   ├── schedule.js        # Schedule management
│   ├── bays.js           # Bay management
│   └── chat.js           # AI chat interface
├── pages/
│   ├── dashboard/         # Main dashboard
│   ├── schedule/          # Aircraft scheduling
│   ├── bays/             # Bay status & management
│   ├── analytics/        # Statistics & reports
│   ├── chat/             # AI assistant
│   └── admin/            # User management
├── assets/
│   ├── images/           # Logos and graphics
│   └── icons/            # System icons
└── data/
    ├── logs/             # System logs
    ├── imports/          # CSV import files
    └── exports/          # Data exports
```

### Bay Classifications
- **Paint Bays (1, 3, 7, 8)**: Paint operations and maintenance
- **In Bays (1, 2, 3, 4, 6, 7, 8)**: General maintenance and inspections
- **MTE Bays (A, B, J)**: Mobile Test Equipment, max 2 small aircraft
- **Outer Bays (C, D, E, F, G, H, K, L, N, P, Q, R)**: Storage and basic operations
- **Special Bay (5)**: Small aircraft only, special operations

### Data Management
- **Local Storage**: Primary data persistence using browser localStorage
- **Auto-save**: Automatic data saving every 30 seconds
- **Import/Export**: CSV and JSON support for data portability
- **Audit Logging**: Complete activity tracking with timestamps

## 🎨 Design Philosophy

### Interface
- **Clean Typography**: San Francisco font family with proper hierarchy
- **Consistent Colors**: Blue primary (#007AFF), semantic color system
- **Smooth Animations**: 60fps transitions with cubic-bezier easing
- **Card-based Layout**: Organized information in digestible cards
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### User Experience
- **Intuitive Navigation**: Clear sidebar navigation with visual indicators
- **Progressive Disclosure**: Information revealed as needed
- **Immediate Feedback**: Real-time updates and status indicators
- **Error Prevention**: Validation and confirmation dialogs

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Login with demo credentials: `demo` / `demo123`
3. Explore the dashboard and add aircraft data
4. Use the AI assistant for guidance and recommendations

### Demo Accounts
- **Demo User**: `demo` / `demo123` (Full access)
- **Admin**: `admin` / `admin123` (Administrative access)

### Adding Aircraft Data
1. Navigate to **Schedule** page
2. Click **Add Aircraft** button
3. Fill in aircraft details (registration, type, work type, etc.)
4. Set arrival and departure times
5. Use AI optimizer for bay recommendations

### Importing Data
1. Prepare CSV file with columns: registration, type, size, workType, priority, arrivalTime, departureTime
2. Use **Import CSV** button on Dashboard or Schedule page
3. Review imported data and apply AI recommendations

## 🤖 AI Engine Capabilities

### Intelligence Levels
1. **Basic**: Simple compatibility checking
2. **Standard**: Basic optimization with conflict detection
3. **Advanced**: Dependency analysis and cost optimization
4. **Expert**: Predictive scheduling with future planning
5. **Master**: Strategic optimization with batch processing

### Optimization Factors
- **Work Type Compatibility** (40%): Matching aircraft work to bay capabilities
- **Priority Handling** (30%): Urgent aircraft get premium bays
- **Efficiency** (20%): Minimize movements and maximize utilization
- **Cost Optimization** (10%): Reduce towing and operational costs

### Chat Capabilities
- Bay status queries ("What bays are available?")
- Time and date information ("What time is it?")
- Assignment recommendations ("Recommend assignments")
- System statistics ("Show statistics")
- Predictive insights ("What conflicts might occur?")

## 📊 Analytics Features

### Real-time Metrics
- **Bay Utilization**: Current occupancy and efficiency percentages
- **Aircraft Status**: Scheduled, in-bay, completed counts
- **Movement Costs**: Towing expenses and optimization savings
- **Timeline Analysis**: 24-hour utilization patterns

### Reporting
- **Activity Logs**: Complete audit trail of all operations
- **Performance Metrics**: Efficiency trends and optimization results
- **Cost Analysis**: Movement expenses and cost-saving recommendations
- **Utilization Reports**: Bay usage patterns and capacity planning

## 🔧 Technical Specifications

### Browser Requirements
- **Chrome 90+** (Recommended)
- **Firefox 88+**
- **Safari 14+**
- **Edge 90+**

### Performance
- **Load Time**: < 2 seconds on modern hardware
- **Memory Usage**: < 50MB typical operation
- **Storage**: < 10MB for typical dataset
- **Responsiveness**: 60fps animations, < 100ms interactions

### Data Limits
- **Aircraft**: 1000+ aircraft records
- **Logs**: 1000 recent entries (configurable)
- **Bay History**: 30 days of utilization data
- **Chat History**: 50 recent messages

## 🛠️ Customization

### Settings Configuration
- Auto-save interval (default: 30 seconds)
- Maximum log entries (default: 1000)
- Default towing cost (default: $500)
- AI intelligence level (default: 3)

### Bay Configuration
Bay types and capabilities are defined in `js/core.js` and can be modified for different hangar layouts.

### Styling Customization
All visual styling is centralized in `css/main.css` using CSS custom properties for easy theming.

## 🔒 Security & Privacy

### Data Security
- **Local Storage Only**: No external data transmission
- **Session Management**: Secure login with timeout
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Handling**: Graceful error recovery with user feedback

### Privacy
- **No Tracking**: No analytics or tracking scripts
- **Local Processing**: All AI processing done locally
- **Data Control**: Complete user control over data import/export

## 📞 Support & Troubleshooting

### Common Issues
- **Login Problems**: Clear browser cache and cookies
- **Data Loss**: Use export/import functionality for backups
- **Performance**: Close other browser tabs, restart browser
- **Display Issues**: Ensure browser zoom is at 100%

### Browser Storage
- Clear cache: Use browser developer tools
- Export data: Use Dashboard export function before clearing
- Import data: Use CSV or JSON import after clearing

### AI Assistant Help
Ask the AI assistant for help with:
- "How do I assign an aircraft to a bay?"
- "What are the bay types and their capabilities?"
- "How does the optimization algorithm work?"
- "Show me system statistics"

## 🆕 Version 6.0 Features

### New in V6
- **Complete Rewrite**: Standalone system independent of previous versions
- **UI Design**: Modern, clean interface with smooth animations
- **Enhanced AI**: 5-level intelligence system with predictive capabilities
- **Real-time Updates**: Live data synchronization across all pages
- **Dependency Visualization**: Interactive bay relationship mapping
- **Advanced Analytics**: Comprehensive reporting and trend analysis
- **Smart Chat**: Intelligent AI assistant with natural language processing
- **Mobile Support**: Responsive design for all device types

### Improvements
- **Performance**: 3x faster loading and smoother interactions
- **Reliability**: Robust error handling and data validation
- **Usability**: Intuitive interface with contextual help
- **Scalability**: Support for larger datasets and more complex operations

---

**HAECO Bay Management System V6** - Professional, efficient, and intelligent aircraft bay management.

For technical support or feature requests, use the AI assistant or contact your system administrator.

### 👥 Credits

Developed by Jason Au-Yeung Wai Chun and HAECO team during the AWS AI Hackathon Hong Kong 2025.
