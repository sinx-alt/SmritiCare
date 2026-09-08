SmritiCare

SmritiCare is a digital care and cognitive wellness platform designed to support older adults through accessible daily activities, memory-focused games, reminders, and caregiver monitoring.

Project Overview

The SmritiCare frontend provides the user-facing application for patients and caregivers.

The current prototype includes:

- Patient login and navigation
- Today's Activity flow
- Seven cognitive games
- Game WebView integration
- Results and progress screens
- Reminders
- Memory Assistant interface
- Patient profile
- Caregiver dashboard
- Accessibility-focused UI

Technology Stack

- React Native
- TypeScript
- Expo
- Expo Router
- React Native WebView
- React Native Reanimated
- React Native Safe Area Context

Application Flow

Login
  ↓
Home
  ├── Today's Activity
  │      ↓
  │   Game Ready Screen
  │      ↓
  │   Game WebView
  │
  ├── Games
  │      ↓
  │   Game WebView
  │
  ├── Reminders
  │
  └── Care
         ├── Profile
         ├── Memory Assistant
         ├── Weekly Performance
         └── Caregiver Dashboard

Cognitive Games

The prototype contains exactly seven games:

1. Memory Match
2. Pattern Recall
3. Number Sequence
4. Adaptive Chess
5. Prakrti Spotter
6. Object Association
7. NER Memory Quiz

Games are accessed through the WebView integration so that the individual game implementations can be connected independently.

Project Structure

src/
├── app/
│   ├── (tabs)/
│   ├── activity.tsx
│   ├── caregiver-dashboard.tsx
│   ├── game.tsx
│   ├── login.tsx
│   ├── memory-assistant.tsx
│   ├── profile.tsx
│   ├── progress.tsx
│   ├── results.tsx
│   └── webview.tsx
│
├── components/
├── constants/
├── context/
└── hooks/

Getting Started

Install the project dependencies:

npm install

Start the Expo development server:

npx.cmd expo start -c

From there, use the available Expo development options to run the application on a connected device or emulator.

Development Notes

The frontend currently contains some temporary/mock data where backend integration has not yet been connected.

These placeholders are intentionally isolated and should be replaced with backend data as the corresponding APIs become available.

User-configurable information such as reminders should come from application state or backend data rather than being permanently hard-coded into UI screens.

WebView Integration

Game screens use the following flow:

Game Card
   ↓
/webview?gameId=<gameId>
   ↓
Corresponding Game

The seven backend game IDs are:

memory_match
pattern_recall
number_sequence
adaptive_chess
focus_flight
object_association
ner_memory_quiz

"focus_flight" is currently the backend identifier for the user-facing Prakrti Spotter game.

Current Prototype Status

The frontend structure and primary UI flows are implemented.

Remaining integration work includes connecting the frontend to the backend APIs, replacing temporary data, and connecting the individual game implementations through the WebView routes.