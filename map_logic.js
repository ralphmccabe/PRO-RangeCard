// TACTICAL MAP LOGIC (V4.9) — Google Satellite + Manual-First Fix

// ── Global State ────────────────────────────────────────────────────────────
window.map = null;
window.shooterMarker = null;
window.targetMarkers = [];
window.rangeLines = [];

// Internal state
let _mapUseMeters = false;
let _mapPathMode = false;
let _mapInitializing = false;
let _mapInitialized = false;
let _mapResizeObserver = null;

// ── Icons (Custom Styled) ───────────────────────────────────────────────────
function _makeShooterIcon() {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            width:22px;height:22px;border-radius:50%;
            background:#3b82f6;border:3px solid #fff;
            box-shadow:0 0 15px rgba(59,130,246,0.8);
            display:flex;align-items:center;justify-content:center;">
            <div style="width:6px;height:6px;background:#fff;border-radius:50%;"></div>
        </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });
}

function _makeTargetIcon() {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            width:18px;height:18px;
            background:#ef4444;border:2px solid #fff;
            transform:rotate(45deg);
            box-shadow:0 0 12px rgba(239,68,68,0.8);">
        </div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
}

// ── Core Initialization ──────────────────────────────────────────────────────
window.initTacticalMap = function (forceReinit = false) {
    if (_mapInitializing) return;
    const container = document.getElementById('tactical-map-container');
    if (!container) return;

    if (window.map && !forceReinit) {
        console.log("[MAP] Map exists, refreshing size...");
        window.refreshMapSize();
        _shoveMapSize();
        return;
    }

    // Full Reset
    if (window.map) {
        try { window.map.remove(); } catch (e) { }
        window.map = null;
        window.shooterMarker = null;
        window.targetMarkers = [];
        window.rangeLines = [];
        container.innerHTML = '';
    }
    if (_mapResizeObserver) {
        _mapResizeObserver.disconnect();
        _mapResizeObserver = null;
    }

    _mapInitializing = true;
    _buildMap(container);
};

// ── Utility: High-Reliability Refresh ─────────────────────────────
// Unlike simple timeouts, this monitors the actual height to ensure 
// Leaflet never "settles" while the container is still hidden or resizing.
// ── Utility: High-Reliability Refresh ─────────────────────────────
// Instead of a high-frequency loop, we use a series of well-timed refreshes.
function _shoveMapSize() {
    if (!window.map) return;

    // Refresh at key intervals to catch layout shifts
    [50, 250, 750, 1500, 2500].forEach(delay => {
        setTimeout(() => {
            if (window.map) {
                window.map.invalidateSize({ animate: false, pan: false });
            }
        }, delay);
    });
}

function _buildMap(container) {
    if (typeof L === 'undefined') {
        console.warn("[MAP] Leaflet (L) not found, retrying...");
        setTimeout(() => _buildMap(container), 200);
        return;
    }

    // HEALTH CHECK: Ensure container is actually visible and has size
    const rect = container.getBoundingClientRect();
    const isVisible = container.offsetParent !== null; // Standard visibility check

    if (!isVisible || rect.width < 50 || rect.height < 50) {
        // RESET FLAG so we can retry
        _mapInitializing = false;
        console.log(`[MAP] Container not ready (${rect.width}x${rect.height}, visible:${isVisible}). Retrying...`);
        setTimeout(() => _buildMap(container), 250);
        return;
    }


    try {
        window.map = L.map(container, {
            zoomControl: false,
            attributionControl: false,
            trackResize: false, // Handled by ResizeObserver
            scrollWheelZoom: true
        }).setView([31.9496, -102.1701], 16);

        // ── Google Satellite Layer ─────────────────────────────────────────
        L.tileLayer('https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(window.map);

        L.control.zoom({ position: 'topright' }).addTo(window.map);

        // ── Resize Observer ────────────────────────────────────────────────
        _mapResizeObserver = new ResizeObserver(() => {
            if (window.map) window.refreshMapSize();
        });
        _mapResizeObserver.observe(container);

        // ── Intersection Observer (High Reliability Visibility) ─────────────
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    console.log("[MAP] High-confidence visibility, refreshing...");
                    // Give it a moment to finish any CSS transitions
                    setTimeout(() => {
                        _shoveMapSize();
                        window.refreshMapSize();
                    }, 50);
                }
            });
        }, { threshold: [0, 0.5, 1.0] });
        visibilityObserver.observe(container);

        // ── Interaction Logic ──────────────────────────────────────────────
        window.map.on('click', function (e) {
            _handleMapClick(e.latlng);
        });

        _updateRangeLines();
        _attachGPSOverlay(container);

        // Final triggers
        _shoveMapSize(2500);
        _mapInitialized = true;
        _mapInitializing = false;

        // Industrial Strength: Trigger global resize event
        window.dispatchEvent(new Event('resize'));

    } catch (err) {
        _mapInitializing = false;
        console.error('[MAP] Initialization failed:', err);
    }
}

// ── Click Logic: 1st click = Shooter, 2nd+ = Target ─────────────────────────
function _handleMapClick(latlng) {
    if (!window.shooterMarker) {
        // Place Firing Position
        console.log("[MAP] Setting Firing Position (Shooter)");
        window.shooterMarker = L.marker(latlng, {
            icon: _makeShooterIcon(), draggable: true, zIndexOffset: 1000
        }).addTo(window.map);
        window.shooterMarker.on('drag dragend', _updateRangeLines);
    } else {
        // Place Target
        console.log("[MAP] Adding Target Position");
        const marker = L.marker(latlng, {
            icon: _makeTargetIcon(), draggable: true
        }).addTo(window.map);

        marker.on('click', function () {
            window.map.removeLayer(marker);
            window.targetMarkers = window.targetMarkers.filter(m => m !== marker);
            _updateRangeLines();
        });

        marker.on('drag dragend', _updateRangeLines);
        window.targetMarkers.push(marker);
    }
    _updateRangeLines();
}

// ── Range Calculation & Display ──────────────────────────────────────────────
function _updateRangeLines() {
    if (!window.map) return;

    // Clear old lines
    window.rangeLines.forEach(line => { try { window.map.removeLayer(line); } catch (e) { } });
    window.rangeLines = [];

    const distEl = document.getElementById('map-dist-val');
    if (!window.shooterMarker) {
        if (distEl) distEl.innerHTML = `<span class="text-blue-400 animate-pulse">TAP MAP TO SET FIRING POSITION</span>`;
        return;
    }

    if (window.targetMarkers.length === 0) {
        if (distEl) distEl.innerHTML = `<span class="text-red-400">TAP MAP TO DROP TARGETS</span>`;
        return;
    }

    const shooterPos = window.shooterMarker.getLatLng();
    let totalDistYds = 0;
    let prevPos = shooterPos;

    window.targetMarkers.forEach((tgt, idx) => {
        const tgtPos = tgt.getLatLng();
        const fromPos = _mapPathMode ? prevPos : shooterPos;

        const distM = fromPos.distanceTo(tgtPos);
        const distYds = distM * 1.09361;
        const distDisplay = _mapUseMeters ? distM : distYds;
        const unit = _mapUseMeters ? 'm' : 'y';
        totalDistYds += distYds;

        const line = L.polyline([fromPos, tgtPos], {
            color: '#fff', weight: 2, dashArray: '5, 8', opacity: 0.7
        }).addTo(window.map);

        line.bindTooltip(`T${idx + 1}: ${distDisplay.toFixed(0)}${unit}`, {
            permanent: true, direction: 'center', className: 'range-label'
        }).openTooltip();

        window.rangeLines.push(line);
        prevPos = tgtPos;
    });

    if (distEl) {
        const totalVal = _mapUseMeters ? (totalDistYds / 1.09361) : totalDistYds;
        const totalUnit = _mapUseMeters ? 'METERS' : 'YDS';
        distEl.innerHTML = `${window.targetMarkers.length} TGT &nbsp; ${Math.round(totalVal)} <span class="text-blue-500 text-[10px]">${totalUnit}</span>`;
    }
}

// ── Sizing System ────────────────────────────────────────────────────────────
window.refreshMapSize = function () {
    if (!window.map) return;

    // Check if container is actually visible before refreshing
    const container = window.map.getContainer();
    if (container && container.offsetParent !== null) {
        // Hard refresh: Invalidate and slightly nudge the view to force tile reload
        const c = window.map.getCenter();
        window.map.invalidateSize({ animate: false, pan: false });
        window.map.setView(c, window.map.getZoom(), { animate: false });

        // Update markers
        if (window.shooterMarker) window.shooterMarker.update();
        if (window.targetMarkers) {
            window.targetMarkers.forEach(t => {
                if (t && typeof t.update === 'function') t.update();
            });
        }
        _updateRangeLines();
    }
};

// ── GPS Overlay Integration ──────────────────────────────────────────────────
function _attachGPSOverlay(container) {
    if (document.getElementById('map-gps-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'map-gps-overlay';
    overlay.style.cssText = `
        position:absolute;inset:0;z-index:500;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);
    `;

    overlay.innerHTML = `
        <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;text-align:center;max-width:280px;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
            <div style="font-size:28px;margin-bottom:12px;">📡</div>
            <p style="color:#f1f5f9;font-weight:900;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Google Satellite Live</p>
            <p style="color:#94a3b8;font-size:10px;margin-bottom:20px;">Use GPS to auto-center firing position?</p>
            <button id="map-gps-btn" style="background:#2563eb;color:#fff;font-weight:900;font-size:11px;padding:12px 20px;border-radius:6px;border:none;cursor:pointer;width:100%;text-transform:uppercase;" onclick="window.requestMapLocation()">Authorize GPS</button>
            <button style="margin-top:12px;color:#64748b;font-size:10px;background:none;border:none;cursor:pointer;text-decoration:underline;" onclick="document.getElementById('map-gps-overlay').style.display='none'">Manual Placement Only</button>
        </div>
    `;
    container.appendChild(overlay);

    window.requestMapLocation = function () {
        const btn = document.getElementById('map-gps-btn');
        if (btn) btn.textContent = 'LINKING TO SATELLITE...';

        window.map.locate({ setView: true, maxZoom: 18, timeout: 10000 });
    };

    window.map.on('locationfound', function (e) {
        document.getElementById('map-gps-overlay').style.display = 'none';
        if (!window.shooterMarker) {
            window.shooterMarker = L.marker(e.latlng, { icon: _makeShooterIcon(), draggable: true, zIndexOffset: 1000 }).addTo(window.map);
            window.shooterMarker.on('drag dragend', _updateRangeLines);
        } else {
            window.shooterMarker.setLatLng(e.latlng);
        }
        window.map.setView(e.latlng, 18);
        _updateRangeLines();
    });

    window.map.on('locationerror', () => {
        const btn = document.getElementById('map-gps-btn');
        if (btn) btn.textContent = 'GPS DENIED / RETRY';
    });
}

// ── Public API (Buttons) ─────────────────────────────────────────────────────
window.toggleMapUnits = () => { _mapUseMeters = !_mapUseMeters; _updateRangeLines(); };
window.clearMapTargets = () => {
    window.targetMarkers.forEach(m => { try { window.map.removeLayer(m); } catch (e) { } });
    window.targetMarkers = [];
    _updateRangeLines();
};
window.toggleMapPathMode = () => {
    _mapPathMode = !_mapPathMode;
    const btn = document.getElementById('btn-map-link');
    if (btn) btn.innerHTML = _mapPathMode ? '<i data-lucide="link" class="w-3 h-3"></i> CHAIN' : '<i data-lucide="circle-dot" class="w-3 h-3"></i> RADIAL';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    _updateRangeLines();
};
window.syncMapRange = () => {
    const distEl = document.getElementById('map-dist-val');
    const match = distEl?.textContent.match(/\d+/);
    const val = match ? parseInt(match[0]) : 0;
    if (val > 0) {
        const input = document.getElementById('owc-range');
        if (input) { input.value = val; if (typeof window.updateOWC === 'function') window.updateOWC(); }
    }
};
window.tacticalMapHardReset = () => window.initTacticalMap(true);
function _showMapError(c, m) { console.error("[MAP] Critical failure:", m); }
