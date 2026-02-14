# Living Map of San Francisco

## Overview
A hackathon prototype that lets users drop persona markers on an interactive map of San Francisco. Click anywhere to define "who you are in this city" — a pulsing marker appears, and after the backend responds, it becomes a glowing pink marker with a video popup.

## Tech Stack
- **Backend**: Python 3.11 / Flask
- **Frontend**: HTML, CSS, Vanilla JS
- **Map**: Leaflet.js with CartoDB Positron tiles

## Project Structure
```
app.py                 # Flask backend with /generate and /identities routes
templates/index.html   # Main HTML page
static/script.js       # Map logic, modal, marker management
static/style.css       # Soft pink, rounded, modern styling
```

## Key Routes
- `GET /` — Serves the map page
- `POST /generate` — Accepts `{ prompt, lat, lng }`, returns persona + video URL
- `GET /identities` — Returns all stored personas

## Future Integration
- The `generate_persona_video()` function in `app.py` is marked with a TODO for MiniMax API integration
- The function is isolated so it can be swapped without touching route logic

## Running
- Flask dev server on `0.0.0.0:5000`
