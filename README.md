# Opioids in San Francisco

Static website (no build step). Pages:

- `index.html` – landing page
- `map.html` – opioid services map (Leaflet + OpenStreetMap/CARTO tiles)

## Updating the map
Edit `data/services.js`. Each location needs `name`, `address`, `services` (a list; use `[]` if unknown), `lat`, and `lng`.

## Running locally
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Publishing with GitHub Pages
1. Push this folder's contents to the root of a GitHub repository.
2. In the repo, go to Settings > Pages.
3. Under "Build and deployment", set Source to "Deploy from a branch", choose `main` and `/ (root)`, and save.
4. After a minute or two the site is live at `https://<your-username>.github.io/<repo-name>/`.
