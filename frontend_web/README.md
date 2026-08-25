# Smart Rehabilitation Platform — Web Application

A modern, role-based web application for managing and monitoring rehabilitation care, built as part of the **Smart Rehabilitation Platform** graduation project.

The web application provides dedicated experiences for **parents, rehabilitation specialists, and administrators**, bringing treatment planning, exercise management, progress tracking, communication, reporting, speech analysis, notifications, and AI-assisted workflows into one integrated platform.

---

## Overview

Rehabilitation care often requires continuous coordination between specialists, families, and administrators. Information may otherwise be distributed across appointments, messages, reports, exercise records, and manual follow-up processes.

The Smart Rehabilitation Platform Web Application provides a centralized digital workspace designed to make this process more structured, accessible, and data-driven.

The application supports three primary user experiences:

- **Parents** can follow their child's rehabilitation journey, monitor assigned activities and progress, manage sessions, communicate with specialists, access reports, and receive updates.
- **Specialists** can manage patients, treatment plans, goals, exercises, submissions, sessions, reports, speech analyses, and family communication.
- **Administrators** can oversee platform users, patients, case intake requests, exercises, sessions, support requests, and other operational workflows.

The web client communicates with the platform's REST API and integrates with several backend services for authentication, real-time user-facing notifications, AI-assisted functionality, speech processing, and multilingual exercise content.

---

## Key Features

### Parent Experience

The parent dashboard provides a child-focused view of the rehabilitation journey.

Key capabilities include:

- Child-specific dashboard and progress overview
- Today's assigned rehabilitation tasks
- Treatment journey tracking
- Upcoming sessions and calendar view
- Exercise details and submission follow-up
- Reports and rehabilitation updates
- Session request management
- Direct messaging with specialists
- Notifications and activity updates
- Feedback and complaint management
- Parent profile management
- Arabic and English interface support

When a parent has access to multiple children, dashboard information is dynamically scoped to the currently selected child.

---

### Specialist Workspace

Specialists receive a comprehensive workspace for managing rehabilitation cases and monitoring patient progress.

Key capabilities include:

- Specialist dashboard and workload overview
- Active patient and case management
- Patient details and rehabilitation history
- Treatment plan management
- Goal creation and progress tracking
- Exercise library and exercise assignment
- Exercise submission review
- Session scheduling and management
- Parent session-request handling
- Direct communication with families
- Manual report creation
- AI-assisted report generation
- Editable AI report drafts before approval
- Speech analysis and progress insights
- AI-generated recommendations
- Notifications and activity tracking
- Specialist profile management

---

### Administration Dashboard

The administration interface provides operational oversight across the platform.

Key capabilities include:

- Platform overview and statistics
- User management
- Patient management
- Case intake request management
- Specialist matching and assignment workflows
- Exercise library management
- Session oversight
- Support request management
- Account activation and deactivation
- Search and role-based filtering
- Administrative monitoring of platform activity

---

## Speech Analysis

One of the platform's key rehabilitation capabilities is its integrated **speech analysis workflow**.

Specialists can analyze supported patient speech submissions and review structured results including:

- Expected vs. spoken text
- Word-level accuracy
- Word error details
- Timing and fluency measurements
- Analysis quality indicators
- Phoneme-level analysis
- Acoustic measurements
- Progress insights
- Historical speech-analysis results

Speech transcription is powered through a separately deployed **Faster-Whisper** service, while the web application presents the resulting analysis in a specialist-friendly interface.

This architecture keeps computational speech processing separate from the primary application backend while maintaining a unified user experience.

---

## AI-Assisted Rehabilitation

The platform incorporates AI-assisted workflows designed to support specialists rather than replace clinical decision-making.

The web application includes:

- AI-generated rehabilitation recommendations
- Specialist review and assignment of recommendations
- AI-assisted weekly and monthly reports
- Editable AI report drafts
- Structured patient progress summaries
- Contextual rehabilitation insights

AI-generated content remains part of a specialist-controlled workflow, allowing professionals to review information before using it in patient care.

---

## Multilingual Experience

The web application supports both:

- **English**
- **Arabic**

The interface is localized for both languages, including RTL-aware Arabic presentation.

Exercise content stored in English can also be displayed in Arabic through the platform's backend translation service powered by **Microsoft Azure Translator**.

Translation is applied to display-oriented exercise content such as:

- Exercise titles
- Descriptions
- Instructions

Speech-specific targets such as expected text, target words, and target phonemes remain unchanged where required by the exercise workflow.

---

## Notifications

The platform includes an integrated notification system for important rehabilitation events.

Examples include:

- New exercise assignments
- Session-related updates
- Session reminders
- New messages
- Submission and review activity
- Relevant rehabilitation workflow updates

The deployed web application supports **browser push notifications through Firebase Cloud Messaging (FCM)**.

Device tokens are registered with the backend, allowing notifications generated by platform events to reach authenticated users through supported browsers.

---

## Communication

Parents and specialists can communicate directly through the platform.

Messaging capabilities include:

- Conversation list
- Individual chat threads
- Message history
- Attachments
- Read-state handling
- User presence information
- Notification integration
- Unread message indicators

This allows rehabilitation communication to remain connected to the patient's broader care workflow.

---

## Reports

Specialists can create and manage multiple forms of rehabilitation reports.

Supported workflows include:

- Manual report creation
- Weekly reports
- Monthly reports
- Assessment reports
- Progress reports
- AI-generated reports
- Draft editing before AI report approval
- Report detail views
- PDF-based report workflows

Reports bring together relevant rehabilitation information to support structured progress documentation.

---

## Technology Stack

### Frontend

- **React**
- **Vite**
- **JavaScript**
- **CSS**
- REST API integration
- Responsive dashboard architecture
- Role-based routing and UI
- English / Arabic localization

### Integrated Platform Technologies

The web application integrates with a broader platform architecture built with:

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Firebase Cloud Messaging**
- **Microsoft Azure Translator**
- **Faster-Whisper**
- AI-powered backend services
- Docker-based local infrastructure

---

## Application Architecture

The frontend is organized around **feature-based modules and role-specific dashboards**, allowing functionality to remain modular as the platform grows.

```text
frontend_web/
├── public/
├── scripts/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── features/
│   │   ├── admin-dashboard/
│   │   ├── parent-dashboard-preview/
│   │   ├── specialist-dashboard/
│   │   └── shared-dashboard/
│   ├── hooks/
│   ├── i18n/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

Role-specific functionality is separated while reusable dashboard behavior, services, localization utilities, and shared UI components are maintained independently.

---

## Authentication & Authorization

The web application uses authenticated backend APIs with role-aware access.

The authentication flow supports:

- User registration
- Login
- Email verification
- Access-token authentication
- Refresh-token handling
- Logout
- Password reset
- Role-based navigation
- Protected application routes

Supported platform roles include:

- Parent
- Specialist
- Administrator

Authorization-sensitive operations are enforced by the backend rather than relying solely on frontend visibility.

---

## Getting Started

### Prerequisites

Before running the web application locally, make sure you have:

- Node.js
- npm
- A running Smart Rehabilitation Platform backend
- Required Firebase web configuration for notification functionality

---

### Installation

Clone the repository and navigate to the web application:

```bash
git clone <repository-url>
cd smart-rehabilitation-platform/frontend_web
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create the appropriate local environment configuration and provide the required frontend variables.

Example:

```env
VITE_API_URL=http://localhost:5000/api/v1

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_VAPID_KEY=
```

> Never commit production credentials or private secrets to the repository.

The frontend should communicate with the backend through the configured API URL rather than hard-coded production endpoints.

---

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

The development application is typically available at:

```text
http://localhost:5173
```

The backend should also be running and accessible through the configured `VITE_API_URL`.

---

## Production Build

Create an optimized production build with:

```bash
npm run build
```

The generated production bundle is written to:

```text
dist/
```

Preview the production build locally with:

```bash
npm run preview
```

---

## Deployment

The web application is designed to be deployed independently from the backend.

Current deployment architecture:

```text
Browser
   │
   ▼
React Web Application
   │
   │ HTTPS / REST
   ▼
Node.js / Express API
   │
   ├── PostgreSQL
   ├── Firebase Cloud Messaging
   ├── Azure Translator
   ├── AI Services
   └── Faster-Whisper Speech Service
```

The frontend is deployed using **Vercel**, while backend and supporting application services can be deployed independently.

Production configuration is supplied through environment variables, allowing the same frontend codebase to work across local and deployed environments.

---

## Responsive Design

The web application is designed for responsive use across common desktop and tablet layouts.

The interface uses:

- Role-specific navigation
- Reusable dashboard components
- Responsive cards and data views
- Consistent design tokens
- Accessible visual hierarchy
- Arabic RTL-aware layouts
- Compact notification and profile controls

The goal is to provide a consistent experience across the Parent, Specialist, and Admin workspaces while preserving the needs of each role.

---

## Security Considerations

The frontend follows several security-oriented practices:

- Protected authenticated routes
- Backend-enforced authorization
- Environment-based configuration
- No server credentials stored in frontend source code
- Secure authentication flows
- Email verification
- Password-reset workflow
- Controlled access to role-specific functionality
- Firebase server credentials kept exclusively on the backend

Sensitive operations and authorization decisions remain the responsibility of the backend API.

---

## Project Context

The Smart Rehabilitation Platform was developed as a **graduation project** focused on improving coordination, follow-up, and digital support within rehabilitation care.

Rather than functioning as a standalone dashboard, the web application is one client within a broader ecosystem that includes:

- Web dashboards
- Flutter mobile application
- REST API backend
- PostgreSQL database
- Speech-processing services
- AI-assisted rehabilitation features
- Push-notification infrastructure
- Translation services

The project demonstrates the design and implementation of a multi-role, full-stack software system with real-world integrations and deployment considerations.

---

## Related Applications

This repository also contains other components of the Smart Rehabilitation Platform:

```text
backend/          Node.js / Express REST API
mobile_app/       Flutter mobile application
database/         PostgreSQL schema and database resources
python_services/  Speech-processing services
frontend_web/     React web application
```

Refer to the main project README for the complete system architecture and platform-wide setup instructions.

---

## Contributors

Developed as part of the **Smart Rehabilitation Platform Graduation Project**.

**Development Team**

- Suha Abu Ridi
- Bana Aloul

---

## License

This project was developed for academic and portfolio purposes as part of a graduation project.

All rights reserved by the project authors.
