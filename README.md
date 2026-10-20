# FlowState – The Adaptive Fluid Routine & Focus Planner

> **Fixing calendar guilt**: Traditional planners break the moment you start 20 minutes late or a task runs overtime. **FlowState** treats time as fluid blocks that dynamically shift, slide, and adapt throughout your day, paired with a distraction-free "Now & Next" focus HUD.

---

## 🌟 Key Features

### 1. Manual Task Scheduling & Interactive Analog Clock
- **Direct Task Creation:** Add tasks manually without requiring prompt/quick-dump text.
- **Interactive Analog Clock Picker:**
  - Visual 12-hour circular clock face with interactive dragging and clicking to select hours and minutes.
  - Hour and Minute modes with digital readout and smooth hand animations.
  - AM / PM toggle switch.
  - **Ahead-Only Date Enforcement:** Date picker strictly enforces today and future dates (`min="today"`).
  - Past-time protection: If an earlier time today is selected, it alerts the user and provides 1-click snapping to current time.
  - Quick forward buttons (`Now`, `+15m`, `+30m`, `+1h`).
- **Clean Slate (Zero Dummy Data):** Starts fresh with an empty schedule ready for your personal plan.

### 2. "Time is Up! Take Some Break" & Adaptive Break Engine
- **Smart Completion Transition:**
  - When the focus timer reaches zero (or when you complete a session early), a celebratory and restorative break modal automatically guides you to recharge.
- **Duration-Based Break Rules:**
  - ⚡ **30m or below tasks:** Only **5 mins** micro-break is allowed to maintain flow momentum without derailing your schedule.
  - 🌿 **Tasks between 31m and 59m:** Choose between **5 mins** and **10 mins** breaks.
  - 🌟 **1-Hour or longer deep sessions:** You can choose between **5, 10, or 15 mins** restorative recharge blocks.
- **Guided 4-4 Box Breathing:**
  - An expanding/contracting breathing orb guides you through calming inhalation, holding, exhalation, and rest.
- **Self-Care Checkpoints:**
  - Hydration reminder (drink cold water), 20-20-20 eye gaze rule, and spine/neck stretch recommendations.
- **1-Click Launch:**
  - Starting the break immediately inserts and runs an animated live break timer with a soothing emerald aesthetic, dynamically adjusting the rest of your timeline without anxiety.

### 3. Dynamic "Auto-Shift" Timeline Engine
- **Non-destructive Time Shifting:**
  - `+5m` / `+15m` / `+30m`: 1-click time extensions without breaking down the rest of your day.
  - **Snap to Now:** Automatically re-anchors the active task's start time to the current clock, seamlessly sliding downstream tasks. No guilt for starting late.
  - **Push Day Forward (+15m):** Slides all remaining tasks forward when unexpected interruptions occur.
  - **Compress Breaks:** Intelligently shrinks buffer/rest times (e.g., 30m breaks to 15m) to recover lost schedule time while safeguarding deep work blocks.
  - **Skip & Recalculate:** Marks the task skipped and immediately pulls the next task to "Now".
  - **Split Tasks:** Splits a long block into two focused sessions with an automatic 5-minute micro-break.
- **Visual Schedule View:** Interactive vertical timeline with color-coded energy rhythms:
  - 🟣 **Deep Focus:** High-leverage, complex creative work & coding.
  - 🟡 **Shallow / Admin:** Emails, standups, calls, logistics.
  - 🟢 **Recharge / Rest:** Meals, walks, stretching, mind resets.
  - 🔵 **Routine / Chores:** Habits, errands, organization.
- **Live Time Marker:** Sleek real-time glowing line showing the exact current time relative to scheduled blocks.

### 2. "Now & Next" Minimalist Focus HUD
- **Distraction-Free Mode:** Hides the intimidating list of tasks and focuses exclusively on:
  - **Currently Active Task:** Title, energy badge, circular SVG countdown ring with glowing gradient, elapsed/remaining time, percentage progress, and intention notes.
  - **Up Next Sneak Peek:** Preview card of the next task with calculated start time to prepare mental transitions.
- **Micro-Controls:**
  - Pause / Resume timer (`Space`)
  - Complete early (`Complete` button with celebratory confetti & chime)
  - Add 5 minutes (`+` key)
  - Skip & pull next (`N` key)
  - Overtime awareness: If a timer expires, switches to a soft amber overtime counter with quick extension options.
- **Audio Engine (Web Audio API):**
  - **Polyphonic Zen Chime:** Synthesizes a soothing harmonic bell chime when a block completes.
  - **Procedural Ambient Noise Generator:**
    - Brown Noise (deep relaxing rumble)
    - White Noise (crisp focus static)
    - Gentle Rain (modulated pink noise with droplet filter oscillations)
    - Alpha Flow Beats (10Hz binaural alpha wave differential for deep flow)
    - Built-in volume slider with zero external MP3 dependencies.

### 3. Natural Language Quick-Dump Day Parser
- Map your entire day in seconds by pasting natural text:
  ```text
  8:00am Morning workout 45m (routine)
  Breakfast & coffee 30m (rest)
  Deep Work: Build API 2h (high)
  Lunch break 45m (rest)
  Client sync 30m (admin)
  Review PRs & emails 1h (admin)
  Walk & recharge 30m (rest)
  ```
- **Real-Time Live Parsing Preview:** Displays detected task titles, durations, energy badges, and start times before applying.
- **Replace or Append:** Choose whether to start fresh or add blocks to the end of the day.

### 4. 1-Click Routine Presets & Templates
- Built-in routine templates:
  - **Deep Work Sprint (Pomodoro Flow):** 50-minute intense focus blocks separated by 10-minute micro-recharges.
  - **Balanced Workday:** Morning deep focus, midday recharge, afternoon meetings, evening shutdown.
  - **Weekend Reset:** Joyful movement, creative side projects, chores, reading, and relaxation.
  - **Emergency Recovery Sprint:** High-impact 25-minute bursts to regain momentum when overwhelmed.
- **Save Custom Templates:** Save your current day's routine for reuse with 1 click.

### 5. 100% Offline-First & Private Storage
- Saves state instantly to `localStorage`.
- Zero tracking, zero cloud accounts required.
- **Data Portability:** Export and Import backups as clean JSON files or raw text.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Pause / Resume active focus timer |
| <kbd>N</kbd> | Advance to next task (Skip / Pull forward) |
| <kbd>+</kbd> | Add 5 minutes to active task |
| <kbd>F</kbd> | Toggle Fullscreen Focus HUD |
| <kbd>D</kbd> | Open Natural Language Quick-Dump Day parser |
| <kbd>?</kbd> | Open Keyboard Shortcuts cheatsheet |
| <kbd>Esc</kbd> | Close any active modal or exit fullscreen |

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens (Glassmorphism & animations)
- **Icons:** Lucide React
- **State Management:** Zustand with LocalStorage persistence
- **Date Handling:** Date-fns
- **Audio:** Native Web Audio API (Synthesizers for chimes & ambient noise)
- **Confetti:** Canvas-Confetti
