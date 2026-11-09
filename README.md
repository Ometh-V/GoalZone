# GoalZone – Football Hub

A responsive football website Made for fun
Theme: **Sports (Football)**.


## Features

- **Responsive layout** – CSS Grid and Flexbox adapt to phone, tablet and desktop screens.
- **Hamburger navigation** – the menu collapses into a hamburger icon on small screens (pure CSS, no JavaScript needed).
- **Responsive images** – images scale with their container, and the hero uses `<picture>` to load a different image for large and small screens.
- **Live fixtures** – choose a league (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UEFA Champions League) to see its next 3 fixtures, loaded from an online API.
- **Team squads** – choose a league, then a team, to see that team's players. Click a player to open a pop-up with their details (position, nationality, birth date, height, bio where available).
- **Responsive fixtures table** – the table turns into stacked cards on phones.
- **Fan club form** – a simple sign-up form with validation.
- **Fallback data** – if the API cannot be reached, sample fixtures are shown instead and the page says so.

## Project structure

```
GoalZone/
├── index.html          Main page
├── README.md           This file
├── css/
│   └── style.css       All styles (responsive breakpoints at 600px and 900px)
├── js/
│   └── script.js       Fixtures dropdown, team/squad dropdowns, player pop-up
└── images/
    ├── pitch-large.svg Hero image (desktop/tablet)
    ├── pitch-small.svg Hero image (mobile)
    ├── league.svg      Card images
    ├── trophy.svg
    └── stadium.svg
```

## How to run

1. Unzip the project.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox).
3. An **internet connection is needed** for fixtures, teams, squads and player photos.

If the online data fails to load, try serving the folder instead of opening the file directly:

- VS Code: install **Live Server**, right-click `index.html` → _Open with Live Server_, or
- Terminal: run `python -m http.server 8000` in the project folder and visit `http://localhost:8000`.

Ad-blockers or restricted school networks can also block the API requests.

## Technologies

- HTML5, CSS3 (custom properties, Grid, Flexbox, media queries)
- Vanilla JavaScript (`fetch`, async/await, DOM manipulation, `<dialog>`)
- No frameworks or build tools

## Data source

Data comes from [TheSportsDB](https://www.thesportsdb.com) using its free public test key.

| Purpose | Endpoint |
|---|---|
| Next fixture of a league | `eventsnextleague.php?id=<leagueId>` |
| Whole round of fixtures (used for more fixtures and to list a league's teams) | `eventsround.php?id=<leagueId>&r=<round>&s=<season>` |
| Squad of a team | `lookup_all_players.php?id=<teamId>` |

League IDs used: Premier League `4328`, La Liga `4335`, Serie A `4332`, Bundesliga `4331`, Ligue 1 `4334`, Champions League `4480`.

## Known limitations

- The free API key limits results. A team's squad request returns only the **first 10 records** (alphabetical), so full squads, subs and reserves cannot be shown with the free key. The page displays a note when this happens.
- The API has **no lineup or bench data**, so players cannot be labelled as starters or substitutes.
- Some leagues may show fewer than 3 upcoming fixtures out of season or between rounds.
- The free key is rate-limited (about 30 requests per minute), so switching leagues very quickly may cause temporary errors.
- Some players have no photo or biography in the database; those fields are simply left out.
- The `eventsround.php` endpoint is not part of the official public documentation and could change.

## Possible improvements

- Use a paid TheSportsDB key or another API (e.g. football-data.org) for complete squads.
- Save API responses as local JSON files so the site works offline.
- Add league tables and recent results.

## Lab requirements checklist

| Requirement | Where |
|---|---|
| `index.html` with responsive grid layout | `index.html`, `.grid` classes in `css/style.css` |
| Images and text that adapt to screen size | `<picture>` hero, `max-width: 100%` images, media queries |
| Hamburger menu on small screens | `.navbar`, `.hamburger` (collapses below 900px) |
| Responsive design patterns | Mostly-fluid grid, column drop, table-to-cards on mobile |

## Credits

- Match, team and player data: [TheSportsDB](https://www.thesportsdb.com)
- Player photos belong to their respective owners and are loaded from TheSportsDB.
- Hero and card images are simple SVG graphics created for this project.
