# 💧 Hydrate

A minimal water intake tracker. Log your glasses through the day, set gentle reminders, and get a small celebration when you reach your goal of 8 glasses.

**[▶ Live demo](https://YOUR-USERNAME.github.io/hydrate-water-tracker/)**

<p align="center">
  <img src="screenshots/tracker.png" width="250" alt="Tracker at 0 glasses">
  <img src="screenshots/progress.png" width="250" alt="Progress ring at 5 of 8 glasses with reminders on">
  <img src="screenshots/celebration.png" width="250" alt="Celebration screen with confetti">
</p>

## Features

- **Daily counter** with an animated circular progress ring (goal: 8 glasses)
- **Add or remove** glasses; the count is saved in the browser and resets every day
- **Reminders** every 30 minutes, 1 hour or 2 hours, using browser notifications with an in-page toast as a fallback
- **Celebration screen** with confetti when you reach 8 glasses (shown once per day)
- **Smooth, minimal UI** that works on phones and desktops and respects the "reduce motion" setting

## Built with

HTML, CSS and vanilla JavaScript. No frameworks, no build step and no dependencies. Your data never leaves your browser (it is stored in `localStorage`).

## Run it locally

```bash
git clone https://github.com/YOUR-USERNAME/hydrate-water-tracker.git
cd hydrate-water-tracker
python -m http.server 8000
```

Then open <http://localhost:8000>. You can also just double-click `index.html`; serving it over `localhost` (or HTTPS) is only needed for real system notifications.

## Project structure

```
hydrate-water-tracker/
├── index.html      # page structure
├── style.css       # layout, animations, celebration view
├── app.js          # counter, progress ring, reminders, confetti
└── screenshots/    # images used in this README
```

## How it works

- **Progress ring:** an SVG circle whose `stroke-dashoffset` is updated as the count changes; CSS handles the smooth fill.
- **Saving:** today's date, count and celebration status are stored in `localStorage`. A new day starts at 0 automatically, even if the tab was left open overnight.
- **Reminders:** a `setInterval` timer fires a notification (or a toast if notifications are blocked or unsupported). The chosen interval is remembered.
- **Confetti:** drawn by hand on a `<canvas>`, about 3 seconds long, and skipped for people who prefer reduced motion.

## Limitations

Reminders only fire while the page is open in a browser tab. True background reminders would need push notifications and a server.

## Ideas for later

- Custom daily goal
- Weekly history chart
- Installable app (PWA) with offline support
