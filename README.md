# Gather - Celebration & Event Planner
GenAI planner for weddings, birthdays and community events: budget breakdown, timeline, vendor checklist and ideas.

## Run
    pip install -r requirements.txt
    export GEMINI_API_KEY=...   # from aistudio.google.com
    python app.py
## Test
    pytest
## Design notes
Key stays server-side; inputs validated; rate-limited; CSP headers; DOM built with textContent (no XSS); semantic, keyboard-accessible, screen-reader friendly UI.
