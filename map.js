// Services map. Data comes from data/services.js (the SERVICES array).

const UNSPECIFIED = "Not yet categorized";
const SF_CENTER = [37.7749, -122.4194];

const map = L.map("map").setView(SF_CENTER, 12);
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19,
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
const markersById = new Map();

const state = { query: "", type: "All" };

const els = {
  search: document.getElementById("search"),
  chips: document.getElementById("chips"),
  results: document.getElementById("results"),
  count: document.getElementById("count"),
};

// Build the list of service types from the data.
function allTypes() {
  const types = new Set();
  let hasUnspecified = false;
  SERVICES.forEach((s) => {
    if (s.services.length === 0) hasUnspecified = true;
    s.services.forEach((t) => types.add(t));
  });
  const list = ["All", ...[...types].sort()];
  if (hasUnspecified) list.push(UNSPECIFIED);
  return list;
}

function matches(s) {
  const q = state.query.trim().toLowerCase();
  if (q && !(s.name + " " + s.address).toLowerCase().includes(q)) return false;
  if (state.type === "All") return true;
  if (state.type === UNSPECIFIED) return s.services.length === 0;
  return s.services.includes(state.type);
}

// Build DOM with textContent (never innerHTML) so data can't inject markup.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function popupContent(s) {
  const box = el("div", "popup");
  box.appendChild(el("h3", "", s.name));
  box.appendChild(el("p", "", s.address));
  if (s.services.length) {
    const ul = el("ul");
    s.services.forEach((t) => ul.appendChild(el("li", "", t)));
    box.appendChild(ul);
  } else {
    box.appendChild(el("p", "pending", "Service details not yet added"));
  }
  const link = el("a", "", "Get directions");
  link.href = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  box.appendChild(link);
  return box;
}

function makeMarker(s) {
  const m = L.circleMarker([s.lat, s.lng], {
    radius: 10, weight: 2, color: "#ffffff",
    fillColor: "#1e6f7c", fillOpacity: 0.95,
  });
  m.bindPopup(popupContent(s));
  m.bindTooltip(s.name);
  m.on("click", () => setActive(s.id));
  return m;
}

function setActive(id) {
  document.querySelectorAll(".result-btn").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.id) === id);
  });
  markersById.forEach((m, mid) => {
    m.setStyle({ fillColor: mid === id ? "#c8442b" : "#1e6f7c" });
    if (mid === id) m.bringToFront();
  });
}

function selectLocation(s) {
  const m = markersById.get(s.id);
  map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  m.openPopup();
  setActive(s.id);
}

function renderChips() {
  els.chips.replaceChildren();
  allTypes().forEach((t) => {
    const b = el("button", "chip", t);
    b.type = "button";
    b.setAttribute("aria-pressed", String(state.type === t));
    b.addEventListener("click", () => { state.type = t; renderChips(); render(); });
    els.chips.appendChild(b);
  });
}

function render() {
  markerLayer.clearLayers();
  markersById.clear();
  els.results.replaceChildren();

  const shown = SERVICES.filter(matches);
  els.count.textContent = `${shown.length} of ${SERVICES.length} locations`;

  if (shown.length === 0) {
    els.results.appendChild(el("li", "no-results", "No locations match. Try a different search or service type."));
    return;
  }

  shown.forEach((s) => {
    const marker = makeMarker(s);
    markersById.set(s.id, marker);
    markerLayer.addLayer(marker);

    const li = el("li");
    const btn = el("button", "result-btn");
    btn.type = "button";
    btn.dataset.id = s.id;
    btn.appendChild(el("span", "result-name", s.name));
    btn.appendChild(el("span", "result-addr", s.address));
    btn.appendChild(
      s.services.length
        ? el("span", "result-svc", s.services.join(", "))
        : el("span", "result-svc pending", "Service details not yet added")
    );
    btn.addEventListener("click", () => selectLocation(s));
    li.appendChild(btn);
    els.results.appendChild(li);
  });

  map.fitBounds(L.latLngBounds(shown.map((s) => [s.lat, s.lng])), { padding: [50, 50], maxZoom: 15 });
}

els.search.addEventListener("input", (e) => { state.query = e.target.value; render(); });

renderChips();
render();
