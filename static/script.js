/* ── Living Map of San Francisco ──────────────────────────── */

// ── Map initialisation ──────────────────────────────────────
const map = L.map("map", {
  center: [37.7749, -122.4194],
  zoom: 13,
  zoomControl: true,
});

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> &mdash; ' +
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }
).addTo(map);

// ── DOM references ──────────────────────────────────────────
const modalOverlay = document.getElementById("modal-overlay");
const personaInput = document.getElementById("persona-input");
const btnSubmit = document.getElementById("btn-submit");
const btnCancel = document.getElementById("btn-cancel");

// Clicked coordinates waiting for modal submission
let pendingLatLng = null;

// ── Leaflet icon factories ──────────────────────────────────

function makePulseIcon() {
  return L.divIcon({
    className: "",
    html: '<div class="pulse-marker"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function makeGlowIcon() {
  return L.divIcon({
    className: "",
    html: '<div class="glow-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// ── Build popup HTML for a persona marker ───────────────────
function popupHTML(persona, videoUrl) {
  return (
    '<div class="persona-popup">' +
    '<div class="persona-text">' + escapeHtml(persona) + "</div>" +
    "<video src=\"" + videoUrl + '" autoplay loop muted playsinline ' +
    'style="max-width:240px;"></video>' +
    "</div>"
  );
}

function escapeHtml(text) {
  const el = document.createElement("span");
  el.textContent = text;
  return el.innerHTML;
}

// ── Place a permanent persona marker on the map ─────────────
function addPersonaMarker(lat, lng, persona, videoUrl) {
  const marker = L.marker([lat, lng], { icon: makeGlowIcon() }).addTo(map);
  marker.bindPopup(popupHTML(persona, videoUrl), {
    maxWidth: 280,
    minWidth: 220,
    closeButton: true,
  });
}

// ── Load existing identities from server ────────────────────
async function loadIdentities() {
  try {
    const res = await fetch("/identities");
    const data = await res.json();
    data.forEach(function (id) {
      addPersonaMarker(id.lat, id.lng, id.persona, id.video_url);
    });
  } catch (err) {
    console.error("Failed to load identities:", err);
  }
}

loadIdentities();

// ── Map click → open modal ──────────────────────────────────
map.on("click", function (e) {
  pendingLatLng = e.latlng;
  personaInput.value = "";
  modalOverlay.classList.remove("hidden");
  personaInput.focus();
});

// ── Modal: Cancel ───────────────────────────────────────────
btnCancel.addEventListener("click", function () {
  modalOverlay.classList.add("hidden");
  pendingLatLng = null;
});

// Close modal on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
    modalOverlay.classList.add("hidden");
    pendingLatLng = null;
  }
});

// ── Modal: Submit ───────────────────────────────────────────
btnSubmit.addEventListener("click", submitPersona);
personaInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") submitPersona();
});

async function submitPersona() {
  const prompt = personaInput.value.trim();
  if (!prompt || !pendingLatLng) return;

  const lat = pendingLatLng.lat;
  const lng = pendingLatLng.lng;

  modalOverlay.classList.add("hidden");

  const loadingMarker = L.marker([lat, lng], { icon: makePulseIcon() }).addTo(map);
  loadingMarker.bindTooltip("Sprinkling magic\u2026", {
    permanent: true,
    direction: "top",
    className: "loading-tooltip",
    offset: [0, -14],
  });

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt, lat: lat, lng: lng }),
    });

    const data = await res.json();

    map.removeLayer(loadingMarker);

    if (data.status === "success") {
      addPersonaMarker(lat, lng, data.persona, data.video_url);
    } else {
      alert("Something went wrong: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    map.removeLayer(loadingMarker);
    alert("Network error — please try again.");
    console.error(err);
  }

  pendingLatLng = null;
}
