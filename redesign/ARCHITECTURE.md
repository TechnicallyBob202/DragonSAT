# HapaSAT Redesign - Dual-App Architecture

## Overview

The application is split into two separate windows/contexts:

1. **Setup App** (`/`) - Main window with sidebar navigation
   - Dashboard (mode selection, quick stats)
   - History (past sessions, analytics)
   - Settings (preferences, data management)
   - Blocks interaction during active session

2. **Session App** (`/session`) - Spawned window/tab
   - Minimal, distraction-free UI
   - Full-screen question rendering
   - Timer management
   - Results display
   - Closes after completion

## File Structure Changes

```
frontend/
├── app/
│   ├── page.tsx                    # Root → SetupLayout
│   ├── session/
│   │   └── page.tsx               # NEW: Session window
│   └── (other pages removed)
├── components/
│   ├── SetupLayout.tsx            # NEW: Main sidebar + nav
│   ├── Dashboard.tsx              # REDESIGNED: Mode cards + stats
│   ├── HistoryView.tsx            # NEW: Sessions + analytics
│   ├── SettingsView.tsx           # NEW: Preferences + data
│   ├── SessionModal.tsx           # NEW: "Session in Progress" blocker
│   ├── StudySession.tsx           # EXISTING (no changes)
│   ├── QuizSession.tsx            # EXISTING (no changes)
│   ├── TestSession.tsx            # EXISTING (no changes)
│   ├── ResultsDisplay.tsx         # EXISTING (no changes)
│   ├── AssessmentEngine.tsx       # DELETE: No longer needed
│   └── (other components)
└── hooks/
    ├── useAssessmentStore.ts      # EXISTING
    ├── useProgressStore.ts        # EXISTING
    └── useQuestions.ts            # EXISTING
```

## Component Responsibilities

### SetupLayout
- Main container for setup app
- Manages sidebar navigation
- Listens for session window messages
- Shows/hides SessionModal based on session status
- Routes between Dashboard, History, Settings

### Dashboard
- Mode selection cards (Study, Quiz, Test)
- Quick stats display
- Launches SetupOverlay for configuration
- Opens new window via `window.open('/session')`
- Passes config via sessionStorage + postMessage

### HistoryView
- Displays paginated session list
- Shows overall stats and averages
- Filters by mode (optional)
- Fetches data from `/api/progress/user/:userId`

### SettingsView
- Theme/appearance settings
- Test preferences (timer, sounds)
- Account info display
- Export data as JSON
- Clear all data (with confirmation)

### SessionModal
- Simple overlay blocking interaction
- Displays "Session in Progress" message
- Shows helpful tip about session window
- Removes itself when session ends

### SessionPage (`/session`)
- Initializes from config in sessionStorage
- Listens for `INIT_SESSION` postMessage from parent
- Renders StudySession, QuizSession, or TestSession
- Shows loading state while initializing
- Notifies parent on SESSION_STARTED and SESSION_ENDED
- Closes window or shows results based on mode

## Data Flow

### Starting a Session
```
User clicks mode card
  ↓
SetupOverlay appears (select config)
  ↓
Dashboard.handleStartSession()
  ├─ Store config in sessionStorage
  ├─ Open new window: window.open('/session', 'hapasat-session')
  └─ Send config via postMessage
  ↓
SessionPage initializes
  ├─ Reads sessionStorage config
  ├─ Creates user + session in backend
  ├─ Loads questions
  └─ Notifies parent: SESSION_STARTED
  ↓
SetupLayout sees SESSION_STARTED message
  └─ Shows SessionModal overlay
```

### Ending a Session
```
StudySession/QuizSession/TestSession completes
  ↓
handleCompleteSession() called
  ├─ Calls endSession() API
  └─ Shows results or closes window
  ↓
SessionPage notifies parent: SESSION_ENDED
  ↓
SetupLayout sees SESSION_ENDED message
  └─ Hides SessionModal overlay
  ↓
User can interact with setup app again
```

## Window Communication Protocol

### Messages from SessionPage → SetupLayout

```javascript
// Session started
window.opener.postMessage({ type: 'SESSION_STARTED' }, '*')

// Session ended
window.opener.postMessage({ type: 'SESSION_ENDED' }, '*')
```

### Messages from Dashboard → SessionPage

```javascript
// Config sent to new window
sessionWindow.postMessage({
  type: 'INIT_SESSION',
  config: {
    mode: 'quiz',
    questionCount: 10,
    domain: 'Algebra',
    difficulty: 'Medium'
  }
}, '*')
```

## State Management

### SetupLayout
- `activeSection` - Current nav section (dashboard, history, settings)
- `sessionInProgress` - Boolean from window messages

### Dashboard
- `showSetup` - Toggle SetupOverlay visibility
- `selectedMode` - Current mode being configured

### SessionPage
- `isInitializing` - Loading state during setup
- `showResults` - Toggle results display
- `sessionResults` - Score data
- `config` - Session configuration

### Shared (Zustand stores)
- `useAssessmentStore` - Current session state
- `useProgressStore` - User data and history

## Styling Notes

### Material Design Implementation
- Sidebar: White background, subtle shadow, clean typography
- Cards: Gradient backgrounds, hover lift effect, rounded corners
- Stats boxes: Color-coded by category (blue, green, purple, orange)
- Settings: Organized sections with visual hierarchy
- Buttons: Filled (primary), outlined (secondary), text only (tertiary)

### Color Palette
```
Primary:    Blue (#3B82F6)
Secondary:  Gray (#6B7280)
Success:    Green (#10B981)
Warning:    Orange (#F59E0B)
Danger:     Red (#EF4444)
```

## Migration Guide

### What's New
1. `/session` route - new window app
2. `SetupLayout` - main container
3. `HistoryView` - dedicated history page
4. `SettingsView` - dedicated settings page
5. `SessionModal` - session blocker
6. Window postMessage communication

### What's Changed
1. `Dashboard` - no longer handles session spawn
2. Root page - now renders SetupLayout instead of AssessmentEngine
3. Session lifecycle - moved to separate window

### What's Deleted
1. `AssessmentEngine.tsx` - logic split between SetupLayout and SessionPage
2. `/quiz`, `/study`, `/test`, `/results` routes - all in session window
3. Modal overlay system - replaced with SessionModal

## Advantages of This Architecture

1. **Clean Separation** - Setup and session are truly separate concerns
2. **Better UX** - User can't accidentally navigate away during test
3. **Minimal Distractions** - Session window is focused and full-screen
4. **State Isolation** - Each window has independent state
5. **Native Feel** - Like real SAT proctoring software
6. **Scalable** - Could run session on different device in future
7. **Testing** - Easier to test each app independently

## Known Considerations

1. **Browser Security** - postMessage only works within same origin
2. **Window Closing** - User can still close session window (acceptable risk)
3. **SessionStorage** - Cleared between tabs, but accessible within same window
4. **Responsive** - Session window needs mobile-friendly dimensions
5. **Parent Death** - If setup window closes, session window becomes orphaned (acceptable)

## Future Enhancements

- Add session timer to setup app (shows time remaining)
- Sync progress in real-time via WebSocket
- Support opening session on different device (QR code?)
- Add study materials sidebar to session window
- Dark mode support across both apps
- Keyboard shortcuts for navigation
