# Fraction Calculator

A fast, offline-friendly calculator for construction measurements. It works
with **feet, inches and fractions** (imperial) or **meters and millimeters**
(metric), and instantly shows the answer in every unit you might need.

**Live app:** https://jaigansa.github.io/fcalc/

---

## How to use it

### 1. Pick a unit system

Use the toggle at the top right to switch between:

- **Imperial** — enter **Feet**, **Inches**, and a **fraction**
- **Metric** — enter **Meters**, **Centimeters**, and **Millimeters**

### 2. Enter a measurement

**Imperial example — type `5` feet, `10` inches, and `1/4` inch:**

- **Feet** → `5`
- **Inches** → `10 1/4` (you can type it directly, like `10 1/4`)
- **Fraction** → pick from the dropdown (`1/4`, `1/2`, `3/4`, `1/8`, ...),
  or just type it into the Inches box. The dropdown changes based on the
  precision you select.

Only a fraction of an inch? Leave **Feet** blank and type something like
`3/4` in **Inches**.

**Metric example — type `1` meter, `23` centimeters, `4` millimeters:**

- **Meters** → `1`
- **Centimeters** → `23`
- **Millimeters** → `4`

### 3. Add, subtract, multiply or divide

Use the **+ − × ÷** buttons (or your keyboard: `+`, `-`, `*`, `/`).

- After **+** or **−**, enter another measurement (feet/inches or meters).
- After **×** or **÷**, the app switches to a plain **Number** field — enter a
  regular number, like `2` or `3.5`. This is great for things like "how many
  for a repeating layout" or "divide this board into 4 equal parts."

Press **=** (or `Enter`) to see the result.

### 4. Read the results

The results panel shows the same answer in several units at once:

| Result            | Example                     |
| ----------------- | --------------------------- |
| **Feet & Fraction** | `5' 10 1/4"` (the main one) |
| **Total Inches**    | `70.25"`                    |
| **Total Feet**      | `5.8542'`                   |
| **Metric**          | `1784 mm · 178.4 cm`        |
| **Nool**            | `562 Nool` (1 Nool = 1/8")  |

Tap the copy button next to any result to copy it.

### 5. Fine-tune precision

Use the **precision selector** to choose how fractions are shown and entered:
`1/4`, `1/8`, `1/16`, `1/32`, or `1/64` inch. Fractions are always reduced to
their simplest form (e.g. `4/16` shows as `1/4`).

---

## Other useful things

- **Tape view** — tap the big display to see a visual ruler of your current
  measurement. Tap again to go back.
- **Save to History** — saves the current calculation. History is kept on your
  device (no account needed). Tap a saved entry to restore it, or use
  **Clear** to wipe the list.
- **Dark / light theme** — toggle with the sun/moon button; your choice is
  remembered.
- **Works offline** — the app is a PWA. On your phone you can **Add to Home
  Screen** to install it like an app; it works with no internet connection.
- **Keyboard shortcuts** — `+` `-` `*` `/` for operations, `Enter` for equals,
  `Esc` or `C` to clear. The keypad buttons type into whichever field is
  focused.

---

## Example walkthrough

> You're building a frame and need 4 boards, each `2' 6 3/8"` long.

1. Type `2` in **Feet** and `6 3/8` in **Inches**.
2. Press **×**, then type `4` in the **Number** field.
3. Press **=**.

Result: **`10' 1 1/2"`** (plus inches, feet, metric and Nool equivalents).

---

## For developers

```bash
npm install       # install dependencies
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run test      # run the test suite
npm run preview   # preview the production build locally
```

The project is a React + TypeScript + Vite app. Measurements are parsed and
converted in `src/lib/` (see `fraction.ts`, `units.ts`, `parse.ts`, `calc.ts`).
