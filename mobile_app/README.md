# Smart Rehabilitation Platform – Mobile Application

## Overview

The **Smart Rehabilitation Platform – Flutter Mobile App** is the mobile client of the Smart Rehabilitation Platform, developed as part of a graduation project. The application supports rehabilitation and special needs therapy by connecting **specialists**, **parents**, and **administrators** in a single coordinated workflow.

Parents can follow their child's care plan, submit exercise evidence, and communicate with specialists. Specialists manage patients, treatment plans, exercises, sessions, and clinical reporting. Administrators oversee users, patient assignments, case intake, and platform operations. Together, these roles enable structured therapy delivery, progress monitoring, and timely communication across the care team.

## Features

The mobile application implements the following major capabilities:

- **Secure Authentication** — Sign-in, registration, email verification, and token-based session management
- **Role-based Access** — Distinct experiences for Admin, Specialist, and Parent roles
- **Patient Management** — View and manage patient profiles, assignments, and clinical details
- **Treatment Plans** — Create, edit, and review structured treatment plans for patients
- **Goals Tracking** — Define and monitor therapy goals linked to patient progress
- **Exercise Assignments** — Assign exercises to patients with instructions and media
- **Exercise Submission (Video, Audio, Image)** — Capture and upload exercise completion evidence from the device
- **Progress Tracking** — Monitor exercise completion, submissions, and overall patient progress
- **Session Scheduling** — View sessions and handle session requests between parents and specialists
- **Parent–Specialist Chat** — Real-time messaging and conversation management
- **Notifications** — In-app notifications and unread counts for parent-facing activity
- **AI Assistant** — Parent-facing AI chat for guided support and information
- **Speech Analysis** — Specialist tools for uploading and reviewing speech analysis results
- **Reports** — Access and review progress and clinical reports
- **Dashboard for Each User Role** — Tailored home screens for Admin, Specialist, and Parent workflows
- **Case Intake** — Parent case requests, admin review, specialist assignment, and patient conversion
- **Online Presence** — Live presence indicators during chat through Socket.IO

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Flutter |
| Language | Dart |
| State Management | Riverpod (`flutter_riverpod`) |
| Navigation | GoRouter (`go_router`) |
| HTTP / REST API | Dio (`dio`) |
| Real-time Communication | Socket.IO (`socket_io_client`) |
| Local Storage | Shared Preferences (`shared_preferences`) |
| External Links | url_launcher |
| Media Capture | image_picker, file_picker, record |
| Media Playback | video_player, just_audio |
| UI & Assets | flutter_svg, cached_network_image, google_fonts |
| Utilities | intl, path, path_provider |

## Project Structure

The application is organized under `lib/` using a **feature-based** layout:

```
lib/
├── core/                  # App-wide infrastructure
│   ├── constants/         # API endpoints and shared constants
│   ├── routes/            # Route definitions and GoRouter configuration
│   ├── services/          # Shared services (e.g. HTTP client)
│   ├── theme/             # Application theme and styling
│   └── utils/             # Cross-cutting helpers
├── features/              # Feature modules (auth, dashboard, chat, etc.)
│   ├── auth/
│   ├── dashboard/
│   ├── case_intake/
│   ├── exercises/
│   ├── presence/
│   └── ...
│       ├── data/          # Repositories and API access
│       ├── models/        # Data models and DTOs
│       ├── providers/     # Riverpod providers and state notifiers
│       ├── presentation/  # Screens and page-level UI
│       ├── widgets/       # Reusable feature widgets
│       └── utils/         # Feature-specific helpers
├── shared/                # Shared models and widgets used across features
└── main.dart              # Application entry point

assets/
└── videos/                # Bundled media (e.g. authentication background)
```

Each feature module separates **presentation**, **providers**, **models**, **repositories** (under `data/`), and supporting **widgets** to keep responsibilities clear and maintainable.

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (compatible with Dart SDK `^3.9.2`)
- A running instance of the Smart Rehabilitation Platform **Node.js backend**
- An emulator, simulator, or physical device

### Setup

1. Navigate to the mobile application directory:

```bash
cd mobile_app
```

2. Install dependencies:

```bash
flutter pub get
```

3. Configure the backend URL in `lib/core/constants/api_constants.dart` so the app points to your API server (for example, `http://127.0.0.1:5000` for local development or your machine's LAN IP for a physical device).

4. Run the application:

```bash
flutter run
```

5. Run static analysis:

```bash
flutter analyze
```

## Supported Platforms

- **Android**
- **iOS**

The project includes standard Flutter platform folders for both Android and iOS. Platform-specific permissions for camera, microphone, storage, and network access are configured in the respective native project files.

## Architecture

The application follows a **feature-based architecture** with clear separation of concerns:

- **Presentation** — Screens, layouts, and user interaction (`presentation/`, `widgets/`)
- **State Management** — Riverpod providers and notifiers (`providers/`)
- **Domain Models** — Typed data structures (`models/`)
- **Data Layer** — Repositories that call the REST API (`data/`)
- **Core Services** — Shared HTTP client, routing, theming, and utilities (`core/`)

User actions flow from the UI through providers to repositories, which communicate with the backend. Responses are mapped to models and reflected back in the UI. Real-time features such as presence and chat leverage Socket.IO alongside the REST API.

## Backend Integration

The mobile app communicates with the Smart Rehabilitation Platform **Node.js REST API** for authentication, patient data, treatment plans, exercises, sessions, reports, notifications, case intake, and AI-assisted features.

Real-time updates—such as online presence and chat-related activity—are delivered through **Socket.IO**, integrated via the `socket_io_client` package. API requests are sent with Dio, and authentication tokens are persisted locally using Shared Preferences.

Ensure the backend is running and reachable at the URL configured in `api_constants.dart` before testing the application.

## Contributors

- Suha Aburidi
- Bana

## License


