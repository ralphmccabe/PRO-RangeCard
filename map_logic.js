// TACTICAL MAP LOGIC
// Uses Leaflet.js + Esri World Imagery

// Explicitly attach to window to ensure watchdog sees it
window.map = null;
window.shooterMarker = null;
window.targetMarkers = [];
window.rangeLines = [];
let useMeters = false; // Default to Yards
let mapPathMode = false; // False = Radial (Shooter->All), True = Chain (Shooter->T1->T2...)

console.log(">> MAP_LOGIC_JS LOADED <<");

window.initSatelliteMap = function (forceReinit = false) {
    // VISUAL DEBUGGER
    const dbg = document.getElementById('map-debug-overlay');
    if (dbg) dbg.innerHTML += `<div class="text-blue-400 font-bold">>> EXEC: initSatelliteMap (V3)</div>`;

    console.log("[MAP_LOGIC] initSatelliteMap trigger...");
    const container = document.getElementById('tactical-map-container');
    if (!container) {
        if (dbg) dbg.innerHTML += `<div class="text-red-500">FAIL: Container not found</div>`;
        console.error("[MAP_LOGIC] Container missing");
        return;
    }

    try {
        // Prevent double init
        if (window.map) {
            window.map.invalidateSize();
            return;
        }

        // Check dependencies
        if (typeof L === 'undefined') throw new Error("Leaflet L is undefined");

        // --- DEFINE ICONS INSIDE FUNCTION TO ENSURE 'L' IS READY ---
        const shooterIcon = L.divIcon({
            className: 'shooter-icon',
            html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        const targetIcon = L.divIcon({
            className: 'target-icon',
            html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border: 2px solid white; transform: rotate(45deg); box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        // Default View
        window.map = L.map('tactical-map-container', {
            zoomControl: false,
            attributionControl: false
        }).setView([37.0902, -95.7129], 4);

        // Add Esri Satellite Tiles
        if (L.esri) {
            L.esri.basemapLayer('Imagery').addTo(window.map);
            L.esri.basemapLayer('ImageryLabels').addTo(window.map);
        } else {
            // Fallback to OSM
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(window.map);
        }

        // Add Zoom Control
        L.control.zoom({
            position: 'topright'
        }).addTo(window.map);

        // Add Shooter Marker
        console.log("[MAP_LOGIC] Adding Shooter Marker...");
        window.shooterMarker = L.marker(window.map.getCenter(), {
            icon: shooterIcon,
            draggable: true,
            zIndexOffset: 1000
        }).addTo(window.map);

        // Events
        window.shooterMarker.on('drag', function (e) { updateRangeLines(); });
        window.shooterMarker.on('dragend', function (e) { updateRangeLines(); });
        window.map.on('click', function (e) { addTargetMarker(e.latlng, targetIcon); });

        // Locate
        window.map.locate({ setView: true, maxZoom: 18 });
        window.map.on('locationfound', function (e) {
            window.shooterMarker.setLatLng(e.latlng);
        });

        console.log("[MAP_LOGIC] Map Initialized Successfully.");

    } catch (err) {
        console.error("[MAP_LOGIC] CRITICAL ERROR:", err);
        // Log to debug overlay if exists
        const dbg = document.getElementById('map-debug-overlay');
        if (dbg) dbg.innerHTML += `<div class="text-red-500 font-bold">ERROR: ${err.message}</div>`;
    }
};

// Force resize fix when tab is opened
// Force resize fix when tab is opened
window.refreshMapSize = function () {
    if (window.map) {
        setTimeout(() => {
            window.map.invalidateSize();
        }, 300);
    }
}

function addTargetMarker(latlng, iconObj) {
    if (!iconObj) {
        // Fallback if not passed
        iconObj = L.divIcon({
            className: 'target-icon',
            html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border: 2px solid white; transform: rotate(45deg); box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
    }

    const marker = L.marker(latlng, {
        icon: iconObj,
        draggable: true
    }).addTo(window.map);

    // Remove on click
    marker.on('click', function () {
        window.map.removeLayer(marker);
        window.targetMarkers = window.targetMarkers.filter(m => m !== marker);
        updateRangeLines();
    });

    marker.on('drag', function () {
        updateRangeLines();
    });

    window.targetMarkers.push(marker);
    updateRangeLines();
}

window.toggleMapPathMode = function () {
    mapPathMode = !mapPathMode;
    const btn = document.getElementById('btn-map-link');
    if (btn) {
        if (mapPathMode) {
            btn.innerHTML = `<i data-lucide="link" class="w-3 h-3"></i> CHAIN`;
            btn.classList.remove('bg-zinc-800', 'text-zinc-400');
            btn.classList.add('bg-blue-600', 'text-white');
            window.showToast("Mode: CHAIN (Target to Target)");
        } else {
            btn.innerHTML = `<i data-lucide="circle-dot" class="w-3 h-3"></i> RADIAL`;
            btn.classList.add('bg-zinc-800', 'text-zinc-400');
            btn.classList.remove('bg-blue-600', 'text-white');
            window.showToast("Mode: RADIAL (Shooter to All)");
        }
        if (window.lucide) window.lucide.createIcons();
    }
    updateRangeLines();
};

function updateRangeLines() {
    if (!window.shooterMarker) return;

    // Clear old lines
    window.rangeLines.forEach(line => window.map.removeLayer(line));
    window.rangeLines = [];

    const shooterPos = window.shooterMarker.getLatLng();
    let previousPos = shooterPos; // Start chain at shooter

    window.targetMarkers.forEach((target, index) => {
        const targetPos = target.getLatLng();

        // Determine Start Point based on Mode
        let startPos;
        if (mapPathMode) {
            startPos = previousPos; // Chain: T(i-1) -> T(i)
        } else {
            startPos = shooterPos;  // Radial: Shooter -> T(i)
        }

        // Calculate Distance
        // Leaflet distanceTo returns Meters
        const distMeters = startPos.distanceTo(targetPos);
        const distYards = distMeters * 1.09361;

        const displayDist = useMeters ? distMeters : distYards;
        const unitLabel = useMeters ? 'm' : 'y';

        // Calculate Ballistics
        let holdStr = "";
        if (window.BallisticEngine && window.getTacticalContext) {
            const context = window.getTacticalContext('smart'); // Pulls from OWC inputs automatically
            const range = useMeters ? distMeters : distYards;

            // Calculate Solution
            const solution = window.BallisticEngine.calculate(context.profile, context.weather, range);

            // Format: 1.2U 0.4R
            const elev = parseFloat(solution.elevMil);
            const wind = parseFloat(solution.windMil);
            const eDir = elev >= 0 ? "U" : "D";
            const wDir = wind >= 0 ? "R" : "L"; // Simplified wind assumption or just magnitude

            // We need to know wind direction relative to shot, but for now let's just show the raw solution 
            // or if the engine handles relative wind, use that.
            // updateOWC handles relative wind logic.
            // For map, we might need to be smarter, but let's start with basic Holds.

            holdStr = ` <span class="text-blue-300 font-bold">| ${Math.abs(elev).toFixed(1)}${eDir}</span>`;
        }

        // Draw Line
        const line = L.polyline([startPos, targetPos], {
            color: 'white',
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 10'
        }).addTo(window.map);

        // Add Tooltip (Permanent Label)
        line.bindTooltip(`${displayDist.toFixed(1)}${unitLabel}${holdStr}`, {
            permanent: true,
            direction: 'center',
            className: 'range-label'
        }).openTooltip();

        window.rangeLines.push(line);
        previousPos = targetPos; // Update for next link in chain
    });

    // Update Layout UI value (showing last segment)
    if (window.targetMarkers.length > 0 && window.rangeLines.length > 0) {
        // Just show "Active" or count
        const distDisplay = document.getElementById('map-dist-val');
        if (distDisplay) {
            distDisplay.innerHTML = `${window.targetMarkers.length} <span class="text-xs text-blue-500">TGTs</span>`;
        }
    }
}


window.toggleMapUnits = function () {
    useMeters = !useMeters;
    updateRangeLines();
    // Update button text if we had one
}

window.clearMapTargets = function () {
    window.targetMarkers.forEach(m => window.map.removeLayer(m));
    window.targetMarkers = [];
    updateRangeLines();

    // Reset Display
    const distDisplay = document.getElementById('map-dist-val');
    if (distDisplay) {
        distDisplay.innerHTML = `0.0 <span class="text-xs text-blue-500">${useMeters ? 'METERS' : 'YDS'}</span>`;
    }
}

// Attach to global scope for reset button
window.tacticalMapHardReset = function () {
    if (window.map) {
        window.map.remove();
        window.map = null;
        window.targetMarkers = [];
        window.rangeLines = [];
    }
    // Watchdog will pick it up, or we call it directly
    if (window.initSatelliteMap) window.initSatelliteMap(true);
}
