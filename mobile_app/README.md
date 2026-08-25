# Smart Rehabilitation Platform — Mobile Application

A cross-platform mobile application for the **Smart Rehabilitation Platform**, developed with Flutter as part of a graduation project focused on improving communication, follow-up, and digital rehabilitation workflows for children, families, rehabilitation specialists, and platform administrators.

The mobile application provides dedicated role-based experiences for **parents, specialists, and administrators**, integrating rehabilitation plans, exercises, sessions, progress monitoring, communication, reports, speech analysis, AI-assisted workflows, and real-time notifications within a unified mobile experience.

---

## Overview

Rehabilitation care extends beyond scheduled clinical sessions. Families need clear daily guidance, specialists need continuous visibility into patient progress, and both sides need an efficient way to communicate and coordinate treatment activities.

The Smart Rehabilitation Platform Mobile Application was designed to support this continuous rehabilitation journey.

The application connects directly to the Smart Rehabilitation Platform backend and provides role-specific interfaces for:

- **Parents** following their child's rehabilitation activities and progress
- **Specialists** managing patients, treatment activities, submissions, sessions, and reports
- **Administrators** monitoring selected platform operations

The mobile client is part of a larger full-stack ecosystem that also includes a React web application, Node.js/Express backend, PostgreSQL database, speech-processing services, AI-assisted features, push-notification infrastructure, and multilingual content services.

---

## Key Features

### Parent Experience

The parent experience is designed around the child's daily rehabilitation journey.

Parents can:

- View a personalized rehabilitation dashboard
- Switch between linked children when applicable
- Review today's assigned exercises and activities
- Follow treatment progress
- View treatment journey information
- Access assigned exercise details
- Follow exercise submissions and reviews
- View upcoming and previous sessions
- Request sessions with specialists
- Receive rehabilitation notifications and reminders
- Communicate directly with specialists
- Access rehabilitation reports
- View AI-assisted rehabilitation information
- Submit feedback and complaints
- Manage profile information
- Use the application in Arabic or English

The dashboard provides parents with a simplified overview of the information most relevant to daily follow-up.

---

## Specialist Experience

The specialist mobile workspace provides tools for managing rehabilitation cases while maintaining convenient access from a mobile device.

Specialists can:

- View a personalized specialist dashboard
- Access active cases
- Review patient details
- Monitor patient rehabilitation progress
- Review family and patient information
- Manage treatment-related goals
- Update goal progress
- Browse the exercise library
- Assign exercises to patients
- Configure assignment frequency and start date
- Review exercise submissions
- Complete or request retry for submitted exercises
- Manage today's sessions
- Review session information
- Communicate with parents
- View notifications
- Generate and review reports
- Create manual reports
- Generate AI-assisted reports
- Edit AI report drafts before approval
- Review AI recommendations
- Assign approved AI recommendations
- Access speech-analysis results
- Review patient progress insights
- Manage specialist profile information

---

## Administrator Experience

The mobile application also includes selected administrative functionality for platform oversight.

Administrative capabilities include:

- Dashboard overview
- Patient monitoring
- Session monitoring
- AI-related administrative views
- Audit log access

The primary operational administration experience is complemented by the platform's web administration dashboard.

---

## Exercise Management

Exercises form a central part of the rehabilitation workflow.

The mobile application supports:

- Exercise library browsing
- Exercise detail views
- Patient-specific exercise assignments
- Assignment frequency configuration
- Assignment start dates
- Exercise submission workflows
- Submission review
- Completion and retry decisions
- Progress-related exercise information

Exercise content can include rehabilitation instructions as well as speech-specific targets where applicable.

---

## Speech Analysis

The mobile application integrates with the platform's speech-analysis workflow.

Supported speech-analysis information includes:

- Expected vs. spoken text
- Word-level accuracy
- Word error information
- Timing and fluency metrics
- Analysis quality
- Phoneme-level analysis
- Acoustic measurements
- Progress insights
- Historical speech-analysis results

Speech transcription and timing information are processed through the platform's separately deployed **Faster-Whisper** service.

Additional speech-processing capabilities are handled through backend services, while Flutter provides the mobile presentation and specialist interaction layer.

This separation keeps computational speech-processing responsibilities outside the mobile device while providing specialists with structured analysis results.

---

## AI-Assisted Features

The mobile application integrates AI-assisted rehabilitation workflows available through the platform backend.

These include:

- AI-generated rehabilitation recommendations
- Specialist review of recommendations
- Recommendation assignment
- AI-assisted patient reports
- Weekly and monthly report generation
- Editable AI report drafts
- Patient progress summaries and insights

AI-generated information is incorporated into specialist-controlled workflows and is intended to assist professional decision-making rather than replace specialist review.

---

## Reports

The mobile application supports both traditional and AI-assisted rehabilitation reporting.

Specialists can work with:

- Manual reports
- Weekly reports
- Monthly reports
- Assessment reports
- Progress reports
- AI-generated reports
- Editable AI report drafts
- Structured report details

Parents can access relevant reports associated with their children.

---

## Messaging & Communication

The platform includes integrated communication between parents and specialists.

Mobile messaging capabilities include:

- Conversation list
- Individual chat threads
- Message history
- Attachments
- Read-state handling
- User presence information
- Counterpart profile information
- Unread indicators
- Push-notification integration

A shared communication experience helps keep family-specialist interaction connected to the rehabilitation workflow.

---

## Push Notifications

The mobile application integrates with **Firebase Cloud Messaging (FCM)** to support push notifications.

Notifications can be generated for events such as:

- New exercise assignments
- Exercise reminders
- Session reminders
- Session-related updates
- New messages
- Rehabilitation workflow updates

Device tokens are registered with the backend and associated with authenticated users.

The application also integrates local notification handling to present relevant push events on supported devices.

---

## Multilingual Support

The application supports:

- **English**
- **Arabic**

Flutter localization resources are used throughout the interface, with support for Arabic RTL layouts.

Exercise content stored in English can be displayed in Arabic using the platform's backend translation service powered by **Microsoft Azure Translator**.

Translated display content includes:

- Exercise titles
- Descriptions
- Instructions

Speech-specific fields such as:

- Expected text
- Target word
- Target phoneme

remain in their original language where required for the speech exercise itself.

Translation requests are handled through the backend rather than calling Azure directly from the mobile application.

---

## Technology Stack

### Mobile

- **Flutter**
- **Dart**
- Material-based UI
- Role-based application architecture
- REST API integration
- Arabic / English localization
- RTL support
- Firebase Cloud Messaging
- Local notifications
- Authenticated networking
- Environment-based API configuration

### Platform Integrations

The Flutter application integrates with a wider technology stack including:

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Firebase Cloud Messaging**
- **Microsoft Azure Translator**
- **Faster-Whisper**
- AI-powered backend services
- Docker-based local infrastructure

---

## Architecture

The mobile application follows a feature-oriented architecture that separates presentation, data access, models, and shared application infrastructure.

A simplified structure is shown below:

```text
mobile_app/
├── android/
├── assets/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   └── ...
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   └── presentation/
│   │   │       ├── admin/
│   │   │       ├── parent/
│   │   │       └── specialist/
│   │   └── ...
│   ├── l10n/
│   └── main.dart
├── test/
├── pubspec.yaml
└── README.md
```

The application separates role-specific functionality while reusing shared infrastructure where appropriate.

---

## Backend Communication

The mobile application communicates with the Smart Rehabilitation Platform REST API.

The backend is responsible for:

- Authentication and authorization
- User and patient management
- Treatment plans and goals
- Exercise assignments and submissions
- Session management
- Reports
- AI-assisted functionality
- Speech-analysis orchestration
- Messaging
- Notifications
- Translation
- File and media handling

Flutter remains responsible for the mobile user experience and client-side interaction with these services.

---

## Authentication

The mobile application uses the platform's authenticated API.

Authentication-related functionality includes:

- Registration
- Login
- Email verification workflows
- Authenticated API requests
- Token handling
- Logout
- Password recovery
- Role-specific navigation

The application adapts its available functionality based on the authenticated user's role.

Authorization-sensitive operations are enforced by the backend.

---

## Getting Started

### Prerequisites

Before running the application, install:

- Flutter SDK
- Dart SDK
- Android Studio or another supported Flutter development environment
- Android SDK
- A connected Android device or emulator

Verify your Flutter installation:

```bash
flutter doctor
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd smart-rehabilitation-platform/mobile_app
```

Install Flutter dependencies:

```bash
flutter pub get
```

---

## API Configuration

The mobile application supports configuring the backend server origin through a Dart compile-time environment value:

```text
API_SERVER_ORIGIN
```

If no value is provided, local development uses:

```text
http://127.0.0.1:5000
```

For a deployed backend, run the application with:

```bash
flutter run --dart-define=API_SERVER_ORIGIN=https://your-backend.example.com
```

For a specific connected device:

```bash
flutter run -d <device-id> --dart-define=API_SERVER_ORIGIN=https://your-backend.example.com
```

This allows the same mobile codebase to communicate with local, testing, or production backend environments without hard-coding deployment URLs.

---

## Running Locally

List available Flutter devices:

```bash
flutter devices
```

Run the application:

```bash
flutter run
```

Or target a specific device:

```bash
flutter run -d <device-id>
```

When testing on a physical device against a locally running backend, ensure the backend address is reachable from that device.

---

## Firebase Configuration

Firebase is used for mobile push-notification functionality.

Android Firebase configuration is provided through the appropriate platform configuration, including:

```text
android/app/google-services.json
```

The application also uses generated Firebase configuration where applicable.

---

## Localization

Localization resources are maintained using Flutter's localization workflow.

The application includes Arabic and English resources such as:

```text
app_en.arb
app_ar.arb
```

When adding user-facing text:

1. Add the localization key to the supported ARB files.
2. Provide both English and Arabic values.
3. Regenerate localization output if required by the project configuration.
4. Verify both LTR and RTL presentation.

Avoid hard-coded user-facing strings where localized equivalents are required.

---

## Testing

Run the Flutter test suite with:

```bash
flutter test
```

Run static analysis with:

```bash
flutter analyze
```

For focused development, individual test files can also be executed:

```bash
flutter test test/<test_file>.dart
```

The project includes focused tests for application behavior and selected rehabilitation workflows.

---

## Building

### Android APK

Build a release APK with:

```bash
flutter build apk --release
```

### Android App Bundle

Build an Android App Bundle with:

```bash
flutter build appbundle --release
```

When building against a deployed backend, provide the production API origin:

```bash
flutter build apk --release \
  --dart-define=API_SERVER_ORIGIN=https://your-backend.example.com
```

On Windows CMD, the same command can be written on one line:

```bat
flutter build apk --release --dart-define=API_SERVER_ORIGIN=https://your-backend.example.com
```

---

## Deployment Architecture

The mobile application communicates with independently deployed platform services.

```text
Flutter Mobile App
        │
        │ HTTPS / REST
        ▼
Node.js / Express Backend
        │
        ├── PostgreSQL Database
        ├── Firebase Cloud Messaging
        ├── Microsoft Azure Translator
        ├── AI Services
        └── Faster-Whisper Speech Service
```

This architecture keeps mobile releases independent from backend and computational service deployments.

---

## Design Principles

The mobile experience was developed around several core principles:

- Role-specific workflows
- Clear rehabilitation information hierarchy
- Consistent navigation
- Parent-friendly daily follow-up
- Efficient specialist workflows
- Arabic and English accessibility
- Reusable UI components
- Responsive mobile layouts
- Backend-driven business logic
- Secure separation of client and server credentials

The application aims to make complex rehabilitation workflows understandable and manageable from a mobile device.

---

## Security Considerations

The mobile application follows several security-oriented practices:

- Authenticated API communication
- Backend-enforced authorization
- No Firebase Admin credentials stored in the client
- Environment-based backend configuration
- Role-aware application navigation
- Secure handling of authenticated requests
- Server-controlled sensitive operations

External service secrets such as Azure Translator credentials, AI provider keys, email credentials, and Firebase Admin private keys remain on the backend.

---

## Project Context

The Smart Rehabilitation Platform Mobile Application was developed as part of a **graduation project** exploring how modern software technologies can support rehabilitation care through better coordination, continuous follow-up, structured progress information, and intelligent digital tools.

The mobile application represents one component of a larger system consisting of:

- Flutter mobile application
- React web application
- Node.js / Express backend
- PostgreSQL database
- Speech-processing microservices
- AI-assisted rehabilitation workflows
- Firebase push-notification infrastructure
- Multilingual translation services

Together, these components form a multi-role rehabilitation management ecosystem rather than a standalone mobile application.

---

## Related Project Components

```text
backend/          Node.js / Express REST API
frontend_web/     React web application
mobile_app/       Flutter mobile application
database/         PostgreSQL schema and database resources
python_services/  Speech-processing services
```

Refer to the root project README for complete system architecture, backend setup, database configuration, deployment information, and platform-wide documentation.

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