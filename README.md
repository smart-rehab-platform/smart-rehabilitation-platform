# Smart Rehabilitation Platform

A comprehensive, AI-assisted rehabilitation management platform designed to connect **patients and families, rehabilitation specialists, and administrators** within one integrated digital ecosystem.

Developed as a graduation project, the Smart Rehabilitation Platform combines **web and mobile applications, rehabilitation workflow management, speech analysis, AI-assisted clinical support, real-time communication, multilingual content, reporting, and notification services** to support continuous and structured rehabilitation care.

---

## Overview

Rehabilitation is a continuous process that extends beyond scheduled clinical sessions.

Families need clear guidance about exercises, appointments, and progress. Specialists need structured tools for managing treatment plans, reviewing patient activity, evaluating progress, and communicating with families. Administrators need visibility into users, cases, sessions, and operational workflows.

The **Smart Rehabilitation Platform** was developed to bring these processes together into a single system.

The platform provides dedicated experiences for three primary roles:

- **Parents** — follow their children's rehabilitation journey, complete assigned activities, communicate with specialists, manage sessions, receive notifications, and access reports and progress information.
- **Specialists** — manage patients, treatment plans, goals, exercises, submissions, sessions, reports, speech analyses, recommendations, and family communication.
- **Administrators** — manage platform users, patients, case intake workflows, specialist assignments, exercises, sessions, support requests, and platform operations.

The system is accessible through both a **React web application** and a **Flutter mobile application**, supported by a shared backend and database infrastructure.

---

## Motivation

The Smart Rehabilitation Platform was inspired by a challenge that becomes especially critical during periods of war, conflict, and large-scale emergencies: maintaining continuity of care for patients who require ongoing rehabilitation.

During such circumstances, healthcare systems must understandably prioritize emergency and life-threatening cases. As resources, facilities, and medical personnel become increasingly focused on urgent care, patients who depend on continuous rehabilitation may experience interruptions in follow-up, reduced access to specialists, and difficulty maintaining their treatment activities.

For rehabilitation patients, however, continuity matters. Progress often depends on repeated exercises, regular specialist evaluation, family involvement, and consistent monitoring over time. Extended interruptions can make this process considerably more difficult.

The Smart Rehabilitation Platform was therefore designed to provide a digital bridge between rehabilitation specialists and families when regular access to rehabilitation services becomes difficult.

Through remote exercise assignment and follow-up, treatment-plan monitoring, patient submissions, specialist feedback, messaging, session coordination, progress tracking, reports, notifications, and intelligent speech-analysis tools, the platform enables important parts of the rehabilitation journey to continue beyond the boundaries of a rehabilitation center.

While the platform is designed for everyday rehabilitation management, its underlying motivation is particularly relevant in situations where traditional access to continuous care is disrupted.

Our goal is not to replace rehabilitation specialists or in-person clinical care, but to help preserve the connection between specialists, patients, and families when maintaining that connection becomes difficult.

---

## Project Goals

The platform was designed around several key objectives:

- Centralize rehabilitation information and workflows
- Improve communication between families and specialists
- Support continuous patient follow-up outside clinical sessions
- Provide structured treatment-plan and goal management
- Digitize exercise assignment and submission workflows
- Provide objective speech-analysis information
- Assist specialists with AI-generated recommendations and reports
- Deliver timely reminders and notifications
- Support Arabic and English users
- Provide both web and mobile access
- Maintain clear role-based access to platform functionality

---

## Core Features

### Patient & Case Management

The platform maintains structured patient records and rehabilitation relationships.

Capabilities include:

- Patient profiles
- Guardian relationships
- Specialist assignments
- Medical information
- Diagnoses
- Specialist notes
- Case history
- Case intake requests
- Specialist matching
- Case acceptance and rejection workflows

This provides a structured path from initial case intake to active rehabilitation follow-up.

---

### Treatment Plans & Goals

Specialists can create and maintain structured rehabilitation plans for their patients.

The platform supports:

- Treatment-plan creation
- Plan updates and revisions
- Active and archived plans
- Goal creation
- Short- and long-term rehabilitation goals
- Goal progress updates
- Goal achievement tracking
- Historical progress information

This allows rehabilitation objectives to remain connected to ongoing patient activity.

---

### Exercise Management

The platform includes a centralized rehabilitation exercise library.

Specialists can:

- Browse rehabilitation exercises
- View exercise details and instructions
- Assign exercises to patients
- Configure assignment frequency
- Select assignment start dates
- Track assigned exercises
- Review patient submissions
- Mark submissions as completed
- Request another attempt when necessary
- Provide ratings and feedback

Parents can view assigned activities and follow the exercises associated with their children's rehabilitation plans.

---

## Speech Analysis

Speech analysis is one of the platform's major intelligent rehabilitation capabilities.

For supported speech exercises, specialists can analyze patient audio submissions and review structured speech information.

The analysis workflow includes:

- Speech transcription
- Expected vs. spoken comparison
- Word-level accuracy
- Word error details
- Word and segment timestamps
- Timing measurements
- Fluency-related metrics
- Analysis quality assessment
- Phoneme-level analysis
- Acoustic measurements
- Historical speech-analysis results
- Progress insights across analyses

### Speech Processing Architecture

Speech transcription is handled through a separately deployed **Faster-Whisper** Python service.

Additional speech-processing stages are coordinated through the backend, keeping computational processing separated from the web and mobile clients.

```text
Patient Audio Submission
          │
          ▼
Smart Rehabilitation Backend
          │
          ▼
Faster-Whisper Service
          │
          ▼
Speech Transcription + Word Timings
          │
          ▼
Speech Analysis Pipeline
          │
          ├── Expected vs. Spoken Comparison
          ├── Word Accuracy
          ├── Timing & Fluency Metrics
          ├── Quality Assessment
          ├── Phoneme Analysis
          └── Acoustic Analysis
          │
          ▼
Structured Analysis Results
          │
          ▼
Specialist Web / Mobile Interface
```

The architecture allows speech-processing services to evolve independently from the client applications.

---

## AI-Assisted Rehabilitation

The platform integrates AI-assisted capabilities into specialist-controlled rehabilitation workflows.

### AI Recommendations

The system can generate rehabilitation recommendations based on relevant patient information and progress data.

Specialists remain responsible for reviewing recommendations before assigning them within the rehabilitation workflow.

### AI Reports

The platform supports AI-assisted generation of structured rehabilitation reports, including:

- Weekly reports
- Monthly reports
- Patient progress summaries
- Structured rehabilitation insights

Generated reports can be reviewed and edited by specialists before final approval.

The platform also supports traditional manual reports for cases where specialists prefer to create documentation directly.

AI functionality is designed to **assist professional decision-making**, while keeping specialists in control of rehabilitation decisions.

---

## Reports & Progress Monitoring

The reporting system brings together rehabilitation information from across the platform.

Supported report workflows include:

- Manual reports
- Weekly reports
- Monthly reports
- Assessment reports
- Progress reports
- AI-generated reports
- Editable AI report drafts
- Report detail views
- PDF report workflows

Progress information can incorporate data from treatment goals, exercises, submissions, speech analyses, and other rehabilitation activities.

---

## Sessions & Scheduling

The platform supports structured rehabilitation session management.

Capabilities include:

- Session creation
- Session scheduling
- Session updates
- Session status management
- Upcoming session views
- Parent session requests
- Specialist approval or rejection of session requests
- Calendar-based session presentation
- Session reminders

Parents and specialists receive role-appropriate views of scheduled rehabilitation activity.

---

## Messaging & Communication

Integrated messaging enables direct communication between parents and specialists without separating conversations from the rehabilitation platform.

Communication features include:

- Conversation lists
- Individual chat threads
- Message history
- Attachments
- Read receipts
- Unread message indicators
- Presence information
- User profile information
- Notification integration

Real-time communication functionality is supported through **Socket.IO**.

---

## Notifications

The platform includes an event-driven notification system for important rehabilitation activity.

Notifications can be generated for events such as:

- Exercise assignments
- Exercise reminders
- Session reminders
- Session-related updates
- New messages
- Submission and review activity
- Relevant rehabilitation workflow updates

Push notifications are delivered through **Firebase Cloud Messaging (FCM)**.

Device tokens are registered with the backend and associated with authenticated platform users, enabling notification delivery to supported web and mobile clients.

---

## Multilingual Support

The Smart Rehabilitation Platform supports:

- **English**
- **Arabic**

Both web and mobile applications include localized user interfaces with support for Arabic RTL presentation.

### Dynamic Exercise Translation

Exercise library content can also be dynamically presented in Arabic using **Microsoft Azure Translator**.

Display-oriented fields can be translated, including:

- Exercise title
- Description
- Instructions

Speech-specific targets remain unchanged when their original language is required for the rehabilitation exercise.

Translation is handled through the backend, providing a shared translation layer for both web and mobile clients.

Caching is used to reduce unnecessary translation requests.

---

## Role-Based Experiences

### Parent

Parents can:

- Access a child-focused dashboard
- Switch between linked children
- View today's rehabilitation activities
- Follow treatment progress
- View the treatment journey
- Access assigned exercises
- Track exercise submissions
- View upcoming sessions
- Request specialist sessions
- Communicate with specialists
- Receive notifications and reminders
- Access rehabilitation reports
- Submit feedback
- Submit and track complaints
- Manage profile information

### Specialist

Specialists can:

- Access a specialist dashboard
- Manage active patients
- Review patient details
- Manage treatment plans
- Create and update goals
- Monitor goal progress
- Browse the exercise library
- Assign exercises
- Review patient submissions
- Provide feedback and ratings
- Manage sessions
- Handle parent session requests
- Communicate with families
- Create manual reports
- Generate AI-assisted reports
- Edit AI report drafts
- Review AI recommendations
- Assign recommendations
- Run and review speech analyses
- Monitor speech progress
- Receive notifications
- Manage profile information

### Administrator

Administrators can:

- Monitor platform activity
- Manage users
- Activate and deactivate accounts
- Manage patients
- Review case intake requests
- Match cases with specialists
- Assign rehabilitation cases
- Manage the exercise library
- Monitor sessions
- Handle support requests
- Review administrative information
- Access platform oversight tools

---

## Complaints, Feedback & Support

The platform includes dedicated workflows for communication beyond direct rehabilitation messaging.

### Parent Feedback & Complaints

Parents can:

- Submit feedback
- Provide ratings
- Create complaints
- Review complaint details
- Follow complaint status

### Specialist Support

Specialists can:

- Create support requests
- View request history
- Exchange messages within support requests
- Follow request status

Administrators can review and manage these requests through the administrative interface.

---

# System Architecture

The Smart Rehabilitation Platform uses a multi-client, service-oriented architecture.

```text
                 ┌────────────────────────────┐
                 │        End Users           │
                 │ Parent | Specialist | Admin│
                 └─────────────┬──────────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │   React Web App  │      │ Flutter Mobile   │
        │      Vite        │      │      App         │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
                 └────────────┬────────────┘
                              │
                         HTTPS / REST
                              │
                              ▼
                 ┌─────────────────────────┐
                 │   Node.js / Express     │
                 │       Backend API       │
                 └────────────┬────────────┘
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
          ▼                   ▼                    ▼
 ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
 │   PostgreSQL    │  │ Faster-Whisper  │  │ External Cloud  │
 │    Database     │  │ Python Service  │  │    Services     │
 └─────────────────┘  └─────────────────┘  └────────┬────────┘
                                                     │
                              ┌──────────────────────┼─────────────┐
                              │                      │             │
                              ▼                      ▼             ▼
                         AI Services          Azure Translator   Firebase
                                                                 Cloud
                                                                Messaging
```

The backend acts as the central orchestration layer and exposes shared functionality to both client applications.

---

# Technology Stack

## Web Application

- **React**
- **Vite**
- **JavaScript**
- CSS
- REST API integration
- Role-based routing
- Responsive dashboard interfaces
- Arabic / English localization
- Browser push notifications

## Mobile Application

- **Flutter**
- **Dart**
- Material-based UI
- REST API integration
- Firebase Cloud Messaging
- Local notifications
- Arabic / English localization
- RTL support
- Environment-based backend configuration

## Backend

- **Node.js**
- **Express.js**
- RESTful API architecture
- JWT-based authentication
- Refresh-token handling
- Joi validation
- Multer media uploads
- Socket.IO
- Firebase Admin SDK
- Scheduled background jobs

## Database

- **PostgreSQL**

The relational data model covers major platform domains including:

- Users and profiles
- Patients
- Guardians and specialists
- Diagnoses and medical information
- Case intake
- Treatment plans
- Goals and progress
- Exercises
- Assignments and submissions
- Sessions
- Reports
- Speech analyses
- Conversations and messages
- Notifications
- Feedback and complaints
- Support requests
- AI-related data
- Audit information

## Speech Processing

- **Python**
- **FastAPI**
- **Uvicorn**
- **Faster-Whisper**
- Word-level timestamp processing
- Forced phoneme-alignment workflow
- Acoustic-analysis workflow

## Cloud & External Services

- **Firebase Cloud Messaging** — web and mobile push notifications
- **Microsoft Azure Translator** — dynamic exercise translation
- **AI provider integration** — AI recommendations and reports
- Email services — verification and password-recovery workflows

## Infrastructure & Deployment

- **Docker** — local database and supporting development infrastructure
- **Vercel** — web application deployment
- **Railway** — backend, PostgreSQL, and speech-service deployment
- **Git / GitHub** — source control and repository management

---

# Repository Structure

```text
smart-rehabilitation-platform/
│
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
│
├── database/
│   ├── migrations/
│   ├── schema.sql
│   └── seed.sql
│
├── frontend_web/
│   ├── public/
│   ├── scripts/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── mobile_app/
│   ├── android/
│   ├── assets/
│   ├── lib/
│   │   ├── core/
│   │   └── features/
│   ├── test/
│   └── pubspec.yaml
│
├── python_services/
│   └── faster_whisper_api/
│       ├── app.py
│       └── requirements.txt
│
└── README.md
```

Each major application component can be developed and configured independently while communicating through shared platform APIs.

---

# API Overview

The backend exposes versioned REST APIs covering the platform's major domains.

```text
/api/v1/auth
/api/v1/users
/api/v1/patients
/api/v1/plans
/api/v1/goals
/api/v1/exercises
/api/v1/sessions
/api/v1/reports
/api/v1/speech-analyses
/api/v1/conversations
/api/v1/notifications
/api/v1/translations
```

Additional endpoints support:

- Exercise submissions and reviews
- Session requests
- Case intake
- AI recommendations
- AI reports
- Complaints
- Feedback
- Specialist support
- Device-token registration
- Dashboard information

Refer to the backend source for the complete route definitions and request contracts.

---

# Authentication & Authorization

The platform uses authenticated and role-aware access across its clients.

Authentication functionality includes:

- Registration
- Login
- Email verification
- JWT access tokens
- Refresh tokens
- Logout
- Password recovery
- Password reset
- Authenticated API requests

Platform roles include:

```text
Parent
Specialist
Administrator
```

Role-specific interfaces improve usability, while sensitive authorization decisions are enforced by the backend API.

---

# Getting Started

## Prerequisites

A local development environment requires:

- Node.js
- npm
- PostgreSQL
- Docker
- Flutter SDK
- Dart SDK
- Python
- Git

Some platform features additionally require configuration for external services such as Firebase, AI services, translation, and email delivery.

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-rehabilitation-platform
```

---

## 2. Database Setup

The project uses PostgreSQL.

Database resources are located under:

```text
database/
```

The database setup consists of the base schema and subsequent migrations required by newer platform features.

Configure the backend database connection using the appropriate environment variables.

---

## 3. Backend Setup

Navigate to:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables and start the backend:

```bash
npm start
```

During local development, the API is typically available at:

```text
http://localhost:5000
```

---

## 4. Web Application Setup

Navigate to:

```bash
cd frontend_web
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite application is typically available at:

```text
http://localhost:5173
```

Refer to `frontend_web/README.md` for web-specific configuration and setup.

---

## 5. Mobile Application Setup

Navigate to:

```bash
cd mobile_app
```

Install dependencies:

```bash
flutter pub get
```

Run the application:

```bash
flutter run
```

A deployed backend can be selected using:

```bash
flutter run --dart-define=API_SERVER_ORIGIN=https://your-backend.example.com
```

Refer to `mobile_app/README.md` for complete Flutter setup and configuration.

---

## 6. Speech Service Setup

Navigate to:

```bash
cd python_services/faster_whisper_api
```

Create or activate the Python virtual environment and install the required packages:

```bash
pip install -r requirements.txt
```

Start the service:

```bash
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Verify the service through:

```text
GET /health
```

The backend connects to this service through its configured Faster-Whisper API URL.

---

# Environment Configuration

Configuration is separated by application component.

Typical backend configuration includes:

```text
Database configuration
JWT configuration
Frontend origin / CORS configuration
Cookie configuration
AI provider configuration
Firebase Admin configuration
Translation service configuration
Email configuration
Speech-service configuration
Application timezone
```

The web application uses frontend environment configuration for items such as:

```text
API URL
Firebase Web configuration
Firebase VAPID configuration
```

The Flutter application supports compile-time backend selection through:

```text
API_SERVER_ORIGIN
```

This configuration model allows development and deployed environments to use the same application codebase.

---

# Testing

The project includes focused tests across multiple components.

## Backend

Backend tests and focused validation scripts are maintained within the backend project.

## Web

Create a production build with:

```bash
npm run build
```

Additional focused tests are maintained alongside web features and utilities.

## Flutter

Run the mobile test suite:

```bash
flutter test
```

Run static analysis:

```bash
flutter analyze
```

The project uses focused regression tests for selected workflows and utilities to help protect behavior as features evolve.

---

# Deployment

The platform components are independently deployable.

The current deployment architecture uses:

```text
React Web Application
        │
        │ Vercel
        ▼
      Internet
        │
        ▼
Node.js / Express Backend
        │
        │ Railway
        ├────────────── PostgreSQL
        │
        ├────────────── Faster-Whisper Service
        │
        ├────────────── Firebase Cloud Messaging
        │
        ├────────────── Microsoft Azure Translator
        │
        └────────────── AI Services
```

Separating the applications and services provides clearer deployment boundaries and allows computational services such as speech transcription to operate independently from the primary API.

---

# Security

Security considerations are incorporated across the platform architecture.

The system includes:

- JWT-based authentication
- Refresh-token management
- Role-based authorization
- Protected API routes
- Backend-side input validation
- Email verification
- Password-recovery workflows
- Environment-based service configuration
- Backend-managed external service credentials
- Controlled media-upload handling
- Secure production cookie configuration
- CORS configuration for approved frontend origins

Sensitive operations and access-control decisions are handled by the backend rather than relying on client-side interface restrictions.

---

# Design & Accessibility

The web and mobile applications share a consistent visual identity while adapting interactions to each platform.

Design considerations include:

- Clear rehabilitation-focused information hierarchy
- Role-specific navigation
- Responsive interfaces
- Reusable UI patterns
- Parent-friendly daily activity presentation
- Efficient specialist workflows
- Arabic RTL support
- English LTR support
- Consistent feedback and status presentation

The goal is to make complex rehabilitation information accessible without overwhelming users.

---

# Project Highlights

The Smart Rehabilitation Platform demonstrates the integration of multiple software engineering areas within one production-oriented system:

- Full-stack web development
- Cross-platform mobile development
- REST API design
- Relational database design
- Authentication and authorization
- Real-time communication
- Push notifications
- AI-assisted workflows
- Speech recognition
- Word-level speech analysis
- Phoneme and acoustic analysis
- Dynamic multilingual content
- PDF reporting
- Media handling
- Scheduled background jobs
- Cloud deployment
- Multi-role UX design

Rather than implementing these technologies as isolated demonstrations, the platform integrates them into end-to-end rehabilitation workflows shared across web and mobile applications.

---

# Future Enhancements

Potential future development directions include:

- Expanded rehabilitation specialties and exercise libraries
- Additional speech and language models
- Broader multilingual speech-analysis support
- Advanced longitudinal progress analytics
- Enhanced specialist decision-support tools
- Expanded accessibility features
- Additional administrative analytics
- More advanced media-processing capabilities
- Dedicated persistent cloud media storage
- Extended automated testing and monitoring

---

# Project Context

The **Smart Rehabilitation Platform** was developed as a graduation project exploring how software engineering, artificial intelligence, speech-processing technologies, and modern web and mobile development can be combined to support continuity of rehabilitation care.

The project's motivation is especially relevant in environments affected by **war, conflict, emergencies, or other disruptions to regular healthcare access**, where rehabilitation patients may face difficulties maintaining consistent follow-up while healthcare resources are concentrated on urgent and life-threatening cases.

The project focuses on building a connected rehabilitation ecosystem rather than an isolated application.

Its architecture demonstrates the integration of:

- Multiple user roles
- Multiple client platforms
- Shared backend services
- Structured rehabilitation data
- AI-assisted functionality
- Speech-processing services
- Real-time communication
- External cloud services
- Production deployment infrastructure

---

# Contributors

Developed as part of the **Smart Rehabilitation Platform Graduation Project**.

**Development Team**

- Suha Abu Ridi
- Bana Aloul

---

# License

This project was developed for academic and portfolio purposes as part of a graduation project.

All rights reserved by the project authors.