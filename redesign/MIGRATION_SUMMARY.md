# Design Migration Summary

## Current Architecture → New Architecture

### BEFORE (Current)
```
App.tsx
└─ AssessmentEngine
   ├─ Dashboard (modal-based)
   ├─ SetupOverlay (modal on top of dashboard)
   ├─ StudySession (full-screen modal)
   ├─ QuizSession (full-screen modal)
   ├─ TestSession (full-screen modal)
   └─ ResultsDisplay (full-screen modal)

Routes: /, /study, /quiz, /test, /results (mostly unused)
Window Management: All in one window with overlays
```

### AFTER (New)
```
SETUP WINDOW (/)
└─ SetupLayout
   ├─ Sidebar Navigation
   ├─ Dashboard
   │  ├─ Mode cards
   │  ├─ Stats
   │  └─ SetupOverlay (config only)
   ├─ HistoryView
   └─ SettingsView
   └─ SessionModal (blocks during active session)

SESSION WINDOW (/session) [NEW - spawned by Dashboard]
└─ SessionPage
   ├─ StudySession (if mode='study')
   ├─ QuizSession (if mode='quiz')
   ├─ TestSession (if mode='test')
   └─ ResultsDisplay

Routes: /, /session
Window Management: Two separate windows, postMessage communication
```

## Key Behavioral Changes

### Mode Selection
**BEFORE:**
```
User: Click mode card
→ SetupOverlay appears (modal)
→ User configures
→ Click "Start"
→ Full-screen modal appears with session
→ Session runs in same window
```

**AFTER:**
```
User: Click mode card
→ SetupOverlay appears (regular dialog)
→ User configures
→ Click "Start"
→ New window opens automatically
→ Session runs in separate window
→ Setup window shows "Session in Progress" modal
→ User can't interact with setup until session closes
```

### Session Completion
**BEFORE:**
```
Quiz Complete → See results → Click "Back to Dashboard"
→ Return to same window, see dashboard
```

**AFTER:**
```
Study/Quiz Complete → See results → Click "Back to Dashboard"
→ Close session window, setup window becomes accessible again
→ See results, return to dashboard

Test Complete → See results → Click "Back to Dashboard"
→ Window closes, setup window shows SESSION_ENDED modal
→ Results saved in history, user can retry or go to settings
```

## UX Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Navigation** | Modal overlays | Sidebar with clean sections |
| **Session Start** | Modal on top of dashboard | New focused window |
| **Distraction** | Can see dashboard behind | Full-screen, distraction-free |
| **Progress Visibility** | Hidden during session | Visible in separate window |
| **Blocking** | Soft (user can cancel) | Hard (new window required) |
| **Results** | Modal over dashboard | Full window, clear focus |
| **History Access** | Shown on dashboard | Dedicated sidebar section |
| **Settings Access** | Not available | Dedicated sidebar section |
| **Mobile Ready** | Stacked modals | Responsive sidebar (future) |

## Component Communication

### Current (AssessmentEngine manages everything)
```
AssessmentEngine
├─ handleSelectMode()
├─ handleStartSession()
├─ handleCompleteSession()
└─ handleBackToDashboard()

All state flows through AssessmentEngine
```

### New (Distributed between two windows)
```
SETUP WINDOW:
  SetupLayout
  ├─ listens for SESSION_STARTED/SESSION_ENDED
  └─ shows/hides SessionModal

  Dashboard
  ├─ calls window.open('/session')
  └─ sends config via postMessage + sessionStorage

SESSION WINDOW:
  SessionPage
  ├─ reads sessionStorage config
  ├─ listens for postMessage INIT_SESSION
  ├─ sends SESSION_STARTED/SESSION_ENDED to opener
  └─ renders session component

Session components unchanged:
  StudySession, QuizSession, TestSession, ResultsDisplay
```

## Storage Strategy

### SessionStorage (Cleared on browser close)
```javascript
// Dashboard.handleStartSession():
sessionStorage.setItem('pendingSessionConfig', JSON.stringify({
  mode: 'quiz',
  questionCount: 10,
  domain: 'Algebra',
  difficulty: 'Medium'
}))

// SessionPage initialization:
const config = JSON.parse(sessionStorage.getItem('pendingSessionConfig'))
```

### PostMessage (Real-time communication)
```javascript
// Dashboard → SessionWindow:
sessionWindow.postMessage({
  type: 'INIT_SESSION',
  config: { ...config }
}, '*')

// SessionWindow → Dashboard:
window.opener.postMessage({
  type: 'SESSION_STARTED'
}, '*')
```

### LocalStorage (Persists across sessions)
```javascript
// User ID (already exists):
localStorage.setItem('userId', userId)

// Could add:
// localStorage.setItem('setupAppPreferences', {...})
// localStorage.setItem('sessionWindowPreferences', {...})
```

## CSS Architecture Changes

### BEFORE
```css
/* globals.css had styles for all states */
.modal { ... }
.modal.session { ... }
.option-button { ... }
.timer { ... }
```

### AFTER
```css
/* Setup app styles (globals.css) */
.sidebar { ... }
.nav-item { ... }
.stat-card { ... }
.session-modal { ... }

/* Session window styles (globals.css still applies) */
.option-button { ... }
.timer { ... }
.control-bar { ... }

/* Split possible in future */
/* setup-app.css */
/* session-app.css */
```

## API Endpoints (No Changes)

All existing endpoints remain the same:
- `/api/questions` - fetch questions
- `/api/domains` - fetch domains
- `/api/progress/user` - create/get user
- `/api/progress/session/start` - start session
- `/api/progress/session/end` - end session
- `/api/progress/response` - record response
- `/api/progress/user/:userId` - get user progress

SessionPage makes these calls same as before.

## File Size Impact

### New Files
- SetupLayout.tsx (~200 lines)
- SessionModal.tsx (~80 lines)
- HistoryView.tsx (~150 lines)
- SettingsView.tsx (~200 lines)
- SessionPage.tsx (~200 lines)
- TOTAL NEW: ~830 lines

### Deleted Files
- AssessmentEngine.tsx (~250 lines)
- page-study.tsx, page-quiz.tsx, etc. (~50 lines each)
- TOTAL REMOVED: ~350 lines

### Modified Files
- Dashboard.tsx (~200 → ~300 lines)
- app/page.tsx (~5 → ~20 lines)

### NET: +480 lines (acceptable for cleaner architecture)

## Browser Compatibility

- Modern browsers only (Window.postMessage is universal)
- popup blockers may interfere (user needs to allow popups)
- Same-origin policy required (localhost:3000 → localhost:3000)
- No special polyfills needed

## Deployment Considerations

- No backend changes needed
- Docker setup unchanged
- Environment variables unchanged
- NextJS routing handles /session automatically
- No new dependencies required

## Testing Checklist

### Unit Tests
- [ ] SetupLayout sidebar navigation
- [ ] Dashboard mode card selection
- [ ] HistoryView session rendering
- [ ] SettingsView data export
- [ ] SessionModal appearance/disappearance

### Integration Tests
- [ ] Dashboard → SessionPage window open
- [ ] Config passed via sessionStorage
- [ ] Config passed via postMessage
- [ ] SESSION_STARTED message received
- [ ] SessionModal appears on startup
- [ ] SESSION_ENDED message received
- [ ] SessionModal disappears on completion

### E2E Tests
- [ ] Full quiz flow (start → complete)
- [ ] Full test flow (start → complete)
- [ ] Full study flow (start → complete)
- [ ] Results display for each mode
- [ ] Navigation between sidebar sections
- [ ] Settings data export
- [ ] History session list

## Accessibility Improvements

- **Semantic HTML**: Sidebar nav uses `<nav>`
- **ARIA Labels**: SessionModal uses role="dialog"
- **Keyboard Navigation**: Tab through sidebar items
- **Focus Management**: FocusTrap in SessionModal
- **Color Contrast**: Material Design palette verified
- **Screen Readers**: Alt text for icons in stats

## Performance Notes

- SessionStorage lookup: ~1ms
- Window.open(): ~100ms (platform dependent)
- postMessage delivery: <1ms (same-origin)
- No performance penalty from dual-window approach
- Session window can be closed without affecting setup window

---

**Ready to implement!** Copy these files to your Sonnet session and follow the implementation checklist.
