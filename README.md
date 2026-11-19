# Kollam District Sahodaya Cuties' Fest 2026–27 – Live Scoreboard

Complete competition management and real-time live scoreboard web application for **Kollam District Sahodaya Cuties' Fest 2026–27**.

## Features & Architecture

- **20 Official Participating Schools** with independent Category I (`LKG & UKG`) and Category II (`Class I & II`) participation flags and derived point breakdowns.
- **23 Official Competition Events**:
  - **Category I (LKG & UKG)**: 2 Off Stage, 4 On Stage, 1 Group Item (7 events).
  - **Category II (Class I & II)**: 3 Off Stage, 11 On Stage, 2 Group Items (16 events).
- **Canonical Grading & Scoring Engine (`src/lib/scoring/index.ts`)**:
  - **Grades**: `70%+` → Grade A, `60–69%` → Grade B, `50–59%` → Grade C, `49% & below` → No Grade (`0` total points).
  - **Individual Events**: Grade points (`A=5, B=3, C=1`) + Place points (`1st=5, 2nd=3, 3rd=1`).
  - **Group Items**: Grade points (`A=10, B=6, C=2`) + Place points (`1st=10, 2nd=6, 3rd=2`).
  - **Unplaced / Pending Rule**: Unplaced participants with a grade remain pending/unawarded (`0` points) per organizer rules.
  - **Tie Handling**: Allows authorized scorers to record tied placements with an explicit confirmation and `TIE` indicator while preserving exact points.
- **Firebase Firestore & Security Rules**:
  - Real-time Firestore `onSnapshot` subscriptions for `schools`, `events`, and `results`.
  - Complete Firestore Security Rules (`firestore.rules`) and composite indexes (`firestore.indexes.json`).
  - Default Admin Login Password: `sahodaya2026` (configurable via `NEXT_PUBLIC_ADMIN_PASSWORD` or Admin Settings).

## Quick Commands

```bash
npm install
npm run test:scoring
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

