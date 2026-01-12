# UI Implementation Guide - Card Effects

## Overview

This document describes the UI components created and integrated for interactive card effects.

---

## Components Created/Updated

### 1. **ChoiceModal.tsx** (Updated)
**Purpose:** Handle The Lovers card choice selection  
**Location:** `/components/ChoiceModal.tsx`

**Features:**
- Display 2-4 card options (base + synergy bonuses)
- Visual selection feedback with checkmark and glow effect
- Rose-themed styling (💕 The Lovers theme)
- Confirmation button (disabled until selection made)
- Shows selected card preview

**User Flow:**
1. Player clicks on The Lovers card in circle
2. Modal appears with 2-4 random card choices
3. Player clicks on desired card (visual selection feedback)
4. Click "Confirmar Escolha" to add card to inventory
5. The Lovers card becomes blank card with inherited marks

**Synergies:**
- LOVERS_BLANK: +1 extra choice per blank card in circle
- LOVERS_BLANK (empowered): +1 additional choice if 2+ blank cards

---

### 2. **HangedManSacrifice.tsx** (Already Existed)
**Purpose:** Handle The Hanged Man sacrifice selection via drag-and-drop  
**Location:** `/components/HangedManSacrifice.tsx`

**Features:**
- Drag-and-drop UI for card selection
- Real-time payout calculation: `((n+1)*n/2)*50`
- Visual separation between inventory and sacrifice area
- Sacrifice confirmation with final payout display

**User Flow:**
1. Player clicks on The Hanged Man card
2. Sacrifice modal opens with split view
3. Player drags cards from inventory to sacrifice area
4. Payout previews in real-time
5. Player confirms sacrifice
6. Cards disappear, payout delivered after 1 lunar cycle (168 hours)

**Properties:**
- Acumulativo (accumulates sacrifices over time)
- Permanente (payout is permanent, not one-time)
- Reciclável (effect is individual, can be used multiple times)

---

### 3. **TheDevilModal.tsx** (New)
**Purpose:** Handle The Devil mark sacrifice with curse and reward selection  
**Location:** `/components/TheDevilModal.tsx`

**Features:**
- Filter cards with available marks
- Select up to 2 marks from different cards
- Visual curse preview (3 types: Isolated, Volatile, Temporal)
- Reward preview with real-time generation
- Visual feedback for selections

**Curse Types:**
1. **ISOLATED** 🔗
   - No bonuses from adjacent cards
   - +50% own production
   - Used as penalty for mark consumption

2. **VOLATILE** ⚡
   - Alternates every lunar cycle between:
     - +200% resources
     - +0.2 sync/cycle
     - -0.2 cycles/cycle adjacent
   - Unpredictable but potentially high reward

3. **TEMPORAL** 🌙
   - Only works on odd/even lunar cycles
   - Effect x3 when active
   - Requires timing awareness

**Rewards (per mark consumed):**
- 33% chance: +250 resources 💰
- 33% chance: +5 permanent sync bonus ⚡
- 33% chance: +1 effect multiplier 📈
- 50% chance: Double reward generation

**User Flow:**
1. Player clicks on The Devil card
2. Modal shows all cards with marks
3. Player selects up to 2 marks (visual selection)
4. Preview shows curse types and reward rolls
5. Click "Confirmar Sacrifício"
6. Marks consumed, curses applied, rewards distributed

---

## Integration Points

### App.tsx Changes

```typescript
// New state for Devil interaction
const [devilSacrificeState, setDevilSacrificeState] = useState<{ isOpen: boolean; sourceSlot: number } | null>(null);

// In handleActivateEffect():
if (cardData.effectId === 'THE_DEVIL') {
  setDevilSacrificeState({ isOpen: true, sourceSlot: slotIndex });
  return;
}

// Handler for Devil sacrifices
const handleConfirmDevilSacrifice = (selected: { cardInstanceId: string; markIndex: number }[]) => {
  // Process mark removal, apply curses, generate rewards
};

// Render component
{devilSacrificeState?.isOpen && (
  <TheDevilModal
    inventory={inventory}
    onConfirm={handleConfirmDevilSacrifice}
    onCancel={() => setDevilSacrificeState(null)}
  />
)}
```

### Types.ts Changes

Added new fields to `CardInstance`:
```typescript
// The Hanged Man state
hangedManActive?: boolean;
hangedManConsumes?: number;
hangedManActivatedAt?: number;

// The Tower state
towerArcanoActive?: boolean;
```

---

## Visual Design

### Color Scheme
- **The Lovers:** Rose theme (border-rose-700, text-rose-300)
- **The Hanged Man:** Purple theme (border-purple-800, text-purple-300)
- **The Devil:** Red theme (border-red-700, text-red-400)

### Common Elements
- Dark backdrop (bg-black/80)
- Blur effect (backdrop-blur-sm)
- Z-index 50 for modals
- Smooth transitions
- Responsive grid layouts

---

## Testing Checklist

- [ ] The Lovers: Select card, becomes blank with marks
- [ ] The Lovers: Synergy adds extra choices
- [ ] The Hanged Man: Drag cards to sacrifice area
- [ ] The Hanged Man: Payout calculates correctly
- [ ] The Hanged Man: Payout delivered after 1 lunar cycle
- [ ] The Devil: Select marks (max 2)
- [ ] The Devil: Preview shows curses correctly
- [ ] The Devil: Rewards generate correctly
- [ ] The Devil: Curses apply to marked cards
- [ ] All: Modals close on cancel
- [ ] All: State updates properly in slots/inventory

---

## Future Enhancements

1. **Animation Polish**
   - Card draw animations for Lovers choices
   - Particle effects for sacrifice
   - Curse application animation

2. **Sound Design**
   - Card selection sounds
   - Reward generation SFX
   - Curse application sounds

3. **Mobile Optimization**
   - Touch-friendly drag-and-drop
   - Larger touch targets
   - Simplified layouts for small screens

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - High contrast mode support
