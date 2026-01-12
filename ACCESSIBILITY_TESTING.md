# Accessibility Testing Checklist

## Manual Keyboard Navigation Testing

### Procedure

1. **Clear your mouse from the desk** (sounds funny, but it works!)
2. **Disconnect your mouse** if using laptop trackpad
3. **Use ONLY keyboard for 30 minutes**
4. Take notes of any issues

### Test Cases

#### Test 1: Basic Navigation

```
1. Open the game in browser
2. Press Tab key repeatedly
   ✓ Focus moves forward through all interactive elements
   ✓ Tab order follows visual/logical order
   ✓ Focus indicator is always visible
   ✓ No focus is hidden behind other elements

3. Press Shift+Tab repeatedly
   ✓ Focus moves backward through all elements
   ✓ Reaches same elements as Tab (just reversed)

4. Skip to main content (if implemented)
   ✓ Pressing "S" or similar skips to main game area
```

#### Test 2: The Lovers Modal

```
1. Navigate to The Lovers card
2. Press Enter to activate
   ✓ Modal appears
   ✓ Modal title is announced by screen reader (ARIA)
   ✓ Focus moves to first card button

3. Use Tab to navigate between cards
   ✓ Can reach all card options
   ✓ Focus indicator visible on each card

4. Use Arrow Keys (Left/Right or Up/Down)
   ✓ Arrow keys cycle through card selection
   ✓ Wraps around (last -> first, first -> last)

5. Press Enter to select a card
   ✓ Card is visually selected (checkmark/highlight)
   ✓ Screen reader announces selection

6. Tab to Confirm button and press Enter
   ✓ Modal closes
   ✓ Card is added to inventory
   ✓ Focus returns to The Lovers card in circle

7. Reopen modal and press Escape
   ✓ Modal closes
   ✓ No errors in console
```

#### Test 3: The Hanged Man Modal

```
1. Navigate to The Hanged Man card
2. Press Enter to activate
   ✓ Sacrifice modal appears
   ✓ Inventory list is visible

3. Tab through inventory items
   ✓ Each item can receive focus
   ✓ Can activate with Enter or Space

4. Tab to Confirm button
   ✓ Button is reachable via Tab
   ✓ Button state is announced (enabled/disabled)

5. Press Escape
   ✓ Modal closes
   ✓ Focus returns to The Hanged Man card
```

#### Test 4: The Devil Modal

```
1. Navigate to The Devil card
2. Press Enter to activate
   ✓ Mark sacrifice modal appears
   ✓ Card list is visible

3. Tab through cards with marks
   ✓ Can reach each card button
   ✓ Can select marks with Space or checkbox

4. Verify focus trapping
   ✓ Cannot Tab out of modal
   ✓ Shift+Tab on first element goes to last
   ✓ Tab on last element goes to first

5. Press Escape
   ✓ Modal closes
   ✓ Selection is cancelled
   ✓ No marks are sacrificed
```

#### Test 5: Focus Restoration

```
1. Click on The Lovers card (focus is on card)
2. Press Enter to open modal
3. Press Escape to close modal
   ✓ Focus returns to The Lovers card
   ✓ Screen reader announces you're back on the card
```

#### Test 6: Tooltips

```
1. Tab to any button with tooltip
   ✓ Tooltip appears on focus (after ~200ms delay)
   ✓ Tooltip shows helpful information
   ✓ Tooltip describes the button's action

2. Tab away from button
   ✓ Tooltip disappears

3. Tab back to button
   ✓ Tooltip appears again

4. While tooltip visible, press Escape
   ✓ Tooltip closes (optional enhancement)
```

---

## Screen Reader Testing

### Setup: NVDA (Windows, Free)

```bash
# Download from:
https://www.nvaccess.org/download/

# Run installer
# Press Ctrl+Alt+N to start/stop
```

### Setup: JAWS (Windows, Commercial)

```
Already installed on most accessible systems
Press Insert+Down or Insert+? for help
```

### Setup: VoiceOver (macOS, Free)

```
Cmd+F5 to toggle VoiceOver
Cmd+U to open rotor
Vo+Left/Right Arrow to navigate
```

### Test Cases with NVDA

#### Test 1: Headings and Structure

```
1. Start NVDA
2. Press H to navigate by headings
   ✓ All major sections have headings (H1, H2)
   ✓ Heading hierarchy is logical (no H1->H3 jumps)
   ✓ Headings describe their content

3. Press R to navigate by regions/landmarks
   ✓ Main content is in <main> landmark
   ✓ Navigation is in <nav> landmark
   ✓ Headers/footers are identified
```

#### Test 2: Button Labels

```
1. Press B to navigate by buttons
2. For each button, check:
   ✓ Button label is announced (not just "button")
   ✓ Labels are descriptive ("Save" not "Click here")
   ✓ Button state is announced ("pressed", "disabled")

3. Tab to disabled button
   ✓ NVDA announces "disabled"
```

#### Test 3: Card Selection (The Lovers)

```
1. Navigate to The Lovers card
2. Press Insert+Space to activate
   ✓ NVDA announces "dialog"
   ✓ Modal title is announced
   ✓ Description is read

3. Press B to find buttons
4. Focus on first card button
   ✓ NVDA announces: "[Card Name]. [Effect]. Button."
   ✓ Marks count is announced if present

5. Press Space to select card
   ✓ NVDA announces: "pressed" or "selected"
   ✓ Screen reader confirms selection

6. Tab to Confirm button
   ✓ Button is announced with its current state
   ✓ NVDA says "not pressed" if confirm is disabled

7. Press Enter
   ✓ Modal closes
   ✓ NVDA announces return focus
```

#### Test 4: Status Announcements

```
1. Perform action that triggers live region update
2. NVDA should automatically announce the update
   ✓ Status message is read without clicking
   ✓ Message is timely (not delayed)
   ✓ Only relevant changes are announced
```

#### Test 5: Tooltips

```
1. Focus on element with tooltip
2. Wait for tooltip to appear (200ms)
   ✓ NVDA announces: "button. [tooltip text]"
   ✓ Tooltip content is part of button description

3. Tab away
   ✓ NVDA stops mentioning tooltip
```

### NVDA Quick Commands

| Command | Result |
|---------|--------|
| **H** | Next heading |
| **Shift+H** | Previous heading |
| **R** | Next region/landmark |
| **B** | Next button |
| **L** | Next link |
| **F** | Next form field |
| **G** | Next graphic/image |
| **Insert+?** | Help |
| **Insert+Down Arrow** | Announce mode |
| **Insert+Space** | Activate button |
| **Insert+Ctrl+Space** | Focus mode |

---

## Automated Testing

### Setup: Lighthouse (Built-in to Chrome)

```
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
4. Check "Accessibility" section
   ✓ Should score 90+
```

### Setup: axe DevTools (Chrome Extension)

```
1. Install: https://www.deque.com/axe/devtools/
2. Open DevTools
3. Go to "Axe DevTools" tab
4. Click "Scan ALL of my page"
5. Review "Violations" section
   ✓ Should be empty
```

### Setup: WAVE (Chrome Extension)

```
1. Install: https://wave.webaim.org/extension/
2. Click WAVE icon
3. Look for red error icons
   ✓ Should be none
4. Check blue information icons
   ✓ Review these for context
```

### Command Line Testing

```bash
# Install pa11y
npm install -g pa11y

# Run accessibility audit
pa11y http://localhost:5173

# Generate report
pa11y http://localhost:5173 > accessibility-report.txt

# Continuous integration
pa11y-ci --runners axe .
```

---

## Color Contrast Testing

### Online Tool

```
1. Go to: https://webaim.org/resources/contrastchecker/
2. Enter foreground color (text): #fda4af
3. Enter background color (bg): #1e293b
4. Check result:
   ✓ Contrast ratio should be 4.5:1 minimum
   ✓ AAA mark (larger value) means better
```

### Browser DevTools

```
1. Right-click element
2. Inspect
3. Go to Computed tab
4. Look for color contrast info (shown automatically)
```

---

## Text Resizing Test

```
1. Zoom page to 200%
   Keyboard: Ctrl++ (hold)
   ✓ All text is readable
   ✓ No overlapping elements
   ✓ No content is cut off
   ✓ Buttons are still clickable

2. Zoom to 300%
   ✓ Single column layout (OK)
   ✓ Still no content loss
```

---

## Mobile Accessibility Test

### iOS with VoiceOver

```
1. Settings > Accessibility > VoiceOver
2. Toggle ON
3. Use gestures:
   - Swipe right: Next element
   - Swipe left: Previous element
   - Double-tap: Activate
   - Two-finger swipe up: Scroll
   ✓ Can navigate entire game
   ✓ All buttons are accessible
   ✓ Modals work correctly
```

### Android with TalkBack

```
1. Settings > Accessibility > TalkBack
2. Toggle ON
3. Use gestures:
   - Swipe right: Next element
   - Swipe left: Previous element
   - Double-tap: Activate
   - Swipe down with two fingers: Scroll
   ✓ Same as iOS tests above
```

---

## Issue Template

When you find an accessibility issue, please report it with:

```markdown
## Accessibility Issue: [Brief Title]

### Severity
- [ ] Critical (blocks all users)
- [ ] Major (blocks some users)
- [ ] Minor (inconvenience)

### WCAG Criteria Affected
- WCAG 2.1 [Section]. [Description]
- e.g., 2.1.1 Keyboard - Button not accessible via Tab

### Description
[What's the issue? Who does it affect?]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [etc.]

### Expected Behavior
[What should happen?]

### Actual Behavior
[What happens instead?]

### Environment
- Screen reader: [e.g., NVDA, JAWS, VoiceOver]
- Browser: [e.g., Chrome, Firefox, Safari]
- OS: [e.g., Windows 10, macOS, iOS]
- Device: [e.g., Desktop, Mobile]

### Screenshot/Video
[If possible, attach screenshot showing the issue]

### Additional Notes
[Any other context?]
```

---

## Checklist: Before Releasing New Feature

- [ ] Keyboard navigation tested (Tab, Shift+Tab, Escape)
- [ ] Screen reader tested (NVDA or JAWS)
- [ ] Focus visible and logical
- [ ] ARIA labels accurate
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Text resizes to 200% without issues
- [ ] No content hidden from screen readers
- [ ] Modal focus trapping works
- [ ] Tooltips are accessible
- [ ] Automated tests pass (Lighthouse 90+, axe 0 violations)
- [ ] Mobile accessibility tested (iOS VoiceOver or Android TalkBack)
- [ ] No keyboard traps
- [ ] Live regions announce updates

---

## Resources

### Tools
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Remember: Accessibility is not a feature—it's a fundamental right.** ♿
