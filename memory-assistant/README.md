# SmritiCare — Memory Assistant + Voice (Member 5's Module)

**Status: Days 1–5 complete.** Everyday memory-support features: reminders,
offline cache, and a voice assistant with real microphone input and
North-Eastern Indian language support. Runs **completely standalone** — no
dependency on the backend, AI service, or the games — per the team's Phase 2
plan.

## What's in this package

```
src/
├── types/reminder.ts              Shared type definitions
├── db/
│   ├── database.ts                SQLite setup + schema
│   ├── reminderRepository.ts      Reminder CRUD (Day 1)
│   └── contactNoteRepository.ts   Contacts + Notes CRUD (Day 3)
├── notifications/
│   └── notificationService.ts     Local push notifications (Day 2)
├── voice/
│   ├── languageMap.ts             Shared language codes (single source of truth)
│   ├── speechToText.ts            Real STT via @react-native-voice/voice (Day 4)
│   ├── intentParser.ts            Text -> intent parsing, expanded phrasing (Day 3 + 5)
│   ├── textToSpeech.ts            TTS with automatic fallback (Day 3 + 5)
│   └── voiceAssistant.ts          Orchestrator: STT -> intent -> action -> TTS
├── sync/
│   └── backendSync.ts             Push to Member 2's API (Day 5, pull still pending)
├── screens/
│   └── AssistantTestScreen.tsx    Standalone test UI incl. mic button (dev-only)
└── index.ts                       Single import point for the rest of the team
```

## Setup

```bash
npx expo install expo-sqlite expo-notifications expo-speech expo-av
npm install @react-native-voice/voice
npx expo prebuild   # required — voice recognition does not run in Expo Go
```

## Try it

1. Add `AssistantTestScreen` to any nav stack, or render it as your app's
   root component temporarily:

   ```tsx
   import { AssistantTestScreen } from './src';
   export default function App() {
     return <AssistantTestScreen />;
   }
   ```

2. Run the app on a **dev build** (not Expo Go — real mic recognition needs
   a native build). You can:
   - Add a reminder manually → schedules a real local notification
   - Pick a language chip (English / Hindi / Assamese / Manipuri / Nagamese)
   - Type a command like `remind me to take medicine at 8am` into the typed
     tester, or tap **🎤 Tap to Speak** and say it out loud
   - Mark reminders done / delete them
   - Close and reopen the app — reminders persist (SQLite offline-first)

## Voice pipeline — final status

**Speech-to-text:** implemented using `@react-native-voice/voice`
(`NativeVoiceSttProvider` in `speechToText.ts`). Requires a dev build.
Recognition quality for regional languages depends on what speech-recognition
engine and language packs are installed on the test device — this is a
device limitation, not something fixable in app code.

**Text-to-speech:** `textToSpeech.ts` checks whether the device has an
installed voice for the requested language before speaking. If not, it
automatically falls back to Hindi, then English, rather than failing
silently.

**Language support — what actually works, by language:**

| Language  | Voice input (STT) | Voice output (TTS)         |
|-----------|--------------------|-----------------------------|
| English   | ✅ Reliable         | ✅ Reliable                  |
| Hindi     | ✅ Reliable         | ✅ Reliable                  |
| Assamese  | ⚠️ Device-dependent | ⚠️ Falls back to Hindi if no voice installed |
| Manipuri  | ⚠️ Device-dependent | ⚠️ Falls back to Hindi if no voice installed |
| Nagamese  | ⚠️ Device-dependent | ⚠️ Falls back to Hindi if no voice installed |

**Be upfront about this in your demo/presentation:** most Android/iOS
devices ship with reliable English and Hindi voices, but Assamese, Manipuri,
and Nagamese voice packs are inconsistently available. The app **degrades
gracefully** — it never crashes or goes silent, it just falls back — but
full regional-language voice support depends on what's installed on the
demo device. If your team needs guaranteed support for these languages,
that requires a paid cloud STT/TTS service (Google Cloud Speech, Azure
Speech), which is a bigger scope change to flag with the team, not something
built into this module.

**Intent parsing (`intentParser.ts`) is English-only for now.** Keyword
matching (e.g. "remind me", "what do I have today") only recognizes English
phrasing. Speaking Assamese/Manipuri/Nagamese into the mic will transcribe
via STT, but the intent parser won't understand non-English text yet.
**Scope decision made for the MVP:** full regional command understanding is
a documented future enhancement, not part of this deliverable — say this
explicitly if asked, rather than implying more coverage than exists.

## How the pieces fit the team's shared contract

- Games and AI never touch this module — independent, matching the
  "Member 4 never needs to know about Member 5" coordination rule.
- Member 1 (frontend) only needs the functions exported from `src/index.ts`
  — `getTodayReminders`, `createReminder`, `handleTextCommand`,
  `handleVoiceCommand`, etc. `AssistantTestScreen.tsx` is a placeholder for
  that, not the final UI — don't ship it to production.
- Member 2 (backend): `sync/backendSync.ts` implements **push** sync
  (`syncPendingReminders`) against `POST /api/reminders/bulk`. **Pull sync**
  (`pullCaregiverReminders`) is intentionally left stubbed until Member 2
  defines the caregiver-reminders GET endpoint and response shape — don't
  guess at that contract from this side.
- Member 6 (infra): reminders synced via `backendSync.ts` land in whatever
  Postgres schema Member 2 + Member 6 design; this module only assumes a
  JSON reminder shape, not a specific backend schema.

## Build status by day

1. ✅ SQLite schema + CRUD (`db/`)
2. ✅ Local notifications (`notifications/`)
3. ✅ Contacts/notes + voice intent logic, tested via typed text
4. ✅ Real microphone input (`@react-native-voice/voice`) + initial NE language map
5. ✅ Expanded intent phrasing, TTS fallback logic, push-sync to backend

## Known limitations / next steps

- Regional-language voice command understanding (not just transcription) is
  not implemented — flagged above, scope decision for the MVP.
- `pullCaregiverReminders` is a stub — needs Member 2's GET endpoint
  contract before implementation.
- `weekly` repeat reminders behave like `daily` in the notification
  scheduler — expand if the team needs true weekly-only scheduling.
- Regional TTS/STT voice availability should be verified on the actual
  demo device before presenting, since coverage varies by phone/OS version.
