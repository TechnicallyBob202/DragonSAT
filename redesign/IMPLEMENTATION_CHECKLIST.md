# Implementation Checklist

## Phase 1: File Structure & Routing
- [ ] Create `frontend/app/session/page.tsx` (SessionPage)
- [ ] Delete `frontend/app/study/page.tsx`, `quiz/page.tsx`, `test/page.tsx`, `results/page.tsx`
- [ ] Update `frontend/app/page.tsx` to render SetupLayout
- [ ] Create `frontend/components/SetupLayout.tsx`
- [ ] Create `frontend/components/SessionModal.tsx`

## Phase 2: New Views
- [ ] Create `frontend/components/HistoryView.tsx`
- [ ] Create `frontend/components/SettingsView.tsx`
- [ ] Refactor `frontend/components/Dashboard.tsx` with:
  - Mode selection cards (gradient backgrounds)
  - Quick stats display
  - SetupOverlay integration
  - `window.open('/session')` logic
  - sessionStorage + postMessage handoff

## Phase 3: Session Window Logic
- [ ] Implement SessionPage initialization
  - Read sessionStorage config
  - Listen for postMessage INIT_SESSION
  - Create user if needed
  - Start backend session
  - Load questions
  - Notify parent (SESSION_STARTED)
- [ ] Update StudySession, QuizSession, TestSession
  - Change `onExit` to call `window.close()` for study
  - Change `onComplete` to show results then prompt close
  - Handle test mode results display properly
- [ ] Update ResultsDisplay
  - For test mode: "Back to Dashboard" → `window.close()` (parent will see SESSION_ENDED)
  - For study/quiz: "Back to Dashboard" → same

## Phase 4: Window Communication
- [ ] SetupLayout window message listener
  - Handle SESSION_STARTED → show SessionModal
  - Handle SESSION_ENDED → hide SessionModal
- [ ] Dashboard window.open() with postMessage
- [ ] SessionPage postMessage setup
  - Send SESSION_STARTED to opener
  - Send SESSION_ENDED to opener on exit

## Phase 5: Styling & Polish
- [ ] Update globals.css for new layout
  - Remove modal overlay styles (replaced with SessionModal)
  - Add sidebar styles
  - Add Material Design transitions
- [ ] Style SetupLayout sidebar
- [ ] Style Dashboard cards with gradients
- [ ] Style HistoryView sessions list
- [ ] Style SettingsView sections
- [ ] Ensure responsive on mobile (sidebar hamburger?)

## Phase 6: Testing
- [ ] Test dashboard mode selection
- [ ] Test session window opening
- [ ] Test SessionModal appears
- [ ] Test session completion → results
- [ ] Test window close → SESSION_ENDED message
- [ ] Test back to setup from results
- [ ] Test all three modes (study, quiz, test)
- [ ] Test navigation between History, Settings
- [ ] Test responsive layout

## Critical Changes to Existing Components

### Dashboard.tsx
```diff
- Don't render StudySession/QuizSession/TestSession directly
- Don't use AssessmentEngine for spawning sessions
+ Use SetupOverlay for config only
+ Pass config to window.open('/session')
+ Store config in sessionStorage
+ Send config via postMessage
```

### SessionPage (NEW)
```javascript
// Key pattern:
useEffect(() => {
  // Initialize from sessionStorage OR listen for postMessage
  const config = JSON.parse(sessionStorage.getItem('pendingSessionConfig'))
  // OR wait for postMessage event
  
  // Initialize session with config
  // Notify parent: window.opener.postMessage({ type: 'SESSION_STARTED' }, '*')
}, [])

// On exit:
window.opener.postMessage({ type: 'SESSION_ENDED' }, '*')
window.close()
```

### SetupLayout.tsx
```javascript
// Key pattern:
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'SESSION_STARTED') setSessionInProgress(true)
    if (event.data.type === 'SESSION_ENDED') setSessionInProgress(false)
  }
  window.addEventListener('message', handleMessage)
}, [])

// Render:
return (
  <div className="flex">
    <Sidebar />
    <MainContent />
    {sessionInProgress && <SessionModal />}
  </div>
)
```

## Environment/Config Needed
- No new env vars needed
- `NEXT_PUBLIC_API_URL` already used for session window API calls
- SessionStorage for temporary config (auto-cleared)

## Potential Issues & Solutions

### Issue: postMessage not working
- Ensure both windows are same origin (localhost:3000)
- Check browser console for CORS issues
- Use `window.opener` (not `window.parent`)

### Issue: Session window not opening
- Check popup blocker
- Verify window name: `'hapasat-session'`
- Ensure `/session` route exists

### Issue: Config not persisting to session window
- Check sessionStorage is available (not incognito?)
- Use both sessionStorage AND postMessage as fallback
- Log config in SessionPage to debug

### Issue: SessionModal not disappearing
- Verify SESSION_ENDED message is being sent
- Check window.opener exists (could be null if opened manually)
- Add timeout fallback (hide after X seconds)

## Testing Strategy

```bash
# Manual testing flow:
1. Open http://localhost:3000
2. Click a mode card (e.g., Quiz)
3. Fill setup overlay, click Start
4. New window opens → setup/session app appears
5. Check main window shows SessionModal
6. Complete session
7. See results
8. Click "Back to Dashboard"
9. Main window SessionModal disappears
10. Can interact with setup app again
```

## Next Steps for Sonnet Session

1. Start with Phase 1 (routing & structure)
2. Implement SetupLayout skeleton
3. Move Dashboard logic to new file
4. Create SessionPage with initialization
5. Implement window messaging
6. Test modal blocking
7. Polish styling

Ready to begin implementation!
