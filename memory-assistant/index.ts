/**
 * SmritiCare - Memory Assistant Module (Member 5's package)
 * Single import point for the rest of the team.
 */

// Types
export * from './types/reminder';

// Database
export * from './db/database';
export * from './db/reminderRepository';
export * from './db/contactNoteRepository';

// Notifications
export * from './notifications/notificationService';

// Voice pipeline
export * from './voice/languageMap';
export * from './voice/speechToText';
export * from './voice/intentParser';
export * from './voice/textToSpeech';
export * from './voice/voiceAssistant';

// Backend sync
export * from './sync/backendSync';

// Test screen (dev use only — remove export before production build)
export { default as AssistantTestScreen } from './screens/AssistantTestScreen';
