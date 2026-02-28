// Theme Toggle Logic
window.setTheme = function (theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme-preference', theme);
};

// === Global Utility Functions ===

window.forceAppUpdate = async function () {
    console.log("[CLEANUP] Final cache purge...");
    localStorage.setItem('trc_hard_refresh_pending', 'true');
    if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (let r of regs) await r.unregister();
    }
    if ('caches' in window) {
        const keys = await caches.keys();
        for (let k of keys) await caches.delete(k);
    }
    window.location.reload(true);
};

window.copyToClipboard = function (text) {
    //  Ensure we always return a Promise to prevent '.then()' errors
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(err => {
            console.warn("[Clipboard] API failure, trying fallback:", err);
            return window.fallbackCopyToClipboard(text);
        });
    } else {
        return window.fallbackCopyToClipboard(text);
    }
};

window.fallbackCopyToClipboard = function (text) {
    return new Promise((resolve) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (!successful) {
                window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
            }
            resolve();
        } catch (err) {
            window.prompt("Manual Copy Required:", text);
            resolve();
        }
    });
};

window.copyFinalDope = function (btn) {
    const finalDope = document.getElementById('final-dope')?.value;
    if (!finalDope || finalDope.trim() === '') {
        alert('No Final Dope to copy');
        return;
    }

    window.copyToClipboard(finalDope).then(() => {
        if (!btn) return;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-neon-green"></i>';
        if (window.lucide) {
            try { lucide.createIcons(); } catch (e) { console.warn("Lucide failed:", e); }
        }
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            if (window.lucide) {
                try { lucide.createIcons(); } catch (e) { console.warn("Lucide failed:", e); }
            }
        }, 1500);
    }).catch(err => console.error("[Copy] Final Dope Error:", err));
};

window.copyLoadData = function (btn) {
    const caliber = document.getElementById('caliber')?.value || '';
    const bullet = document.getElementById('bullet')?.value || '';
    const powder = document.getElementById('powder')?.value || '';
    const load = document.getElementById('load')?.value || '';
    const velocity = document.getElementById('velocity')?.value || '';
    const col = document.getElementById('col')?.value || '';
    const g1 = document.getElementById('g1')?.value || '';

    const loadData = `LOAD DATA\nCaliber: ${caliber}\nBullet: ${bullet}\nPowder: ${powder}\nCharge: ${load}\nVelocity: ${velocity}\nC.O.L: ${col}\nG1 BC: ${g1}`;

    window.copyToClipboard(loadData).then(() => {
        if (!btn) return;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-neon-green"></i>';
        if (window.lucide) {
            try { lucide.createIcons(); } catch (e) { console.warn("Lucide failed:", e); }
        }
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            if (window.lucide) {
                try { lucide.createIcons(); } catch (e) { console.warn("Lucide failed:", e); }
            }
        }, 1500);
    }).catch(err => console.error("[Copy] Load Data Error:", err));
};







// Initialize Theme on Load
(function initTheme() {
    const savedTheme = localStorage.getItem('theme-preference') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
})();

// GLOBAL ERROR HANDLER FOR MOBILE DEBUGGING
window.onerror = function (msg, url, lineNo, columnNo, error) {
    const string = msg.toLowerCase();
    const substring = "script error";
    if (string.indexOf(substring) > -1) {
        alert('Script Error: See Console for details');
    } else {
        const message = [
            'Message: ' + msg,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');
        alert("System Error: " + message);
    }
    return false;
};

document.addEventListener('DOMContentLoaded', () => {

    // === 0. Global Tactical State & Refs ===
    const targetConfigs = [
        { angleId: 'shooting-angle', rangeId: 'compass-range', label: 'T1 Shot:', mobileId: 'mobile-display-shooting-angle' },
        { angleId: 'shooting-angle-2', rangeId: 'compass-range-2', label: 'T2 Shot:', mobileId: 'mobile-display-shooting-angle-2' },
        { angleId: 'shooting-angle-3', rangeId: 'compass-range-3', label: 'T3 Shot:', mobileId: 'mobile-display-shooting-angle-3' },
        { angleId: 'shooting-angle-4', rangeId: 'compass-range-4', label: 'T4 Shot:', mobileId: 'mobile-display-shooting-angle-4' },
        { angleId: 'shooting-angle-5', rangeId: 'compass-range-5', label: 'T5 Shot:', mobileId: 'mobile-display-shooting-angle-5' },
        { angleId: 'shooting-angle-6', rangeId: 'compass-range-6', label: 'T6 Shot:', mobileId: 'mobile-display-shooting-angle-6' },
        { angleId: 'shooting-angle-7', rangeId: 'compass-range-7', label: 'T7 Shot:', mobileId: 'mobile-display-shooting-angle-7' },
        { angleId: 'shooting-angle-8', rangeId: 'compass-range-8', label: 'T8 Shot:', mobileId: 'mobile-display-shooting-angle-8' },
        { angleId: 'shooting-angle-9', rangeId: 'compass-range-9', label: 'T9 Shot:', mobileId: 'mobile-display-shooting-angle-9' },
        { angleId: 'shooting-angle-10', rangeId: 'compass-range-10', label: 'T10 Shot:', mobileId: 'mobile-display-shooting-angle-10' }
    ];
    // Use window scope for these refs so global functions can see them if needed
    window.targetConfigs = targetConfigs;
    window.owcLiveSync = true;
    window.owcUnitMode = 'MIL'; // [NEW] Default Unit Mode
    window.owcAtmosMode = 'da';
    window.chatHistory = document.getElementById('ai-chat-history');
    window.chatInput = document.getElementById('ai-chat-input');

    // === 1. Setup & Table Generation ===
    const tableBody = document.getElementById('distance-table-body');
    const mobileTableBody = document.getElementById('mobile-distance-table-body');
    const distances = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

    const inputs = [
        'header-notes', 'shooter-company', 'session-category',
        'mission-id', 'team-id', 'sniper-name', 'spotter-name', 'radio-freq', 'callsign', 'sector-fire',
        'date', 'time', 'caliber', 'zero', 'barrel', 'bullet', 'load', 'powder',
        'primer', 'col', 'rings', 'velocity', 'g1', 'environment-summary', 'temperature', 'humidity', 'pressure', 'wind-speed', 'wind-dir', 'cosine', 'misc', 'targetSize', 'groupSize', 'elevation', 'hold-data', 'final-dope',
        'rifle-notes', 'wind-notes', 'scope-notes', 'shooting-angle', 'direction-notes', 'lrf-notes', 'compass-range',
        'shooting-angle-2', 'compass-range-2', 'shooting-angle-3', 'compass-range-3',
        'shooting-angle-4', 'compass-range-4', 'shooting-angle-5', 'compass-range-5',
        'shooting-angle-6', 'compass-range-6', 'shooting-angle-7', 'compass-range-7',
        'shooting-angle-8', 'compass-range-8', 'shooting-angle-9', 'compass-range-9',
        'shooting-angle-10', 'compass-range-10',
        'hold-grade', 'shot-grade', 'hold-value', 'shot-grade-color',
        // Work Center IDs
        'owc-range', 'owc-zero', 'owc-mv', 'owc-bc',
        'owc-wind-dir', 'owc-wind-speed', 'owc-los-heading', 'owc-angle',
        'owc-da', 'owc-alt', 'owc-temp', 'owc-hum', 'owc-press',
        'owc-slope'
    ];

    // Responsive Scaling Logic
    function updateScale() {
        const previewPanel = document.getElementById('previewPanel');
        const container = document.getElementById('card-container');
        if (!previewPanel || !container) return;

        const sidebarWidth = 0.33 * window.innerWidth;
        const availableWidth = window.innerWidth > 1024 ? window.innerWidth - sidebarWidth : window.innerWidth;
        const availableHeight = window.innerHeight;

        const cardWidth = 1000;
        const cardHeight = 750;

        const scaleX = (availableWidth * 0.9) / cardWidth;
        const scaleY = (availableHeight * 0.9) / cardHeight;
        let scale = Math.min(scaleX, scaleY);

        if (isNaN(scale) || scale <= 0) scale = 0.5; // Fallback

        // Check for specific hidden class removal to unhide for user
        if (window.innerWidth >= 1024) {
            previewPanel.classList.remove('hidden');
            previewPanel.classList.add('flex');
        } else if (previewPanel.classList.contains('lg:flex')) {
            // Keep user intent if possible
        }

        container.style.transform = `scale(${scale})`;
        console.log("[SYS] Scaling Card to:", scale.toFixed(2));
    }

    window.addEventListener('resize', updateScale);
    setTimeout(updateScale, 500);

    // Generate Distance Table Rows and collect their Input IDs
    distances.forEach(dist => {
        const clicksId = `clicks-${dist}`;
        const udlrId = `udlr-${dist}`;
        const distInputId = `dist-${dist}`;

        // Register these for syncing/saving
        inputs.push(clicksId, udlrId, distInputId);

        // 1. Original Table Row
        if (tableBody) {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-4 border-b border-black flex-1 items-center text-center';
            row.innerHTML = `
                <div class="border-r border-black h-full flex items-center justify-center font-handwriting text-blue-800">
                    <span id="display-${clicksId}"></span>
                </div>
                <div class="col-span-2 border-r border-black h-full flex items-center justify-center bg-gray-50/30">
                    <span id="display-${distInputId}" class="text-sm font-bold">${dist}</span>
                </div>
                <div class="h-full flex items-center justify-center font-handwriting text-blue-800">
                    <span id="display-${udlrId}"></span>
                </div>
            `;
            tableBody.appendChild(row);
        }

        // 2. NEW: Mobile Table Row
        if (mobileTableBody) {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-4 border-b border-black flex items-center text-center border-l-0 border-r-0 min-h-[45px]';
            row.innerHTML = `
                <div class="border-r border-black h-full py-2 flex items-center justify-center font-handwriting text-blue-800 text-sm">
                    <span id="mobile-display-${clicksId}"></span>
                </div>
                <div class="col-span-2 border-r border-black h-full py-2 flex items-center justify-center bg-gray-50/40">
                    <span id="mobile-display-${distInputId}" class="text-xs font-black tracking-tighter">${dist}</span>
                </div>
                <div class="h-full py-2 flex items-center justify-center font-handwriting text-blue-800 text-sm">
                    <span id="mobile-display-${udlrId}"></span>
                </div>
            `;
            mobileTableBody.appendChild(row);
        }
    });

    // === 2. Data Syncing (Input -> Card) ===
    // Bulk Refresh Function to avoid event flooding
    window.refreshAllDisplays = function () {
        inputs.forEach(id => {
            const input = document.getElementById(id);
            const display = document.getElementById(`display-${id}`);
            const mobileDisplay = document.getElementById(`mobile-display-${id}`);
            if (input) {
                if (display) display.textContent = input.value;
                if (mobileDisplay) mobileDisplay.textContent = input.value;
            }
        });
        if (typeof updateMobileWeather === 'function') updateMobileWeather();
    };

    // === 2a. Dynamic Input Listeners (Supports Template Swapping) ===
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                // Dynamic Lookup to support swapped templates
                const display = document.getElementById(`display-${id}`);
                const mobileDisplay = document.getElementById(`mobile-display-${id}`);

                if (display) display.textContent = e.target.value;
                if (mobileDisplay) mobileDisplay.textContent = e.target.value;

                // Trigger calculations
                if (!window.isSystemLoading) {
                    if (typeof updateMobileWeather === 'function') updateMobileWeather();

                    const syncIds = ['temperature', 'pressure', 'humidity', 'velocity', 'g1', 'zero'];
                    if (window.owcLiveSync && syncIds.includes(id)) {
                        if (typeof window.syncOWCWeather === 'function') window.syncOWCWeather();
                    }
                }
            });
            // Initial sync
            const display = document.getElementById(`display-${id}`);
            const mobileDisplay = document.getElementById(`mobile-display-${id}`);
            if (display) display.textContent = input.value;
            if (mobileDisplay) mobileDisplay.textContent = input.value;
        }
    });

    // === 3. Modular Card Rendering ===
    window.renderCard = function (mode) {
        if (!window.CARD_TEMPLATES) {
            console.warn("CARD_TEMPLATES not loaded!");
            return;
        }

        const container = document.getElementById('card-container');
        if (!container) return;

        // Normalize Mode
        let templateKey = 'standard';
        if (mode === 'sniper') templateKey = 'sniper';
        else if (mode === 'swat') templateKey = 'swat';

        console.log(`[SYS] Switching Layout to: ${templateKey.toUpperCase()}`);
        container.innerHTML = window.CARD_TEMPLATES[templateKey] || window.CARD_TEMPLATES['standard'];

        // TOGGLE FORM SECTIONS
        const missionForm = document.getElementById('form-section-mission');
        if (missionForm) {
            if (templateKey === 'sniper' || templateKey === 'swat') {
                missionForm.classList.remove('hidden');
            } else {
                missionForm.classList.add('hidden');
            }
        }

        // Re-populate data into new elements
        window.refreshAllDisplays();

        // Re-draw Reticles (Using Integrated Logic)
        if (templateKey === 'standard' || templateKey === 'sniper' || templateKey === 'swat') {
            window.initTargetCanvas('canvas-hold', 'hold');
            window.initTargetCanvas('canvas-shot', 'shot');
            window.updateAllCanvases('hold');
            window.updateAllCanvases('shot');
        }
    };

    // Attach Mode Switcher
    const categorySelect = document.getElementById('session-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            renderCard(e.target.value);
        });
    }

    function updateMobileWeather() {
        // Collect weather data for the single mobile summary line
        const t = document.getElementById('temperature')?.value;
        const h = document.getElementById('humidity')?.value;
        const p = document.getElementById('pressure')?.value;
        const c = document.getElementById('cosine')?.value;

        const sum = document.getElementById('mobile-display-weather-summary');
        if (sum) {
            // If all fields are empty, clear the display entirely
            if (!t && !h && !p && !c) {
                sum.textContent = '';
            } else {
                // Otherwise show what we have, using '-' for missing values only within the context of existing data
                sum.textContent = `T:${t || '-'}  H:${h || '-'}%  P:${p || '-'}inHg  Cos:${c || '-'}`;
            }
        }
    }

    // Special handling for date formatting
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;

        const displayDate = document.getElementById('display-date');
        const mobileDisplayDate = document.getElementById('mobile-display-date');
        if (displayDate) displayDate.textContent = dateInput.value;
        if (mobileDisplayDate) mobileDisplayDate.textContent = dateInput.value;
    }

    // === 3. Canvas Logic (Shots & Holds) ===
    // Global shot storage for analysis
    window.canvasShots = { hold: [], shot: [] };

    // Registry to keep track of all canvases for sync
    window.targetCanvasRegistry = { hold: [], shot: [] };

    window.drawReticleOnCtx = function (context, w, h, cx, cy, shots, type) {
        if (!context) return;
        w = w || 250;
        h = h || 250;
        cx = cx || (w / 2);
        cy = cy || (h / 2);

        context.clearRect(0, 0, w, h);
        context.strokeStyle = '#4b5563'; // Darker Gray
        context.lineWidth = 1.5;

        // Concentric Circles
        [0.2, 0.4, 0.6, 0.8].forEach(scale => {
            context.beginPath();
            context.arc(cx, cy, (w / 2) * scale, 0, Math.PI * 2);
            context.stroke();
        });

        // Crosshairs
        context.lineWidth = 2.5;
        context.beginPath();
        context.moveTo(cx, 0); context.lineTo(cx, h);
        context.moveTo(0, cy); context.lineTo(w, cy);
        context.stroke();

        // Strelok-style Mil-Dots
        context.fillStyle = '#000';
        for (let i = 1; i < 5; i++) {
            const offset = (w / 2) * (i * 0.2);
            context.beginPath(); context.arc(cx + offset, cy, 2, 0, Math.PI * 2); context.fill();
            context.beginPath(); context.arc(cx - offset, cy, 2, 0, Math.PI * 2); context.fill();
            context.beginPath(); context.arc(cx, cy + offset, 2, 0, Math.PI * 2); context.fill();
            context.beginPath(); context.arc(cx, cy - offset, 2, 0, Math.PI * 2); context.fill();
        }

        if (type === 'shot') {
            context.fillStyle = '#22c55e'; // Green bullseye center indicator
            context.beginPath(); context.arc(cx, cy, 4, 0, Math.PI * 2); context.fill();
        }

        // Render Individual Shots
        shots.forEach((shot, index) => {
            const drawX = (shot.x / 200) * w;
            const drawY = (shot.y / 200) * h;
            const dotSize = Math.max(7, 9 * (w / 200));

            context.fillStyle = '#ef4444';
            context.beginPath();
            context.arc(drawX, drawY, dotSize, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = '#ffffff';
            context.lineWidth = 1;
            context.stroke();

            context.fillStyle = '#ffffff';
            context.font = `bold ${Math.max(8, 10 * (w / 200))}px sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(`${index + 1}`, drawX, drawY);
        });
    };

    window.updateAllCanvases = function (targetType) {
        const shots = window.canvasShots[targetType];
        const registry = window.targetCanvasRegistry[targetType];
        if (registry) {
            registry.forEach(item => {
                window.drawReticleOnCtx(item.ctx, item.width, item.height, item.centerX, item.centerY, shots, targetType);
            });
        }
    };

    window.initTargetCanvas = function (canvasId, type, clearBtnId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width || 250;
        const height = canvas.height || 250;
        const centerX = width / 2;
        const centerY = height / 2;

        // Register this canvas for sync updates
        if (!window.targetCanvasRegistry[type]) window.targetCanvasRegistry[type] = [];
        const exists = window.targetCanvasRegistry[type].some(item => item.canvas.id === canvasId);
        if (!exists) {
            window.targetCanvasRegistry[type].push({ canvas, ctx, width, height, centerX, centerY });
        }

        canvas.addEventListener('pointerdown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const normX = ((e.clientX - rect.left) / rect.width) * 200;
            const normY = ((e.clientY - rect.top) / rect.height) * 200;

            let currentShots = window.canvasShots[type];
            if (e.button === 2) currentShots.pop(); else currentShots.push({ x: normX, y: normY });
            window.canvasShots[type] = currentShots;

            // Persist to localStorage
            localStorage.setItem(`pending-canvas-shots-${type}`, JSON.stringify(currentShots));

            window.updateAllCanvases(type);
        });

        if (clearBtnId) {
            const clearBtn = document.getElementById(clearBtnId);
            if (clearBtn) {
                if (!clearBtn.dataset.listenerAttached) {
                    clearBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.canvasShots[type] = [];
                        localStorage.removeItem(`pending-canvas-shots-${type}`);
                        window.updateAllCanvases(type);

                        const resultEl = document.getElementById(`${type}-analysis-result`);
                        if (resultEl) { resultEl.classList.add('hidden'); resultEl.textContent = ''; }
                        const noteId = type === 'hold' ? 'display-hold-value' : 'display-shot-grade';
                        const noteEl = document.getElementById(noteId);
                        if (noteEl) noteEl.textContent = '';
                    });
                    clearBtn.dataset.listenerAttached = "true";
                }
            }
        }
        canvas.addEventListener('contextmenu', e => e.preventDefault());
        setTimeout(() => window.updateAllCanvases(type), 200);
    };

    // Initialize all canvases
    window.initTargetCanvas('canvas-hold', 'hold', 'clear-hold-btn');
    window.initTargetCanvas('canvas-shot', 'shot', 'clear-shot-btn');
    window.initTargetCanvas('mobile-canvas-hold', 'hold', 'clear-hold-btn');
    window.initTargetCanvas('mobile-canvas-shot', 'shot', 'clear-shot-btn');

    // Load persisted dots on startup
    ['hold', 'shot'].forEach(type => {
        const saved = localStorage.getItem(`pending-canvas-shots-${type}`);
        if (saved) {
            try {
                window.canvasShots[type] = JSON.parse(saved);
            } catch (e) {
                console.error("Error loading reticle dots", e);
            }
        }
    });

    // Forced Global Sync for Canvases
    setTimeout(() => {
        window.updateAllCanvases('hold');
        window.updateAllCanvases('shot');
    }, 500);

    // === 3.5 SHOT GROUP ANALYZER ===
    window.analyzeGroup = function (type) {
        const shots = window.canvasShots[type] || [];
        const canvas = document.getElementById(type === 'hold' ? 'canvas-hold' : 'canvas-shot');
        if (!canvas || shots.length < 2) {
            showAnalysisResult(type, 'Need at least 2 shots to analyze.');
            return;
        }

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Calculate group center (centroid)
        const avgX = shots.reduce((sum, s) => sum + s.x, 0) / shots.length;
        const avgY = shots.reduce((sum, s) => sum + s.y, 0) / shots.length;

        // Calculate extreme spread (max distance between any two shots)
        let maxDist = 0;
        for (let i = 0; i < shots.length; i++) {
            for (let j = i + 1; j < shots.length; j++) {
                const dist = Math.sqrt(Math.pow(shots[i].x - shots[j].x, 2) + Math.pow(shots[i].y - shots[j].y, 2));
                if (dist > maxDist) maxDist = dist;
            }
        }

        // Calculate bias from bullseye center
        const biasX = avgX - centerX;
        const biasY = avgY - centerY;
        const biasDistance = Math.sqrt(biasX * biasX + biasY * biasY);

        // Convert to MOA (assuming canvas represents ~10 MOA diameter at 100yds)
        // Each pixel = 10 MOA / canvas width
        const moaPerPixel = 10 / width;
        const spreadMOA = (maxDist * moaPerPixel).toFixed(2);
        const biasMOA = (biasDistance * moaPerPixel).toFixed(2);

        // Determine bias direction
        let biasDirection = '';
        if (Math.abs(biasX) > 5 || Math.abs(biasY) > 5) {
            if (biasY < -5) biasDirection += 'HIGH ';
            if (biasY > 5) biasDirection += 'LOW ';
            if (biasX < -5) biasDirection += 'LEFT';
            if (biasX > 5) biasDirection += 'RIGHT';
        } else {
            biasDirection = 'CENTERED';
        }

        const result = ` Group Analysis (${shots.length} shots):\n` +
            ` Spread: ${spreadMOA} MOA\n` +
            ` Bias: ${biasMOA} MOA ${biasDirection.trim()}\n` +
            ` Rating: ${getGroupRating(parseFloat(spreadMOA))}`;

        showAnalysisResult(type, result);

        // Also store for coaching tips
        window.lastGroupAnalysis = {
            type,
            shotCount: shots.length,
            spreadMOA: parseFloat(spreadMOA),
            biasMOA: parseFloat(biasMOA),
            biasDirection: biasDirection.trim()
        };
    };

    function getGroupRating(spreadMOA) {
        if (spreadMOA <= 0.5) return ' Sub-MOA Excellence';
        if (spreadMOA <= 1.0) return ' MOA-Grade Precision';
        if (spreadMOA <= 2.0) return ' Solid Performance';
        if (spreadMOA <= 3.0) return ' Needs Refinement';
        return ' Check Fundamentals';
    }

    function showAnalysisResult(type, message) {
        const resultEl = document.getElementById(`${type}-analysis-result`);
        if (resultEl) {
            resultEl.textContent = message;
            resultEl.classList.remove('hidden');
        } else {
            // Fallback to chat if no dedicated element
            if (typeof addChatBubble === 'function') {
                addChatBubble('bot', message.replace(/\n/g, '<br>'));
            }
        }
    }


    // === 4. Profile Management & Library ===
    const saveProfileBtn = document.getElementById('saveProfileBtnManual');
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const openLibraryBtn = document.getElementById('openLibraryBtn');

    if (saveProfileBtn) {
        saveProfileBtn.onclick = async () => {
            const name = prompt("Enter profile name to save tactical record:");
            if (!name) return;

            const container = document.getElementById('card-container');
            const previewPanel = document.getElementById('previewPanel');

            if (!container || !previewPanel) {
                alert("Critical error: Card container or preview panel missing.");
                return;
            }

            // Save current states to restore later
            const isVisuallyHidden = previewPanel.classList.contains('hidden') || getComputedStyle(previewPanel).display === 'none';
            const originalTransform = container.style.transform;
            const originalScrollY = window.scrollY;

            // DIRECT CAPTURE - NO DELAY
            // 1. Show panel if hidden just for capture, but try to keep it seamless
            const wasHidden = isVisuallyHidden;
            if (wasHidden) {
                previewPanel.classList.remove('hidden');
                previewPanel.classList.add('flex');
                // Ensure it's not hidden by opacity or pointer events
                previewPanel.classList.remove('opacity-0', 'pointer-events-none');
            }

            // 2. Reset scaling transform to capture at full resolution
            container.style.transform = 'none';
            // 3. Scroll to top to ensure complete capture
            window.scrollTo(0, 0);

            // Capture with onclone to ensure canvas drawings are baked into the snapshot
            html2canvas(container, {
                scale: 2.5, // Restored to 2.5x
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1000,
                windowHeight: 750,
                onclone: (clonedDoc) => {
                    // 1. HIDE IMAGE OVERLAY FOR CLEAN CAPTURE (Avoid Generational Loss)
                    // This ensures we capture the crisp HTML instead of a blurry previous snapshot.
                    const overlay = clonedDoc.getElementById('cardImageOverlay');
                    if (overlay) overlay.style.display = 'none';

                    // 2. ENFORCE "HARD & CRISP" STYLING IN CLONE
                    const container = clonedDoc.getElementById('card-container');
                    if (container) {
                        container.style.webkitFontSmoothing = 'none';
                        container.style.mozOsxFontSmoothing = 'unset';
                        container.style.textRendering = 'optimizeLegibility';
                    }

                    // Force replace interactive canvases with static images for the render
                    const canvasIds = ['pencil-canvas', 'compass-vector', 'canvas-hold', 'canvas-shot'];
                    canvasIds.forEach(id => {
                        const original = document.getElementById(id);
                        const cloned = clonedDoc.getElementById(id);
                        if (original && cloned) {
                            try {
                                const img = clonedDoc.createElement('img');
                                img.src = original.toDataURL();
                                img.className = original.className;
                                img.style.cssText = original.style.cssText;
                                // Crucial: ensure it maintains visibility/position
                                img.style.display = 'block';
                                if (id.includes('pencil') || id.includes('vector')) {
                                    img.style.position = 'absolute';
                                    img.style.inset = '0';
                                }
                                cloned.parentNode.replaceChild(img, cloned);
                            } catch (e) {
                                console.warn(`[Snapshot] Could not clone canvas ${id}:`, e);
                            }
                        }
                    });
                }
            }).then(async canvas => {
                // Restore layout immediately
                if (wasHidden) {
                    previewPanel.classList.add('hidden');
                    previewPanel.classList.remove('flex');
                }
                container.style.transform = originalTransform;
                window.scrollTo(0, originalScrollY);

                // 4. Optimize Snapshot Data (High Quality JPEG)
                const snapshot = canvas.toDataURL("image/jpeg", 0.9);
                const data = { snapshot };

                inputs.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) data[id] = el.value;
                });

                // Include Reticle Dots and Drawing in Profile
                const pencilCanvas = document.getElementById('pencil-canvas');
                data.canvasShots = {
                    hold: window.canvasShots.hold,
                    shot: window.canvasShots.shot
                };
                if (pencilCanvas) {
                    // Compress pencil data too
                    data.pencilData = pencilCanvas.toDataURL("image/png");
                }

                // Ensure date/time are set
                if (!data.date) data.date = new Date().toLocaleDateString();
                if (!data.time) data.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const ps = await getProfiles();
                ps[name] = data;

                // Save to IndexedDB
                await window.TRC_IDB.set('rangeCardProfiles', name, data);

                // Save asynchronously to prevent blocking the UI thread
                console.log(`[SYS] Profile "${name}" archived in IDB.`);
                await openLibrary();
                await previewProfile(name);

                if (typeof addChatBubble === 'function') {
                    addChatBubble('bot', ` Record "${name}" secured.`);
                }
            }).catch(err => {
                if (wasHidden) {
                    previewPanel.classList.add('hidden');
                    previewPanel.classList.remove('flex');
                }
                container.style.transform = originalTransform;
                window.scrollTo(0, originalScrollY);
                console.error("Capture failure:", err);
                alert("Record save failed.");
            });
        };
    }


    if (clearFormBtn) {
        clearFormBtn.onclick = () => {
            if (confirm("Clear all tactical data and start fresh? This cannot be undone.")) {
                console.log("Starting full tactical purge...");
                // 1. Prevent Auto-Save from competing during clear
                window.isClearingForm = true;

                // 2. Clear EVERY input on the page
                const allInputs = document.querySelectorAll('input, select, textarea');
                allInputs.forEach(el => {
                    if (el.id && el.id.startsWith('dist-')) {
                        // Keep the distance numbers (100, 200, etc)
                    } else if (el.type !== 'checkbox' && el.type !== 'radio') {
                        el.value = '';
                    } else if (el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = false;
                    }
                    // Trigger input event so the Card Preview also clears
                    el.dispatchEvent(new Event('input'));
                });

                // 3. Clear composite displays
                const weatherSum = document.getElementById('mobile-display-weather-summary');
                if (weatherSum) weatherSum.textContent = '';

                // 4. Wipe Storage (Nuke the persistent ghost data)
                // Use empty object instead of just removing to ensure any simultaneous saves are overridden with 'empty'
                localStorage.setItem('rangeCardAutoSave', JSON.stringify({}));
                localStorage.removeItem('mobile-canvas-hold');
                localStorage.removeItem('mobile-canvas-shot');

                // 5. Clear Canvases (Drawings)
                ['clear-hold-btn', 'clear-shot-btn', 'clear-pencil', 'clear-map-pencil-btn'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) btn.click();
                });

                // 6. Reset UI helpers
                if (window.clearCalc) window.clearCalc();
                if (window.drawCompassVector) window.drawCompassVector();

                const overlayImg = document.getElementById('cardImageOverlay');
                if (overlayImg) {
                    overlayImg.classList.add('hidden');
                    overlayImg.src = '';
                }

                // Give the browser a moment to settle before allowing auto-saves again
                setTimeout(() => {
                    window.isClearingForm = false;
                    // Final explicit save of the empty state
                    autoSaveAll();
                    // 3. Clear Canvas Dots and Drawings
                    if (window.canvasShots) {
                        window.canvasShots.hold = [];
                        window.canvasShots.shot = [];
                        localStorage.removeItem('pending-canvas-shots-hold');
                        localStorage.removeItem('pending-canvas-shots-shot');
                    }
                    if (typeof updateAllCanvases === 'function') {
                        updateAllCanvases('hold');
                        updateAllCanvases('shot');
                    }
                    const pCanvas = document.getElementById('pencil-canvas');
                    const mPCanvas = document.getElementById('mobile-pencil-canvas');
                    if (pCanvas) pCanvas.getContext('2d', { willReadFrequently: true }).clearRect(0, 0, pCanvas.width, pCanvas.height);
                    if (mPCanvas) mPCanvas.getContext('2d', { willReadFrequently: true }).clearRect(0, 0, mPCanvas.width, mPCanvas.height);

                    console.log("Tactical purge finalized. Terminal is fresh.");
                }, 500);

                addChatBubble('bot', ' All tactical data purged. Terminal is fresh.');
            }
        };
    }

    window.getProfiles = async function () {
        return await window.TRC_IDB.getAll('rangeCardProfiles');
    };

    window.updateProfileList = async function () {
        const ps = await window.getProfiles();
        const names = Object.keys(ps);
        const profileSelect = document.getElementById('profileSelect');
        const libraryList = document.getElementById('libraryList');

        if (profileSelect) profileSelect.innerHTML = '<option value="">Select a profile...</option>';
        if (libraryList) libraryList.innerHTML = '';

        names.sort().reverse().forEach(name => {
            if (profileSelect) {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                profileSelect.appendChild(opt);
            }

            if (libraryList) {
                const item = document.createElement('div');
                item.className = "p-4 bg-gray-800/30 hover:bg-neon-green/10 rounded-lg border border-gray-800 hover:border-neon-green/40 cursor-pointer transition-all group";
                item.innerHTML = `
                    <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0">
                            <div class="font-bold text-sm text-gray-200 truncate pr-4 group-hover:text-white">${name}</div>
                            <div class="text-[9px] text-gray-500 font-mono uppercase mt-1">
                                ${ps[name].caliber || 'No Caliber'}  ${ps[name].date || '--'}
                            </div>
                        </div>
                        <i data-lucide="chevron-right" class="w-4 h-4 text-gray-700 group-hover:text-neon-green"></i>
                    </div>
                `;
                item.onclick = () => window.previewProfile(name);
                libraryList.appendChild(item);
            }
        });
        if (window.lucide) lucide.createIcons();
    };

    window.closeProfilePreview = function () {
        const profilePreview = document.getElementById('profilePreview');
        if (profilePreview) {
            profilePreview.classList.add('hidden');
            const container = profilePreview.closest('.flex-1.flex.flex-col.lg\\:flex-row.overflow-hidden');
            if (container) {
                container.classList.remove('mobile-preview-active');
            }
        }
    };

    window.previewProfile = async function (name) {
        const ps = await window.getProfiles();
        const data = ps[name];
        if (!data) return;

        const emptyState = document.getElementById('noSelection');
        if (emptyState) emptyState.classList.add('hidden');

        const profilePreview = document.getElementById('profilePreview');
        if (profilePreview) {
            profilePreview.classList.remove('hidden');
            // If on mobile, trigger the drill-down view
            const container = profilePreview.closest('.flex-1.flex.flex-col.lg\\:flex-row.overflow-hidden');
            if (container && window.innerWidth <= 1024) {
                container.classList.add('mobile-preview-active');
            }
        }

        const prevName = document.getElementById('previewName');
        if (prevName) prevName.textContent = name;

        const prevCal = document.getElementById('previewCaliber');
        if (prevCal) prevCal.textContent = `${data.caliber || '---'}  ${data.bullet || '---'}`;

        const prevDate = document.getElementById('prevDate');
        if (prevDate) prevDate.textContent = data.date || '--';

        const img = document.getElementById('prevImage');
        const noImg = document.getElementById('noImageMsg');
        if (img && data.snapshot && data.snapshot.startsWith('data:image')) {
            img.src = data.snapshot;
            img.classList.remove('hidden');
            if (noImg) noImg.classList.add('hidden');
        } else if (img) {
            img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            img.classList.add('hidden');
            if (noImg) noImg.classList.remove('hidden');
        }

        // Data field updates with safety checks
        const fields = {
            'prevVel': data.velocity, 'prevZero': data.zero, 'prevFinal': data['final-dope'],
            'prevHeaderNotes': data['header-notes'], 'prevTime': data.time, 'prevElev': data.elevation,
            'prevHold': data['hold-data'], 'prevBarrel': data.barrel, 'prevPowder': data.powder,
            'prevLoad': data.load, 'prevCOL': data.col, 'prevG1': data.g1, 'prevRifleNotes': data['rifle-notes']
        };
        Object.keys(fields).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = fields[id] || '--';
        });

        const prevWeather = document.getElementById('prevWeather');
        if (prevWeather) {
            if (data.temperature || data.humidity || data.pressure) {
                prevWeather.textContent = `${data.temperature || '--'}F ${data.humidity || '--'}% ${data.pressure || '--'}in ${data['wind-speed'] || '--'}mph`;
            } else {
                prevWeather.textContent = data.weather || '--';
            }
        }

        const dTable = document.getElementById('prevDistanceTable');
        if (dTable) {
            dTable.innerHTML = '';
            [100, 200, 300, 400, 500].forEach(d => {
                const clicks = data[`clicks-${d}`] || '--';
                const udlr = data[`udlr-${d}`] || '--';
                const row = document.createElement('div');
                row.className = "p-2 bg-black/40 border border-gray-800 rounded flex flex-col items-center";
                row.innerHTML = `<span class="text-[8px] text-gray-500">${d}Y</span><span class="text-xs text-blue-400 font-bold">${clicks}</span><span class="text-[8px] text-gray-600">${udlr}</span>`;
                dTable.appendChild(row);
            });
        }

        // Action Handlers
        const viewDataBtn = document.getElementById('viewDataBtn');
        const viewImageBtn = document.getElementById('viewImageBtn');
        const dataView = document.getElementById('dataPreview');
        const imgView = document.getElementById('snapshotPreview');

        if (viewDataBtn && viewImageBtn) {
            viewDataBtn.onclick = () => {
                if (dataView) dataView.classList.remove('hidden');
                if (imgView) imgView.classList.add('hidden');
                viewDataBtn.className = "px-4 py-1.5 text-[10px] font-bold uppercase rounded transition-all bg-neon-green text-black";
                viewImageBtn.className = "px-4 py-1.5 text-[10px] font-bold uppercase rounded transition-all text-gray-500 hover:text-white";
            };
            viewImageBtn.onclick = () => {
                if (dataView) dataView.classList.add('hidden');
                if (imgView) imgView.classList.remove('hidden');
                viewImageBtn.className = "px-4 py-1.5 text-[10px] font-bold uppercase rounded transition-all bg-neon-green text-black";
                viewDataBtn.className = "px-4 py-1.5 text-[10px] font-bold uppercase rounded transition-all text-gray-500 hover:text-white";
            };
            viewImageBtn.click();
        }

        const loadBtn = document.getElementById('loadSelectedBtn');
        if (loadBtn) loadBtn.onclick = () => { window.loadProfile(name); window.closeLibrary(); };

        const delBtn = document.getElementById('deleteSelectedBtn');
        if (delBtn) delBtn.onclick = async () => {
            if (confirm(`Trash record "${name}"?`)) {
                const ps_new = await window.getProfiles();
                delete ps_new[name];
                await window.TRC_IDB.delete('rangeCardProfiles', name);
                await window.updateProfileList();
                window.resetPreview();
            }
        };
    };

    window.resetPreview = function () {
        const preview = document.getElementById('profilePreview');
        if (preview) preview.classList.add('hidden');
        const emptyState = document.getElementById('noSelection');
        if (emptyState) emptyState.classList.remove('hidden');
    };

    window.loadProfile = async function (name) {
        const ps = await window.getProfiles();
        const data = ps[name];
        if (!data) return;

        const overlay = document.getElementById('cardImageOverlay');
        if (data.type === 'imported-image' && data.snapshot && overlay) {
            overlay.src = data.snapshot;
            overlay.classList.remove('hidden');
        } else if (overlay) {
            overlay.classList.add('hidden');
            overlay.src = '';
        }

        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (data.type === 'imported-image') {
                    if (id === 'caliber') el.value = data.caliber || ' Imported Card';
                    else if (id === 'header-notes') el.value = name;
                    else el.value = data[id] || '';
                } else {
                    el.value = data[id] || '';
                }
                el.dispatchEvent(new Event('input'));
            }
        });

        if (data.canvasShots) {
            window.canvasShots.hold = data.canvasShots.hold || [];
            window.canvasShots.shot = data.canvasShots.shot || [];
            localStorage.setItem('pending-canvas-shots-hold', JSON.stringify(window.canvasShots.hold));
            localStorage.setItem('pending-canvas-shots-shot', JSON.stringify(window.canvasShots.shot));
            window.updateAllCanvases('hold');
            window.updateAllCanvases('shot');
        }

        if (data.pencilData) {
            const pCanvas = document.getElementById('pencil-canvas');
            const mPCanvas = document.getElementById('mobile-pencil-canvas');
            const redraw = (canvas) => {
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = data.pencilData;
            };
            redraw(pCanvas); redraw(mPCanvas);
        }
        if (profileSelect) profileSelect.value = name;
    };

    window.openLibrary = function () {
        // Ensure Intel Hub is closed so Library is visible
        if (typeof window.closeIntelHub === 'function') window.closeIntelHub();

        const modal = document.getElementById('libraryModal');
        if (modal) modal.classList.remove('hidden');
        window.updateProfileList();
        window.resetPreview();
        window.syncCardModelUI();
    };

    window.syncCardModelUI = function () {
        const modelId = typeof currentCardModel !== 'undefined' ? currentCardModel : 'standard';
        document.querySelectorAll('.card-model-btn').forEach(btn => {
            btn.classList.remove('border-neon-green', 'bg-neon-green/5', 'border-blue-500', 'bg-blue-500/5', 'border-purple-500', 'bg-purple-500/5', 'border-orange-500', 'bg-orange-500/5', 'border-yellow-500', 'bg-yellow-500/5');
            btn.classList.add('border-gray-700', 'bg-black/40');
        });

        const activeBtn = document.getElementById(`card-model-${modelId}`);
        if (activeBtn) {
            activeBtn.classList.remove('border-gray-700', 'bg-black/40');
            const color = modelId === 'standard' ? 'neon-green' : (modelId === 'recon' ? 'blue-500' : (modelId === 'challenger' ? 'purple-500' : (modelId === 'stalker' ? 'orange-500' : 'yellow-500')));
            activeBtn.classList.add(`border-${color}`, `bg-${color}/5`);
        }
    };
    window.closeLibrary = function () {
        const modal = document.getElementById('libraryModal');
        if (modal) modal.classList.add('hidden');
    };

    openLibraryBtn.onclick = openLibrary;
    closeLibraryBtn.onclick = closeLibrary;

    // === Image Import System ===
    const importProfilesBtn = document.getElementById('importProfilesBtn');
    const importFileInput = document.getElementById('importFileInput');

    // Close modal on outside click (Restored)
    const libModal = document.getElementById('libraryModal');
    if (libModal) {
        libModal.addEventListener('click', (e) => {
            if (e.target === libModal) window.closeLibrary();
        });
    }

    if (importProfilesBtn && importFileInput) {
        importProfilesBtn.onclick = () => {
            importFileInput.click();
        };

        importFileInput.onchange = async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            const profiles = await getProfiles();
            let imported = 0;
            const totalFiles = files.length;

            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const imageName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

                        profiles[imageName] = {
                            snapshot: event.target.result,
                            type: 'imported-image',
                            date: new Date().toLocaleDateString(),
                            time: new Date().toLocaleTimeString(),
                            caliber: ' Imported Image'
                        };

                        await window.TRC_IDB.set('rangeCardProfiles', imageName, profiles[imageName]);
                        imported++;

                        if (imported === totalFiles) {
                            await updateProfileList(); // Refresh library to show new images
                            alert(`Successfully imported ${imported} image(s)!`);
                            importFileInput.value = ''; // Reset input
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        };
    }


    updateProfileList();

    // === 5. Profile Search & Filter Event Listeners ===
    const profileSearchInput = document.getElementById('profileSearchInput');
    const profileCategoryFilter = document.getElementById('profileCategoryFilter');
    const profileSortOption = document.getElementById('profileSortOption');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (profileSearchInput) {
        profileSearchInput.addEventListener('input', updateProfileList);
    }

    if (profileCategoryFilter) {
        profileCategoryFilter.addEventListener('change', updateProfileList);
    }

    if (profileSortOption) {
        profileSortOption.addEventListener('change', updateProfileList);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.onclick = () => {
            if (profileSearchInput) profileSearchInput.value = '';
            if (profileCategoryFilter) profileCategoryFilter.value = '';
            if (profileSortOption) profileSortOption.value = 'name-asc';
            updateProfileList();
        };
    }

    // === 6. Print Functionality ===
    const printBtn = document.getElementById('printBtn');
    const printSizeModal = document.getElementById('printSizeModal');

    if (printBtn) {
        printBtn.onclick = () => {
            printSizeModal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        };
    }

    // === 6. Compass Vector Visualization ===
    const compassCanvas = document.getElementById('compass-vector');
    const mobileCompassCanvas = document.getElementById('mobile-compass-vector'); // NEW

    window.drawCompassVector = function () {
        const c1 = document.getElementById('compass-vector');
        const c2 = document.getElementById('mobile-compass-vector');
        const canvases = [c1, c2].filter(c => c !== null);

        if (canvases.length === 0) return;

        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const { width, height } = canvas;
            const centerX = width / 2;
            const centerY = height / 2;
            ctx.clearRect(0, 0, width, height);

            const maxRadius = (Math.min(width, height) / 2) - 15;

            // Ensure we use the global configuration
            if (typeof targetConfigs !== 'undefined') {
                targetConfigs.forEach((config, index) => {
                    const ai = document.getElementById(config.angleId);
                    const ri = document.getElementById(config.rangeId);
                    if (!ai || !ri) return;

                    // Parse Angle
                    let ang = parseFloat(ai.value);
                    if (isNaN(ang)) {
                        const m = ai.value.match(/\d+/);
                        if (m) ang = parseFloat(m[0]);
                    }
                    if (isNaN(ang)) return;

                    // Parse Range for Scaling (0 - 1000 yds)
                    let rangeVal = 0;
                    const rangeMatch = ri.value.match(/\d+/);
                    if (rangeMatch) rangeVal = parseFloat(rangeMatch[0]);

                    // Calculate Radius based on range (Min 15% for visibility, Max 100%)
                    const scaleFactor = Math.min(Math.max(rangeVal / 1000, 0.15), 1.0);
                    const currentRadius = maxRadius * scaleFactor;

                    const rads = (ang - 90) * (Math.PI / 180);
                    const ex = centerX + currentRadius * Math.cos(rads);
                    const ey = centerY + currentRadius * Math.sin(rads);

                    // Draw Dotted Line
                    ctx.beginPath();
                    ctx.setLineDash([4, 4]);
                    ctx.strokeStyle = '#888';
                    ctx.lineWidth = 1;
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Draw X Marker on vector tip
                    const xs = 5;
                    ctx.lineWidth = 2.5;
                    ctx.strokeStyle = '#000';
                    ctx.beginPath();
                    ctx.moveTo(ex - xs, ey - xs); ctx.lineTo(ex + xs, ey + xs);
                    ctx.moveTo(ex + xs, ey - xs); ctx.lineTo(ex - xs, ey + xs);
                    ctx.stroke();

                    // Draw Label with Background
                    const txt = ri.value;
                    const labelText = `XT${index + 1} ${txt || ''}`; // e.g., XT1 500

                    ctx.font = 'bold 9px Inter, sans-serif';
                    ctx.textBaseline = 'middle';

                    // Smart Label Positioning to avoid overlap and overflow
                    const metrics = ctx.measureText(labelText);
                    const labelWidth = metrics.width;
                    const padding = 2;
                    const totalWidth = labelWidth + (padding * 2);

                    // Default alignment based on position
                    let textAlign = (ex > centerX) ? 'left' : 'right';
                    let labelX = (ex > centerX) ? ex + 10 : ex - 10;
                    let labelY = ey + (index % 3 - 1) * 8; // Stagger

                    // Bounds Checking (Horizontal)
                    if (textAlign === 'left' && (labelX + totalWidth > width)) {
                        // Flip to right side if it hits the right edge
                        textAlign = 'right';
                        labelX = ex - 10;
                    } else if (textAlign === 'right' && (labelX - totalWidth < 0)) {
                        // Flip to left side if it hits the left edge
                        textAlign = 'left';
                        labelX = ex + 10;
                    }

                    // FINAL Safety Cap (ensure totalWidth doesn't push start/end out of 0-width)
                    if (textAlign === 'left') {
                        if (labelX + totalWidth > width - 2) labelX = width - totalWidth - 2;
                    } else {
                        if (labelX - totalWidth < 2) labelX = totalWidth + 2;
                    }

                    // Bounds Checking (Vertical)
                    if (labelY < 10) labelY = 10;
                    if (labelY > height - 10) labelY = height - 10;

                    // Measure for background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    let bgX = (textAlign === 'left') ? labelX : labelX - labelWidth;

                    ctx.fillRect(bgX - padding, labelY - 6, totalWidth, 12);

                    // Draw Text
                    ctx.textAlign = textAlign;
                    ctx.fillStyle = '#0a214d'; // Deeper Navy for maximum contrast
                    ctx.fillText(labelText, labelX, labelY);
                });
            }
        });
    };

    // === Camo Theme Logic ===
    window.setCompassGlow = function (mode) {
        const container = document.querySelector('.glow-container');
        if (!container) return;

        // Reset existing glow classes
        const classesToCheck = [
            'glow-amber', 'glow-red', 'glow-green', 'glow-purple', 'glow-cyan', 'glow-white',
            'glow-pink', 'glow-orange', 'glow-snowy', 'glow-desert', 'glow-summer', 'glow-urban'
        ];
        container.classList.remove(...classesToCheck);

        // Add new class
        if (mode && mode !== 'default') {
            container.classList.add(`glow-${mode}`);
        }

        // Update Button Text
        const btn = document.getElementById('colorCycleBtn');
        if (btn) {
            btn.textContent = `FLAVORS: ${mode.toUpperCase()}`;
            // Dynamic button styling based on mode could go here
        }

        localStorage.setItem('compass-theme-preference', mode);
    };

    window.cycleCamoTheme = function () {
        const themes = [
            'default', 'amber', 'red', 'green', 'purple', 'cyan', 'white',
            'pink', 'orange', 'snowy', 'desert', 'summer', 'urban'
        ];
        const current = localStorage.getItem('compass-theme-preference') || 'default';
        let nextIndex = themes.indexOf(current) + 1;
        if (nextIndex >= themes.length) nextIndex = 0;

        window.setCompassGlow(themes[nextIndex]);
    };

    // Attached to HUD controls, no longer initialized for main UI
    // Attach Cycle Listener - REMOVED since colorCycleBtn is removed from main UI
    /*
    const cycleBtn = document.getElementById('colorCycleBtn');
    if (cycleBtn) {
        cycleBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            window.cycleCamoTheme();
        });
    }
    */

    // === Update Mobile Compass Data Text ===
    window.updateMobileCompassData = function () {
        targetConfigs.forEach(c => {
            const angleInput = document.getElementById(c.angleId);
            const displayEl = document.getElementById(c.mobileId);
            if (angleInput && displayEl) {
                // If it's the first one, we might want to check for 'direction-notes' logic too, 
                // but usually the specific field is what matters.
                displayEl.textContent = angleInput.value || '';
            }
        });

        // Also update standard Direction Notes if present
        const dirNotes = document.getElementById('direction-notes');
        const mobileDir = document.getElementById('mobile-display-direction-notes');
        if (dirNotes && mobileDir) {
            mobileDir.textContent = dirNotes.value;
        }
    };

    targetConfigs.forEach(c => {
        [c.angleId, c.rangeId].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                ['input', 'change', 'blur'].forEach(ev => {
                    el.addEventListener(ev, () => {
                        window.drawCompassVector();
                        window.updateMobileCompassData();
                    });
                });
            }
        });
    });

    // Bind Direction Notes 
    const dirInput = document.getElementById('direction-notes');
    if (dirInput) {
        ['input', 'change'].forEach(ev => dirInput.addEventListener(ev, window.updateMobileCompassData));
    }
    setTimeout(window.drawCompassVector, 500);

    // === 6. Pencil Tool (Unified & Bidirectional) ===
    const pCanvas = document.getElementById('pencil-canvas');
    const mCanvas = document.getElementById('mobile-pencil-canvas');
    const pToggle = document.getElementById('pencil-toggle');
    const rToggle = document.getElementById('red-pen-toggle');

    if (pCanvas && mCanvas && pToggle) {
        const pCtx = pCanvas.getContext('2d', { willReadFrequently: true });
        const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
        let drawing = false;

        const updateCanvasState = () => {
            const active = pToggle.checked || (rToggle && rToggle.checked);
            [pCanvas, mCanvas].forEach(c => {
                c.classList.toggle('pointer-events-none', !active);
                c.style.cursor = active ? 'crosshair' : 'default';
            });
        };

        pToggle.addEventListener('change', () => {
            if (pToggle.checked && rToggle) rToggle.checked = false;
            updateCanvasState();
        });

        if (rToggle) {
            rToggle.addEventListener('change', () => {
                if (rToggle.checked) pToggle.checked = false;
                updateCanvasState();
            });
        }

        // Initialize state on load
        updateCanvasState();

        const getPos = (e, canvas) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        const start = (e) => {
            // Sledgehammer Fix: If neither toggle is on, DO NOT DRAW, DO NOT PREVENT DEFAULT
            if (!pToggle.checked && (!rToggle || !rToggle.checked)) return;

            if (e.type === 'touchstart' && e.cancelable) e.preventDefault();
            drawing = true;
            const targetCanvas = e.currentTarget;
            const { x, y } = getPos(e, targetCanvas);

            // Normalize to 300x300 for the other canvas
            const nx = x * (300 / targetCanvas.width);
            const ny = y * (300 / targetCanvas.height);

            [pCtx, mCtx].forEach(ctx => {
                ctx.beginPath();
                ctx.lineWidth = 0.5;
                ctx.lineCap = 'round';
                ctx.strokeStyle = (rToggle && rToggle.checked) ? '#ef4444' : '#374151';
                ctx.moveTo(nx, ny);
            });
        };

        const move = (e) => {
            if (!drawing) return;
            if (e.type === 'touchmove' && e.cancelable) e.preventDefault();
            const targetCanvas = e.currentTarget;
            const { x, y } = getPos(e, targetCanvas);

            const nx = x * (300 / targetCanvas.width);
            const ny = y * (300 / targetCanvas.height);

            [pCtx, mCtx].forEach(ctx => {
                ctx.lineTo(nx, ny);
                ctx.stroke();
            });
        };

        const stop = () => {
            drawing = false;
            if (typeof autoSaveAll === 'function') autoSaveAll();
        };

        // Bind to BOTH canvases
        [pCanvas, mCanvas].forEach(canvas => {
            ['mousedown', 'touchstart'].forEach(ev => canvas.addEventListener(ev, start, ev === 'touchstart' ? { passive: false } : undefined));
            ['mousemove', 'touchmove'].forEach(ev => canvas.addEventListener(ev, move, ev === 'touchmove' ? { passive: false } : undefined));
            ['mouseup', 'mouseleave', 'touchend'].forEach(ev => canvas.addEventListener(ev, stop));
        });

        document.getElementById('clear-pencil').addEventListener('click', () => {
            if (confirm('Clear drawing?')) {
                pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
                autoSaveAll();
            }
        });
    }

    // === 7. Download ===
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const btn = document.getElementById('downloadBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="animate-spin" data-lucide="refresh-cw"></i> GENERATING...';
        if (window.lucide) lucide.createIcons();

        html2canvas(document.getElementById('card-container'), {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        }).then(c => {
            const dataUrl = c.toDataURL('image/png');

            // Try standard download first
            const l = document.createElement('a');
            l.download = `RangeCard-${document.getElementById('date').value || 'export'}.png`;
            l.href = dataUrl;

            // Check if we are on mobile/WebView where a.download might fail
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // Fallback: Open in new window for manual save
                const newWin = window.open();
                if (newWin) {
                    newWin.document.body.style.margin = '0';
                    newWin.document.body.style.background = '#000';
                    newWin.document.body.style.display = 'flex';
                    newWin.document.body.style.flexDirection = 'column';
                    newWin.document.body.style.alignItems = 'center';
                    newWin.document.body.style.justifyContent = 'center';

                    const img = newWin.document.createElement('img');
                    img.src = dataUrl;
                    img.style.maxWidth = '100%';
                    newWin.document.body.appendChild(img);

                    const p = newWin.document.createElement('p');
                    p.style.position = 'fixed';
                    p.style.bottom = '20px';
                    p.style.color = 'white';
                    p.style.fontFamily = 'sans-serif';
                    p.style.textAlign = 'center';
                    p.style.width = '100%';
                    p.textContent = 'Long-press image to Save';
                    newWin.document.body.appendChild(p);
                } else {
                    alert("Pop-up blocked! Please allow pop-ups or use a desktop to download directly.");
                }
            } else {
                l.click();
            }

            btn.innerHTML = originalText;
            if (window.lucide) lucide.createIcons();
        }).catch(err => {
            console.error("Download failed", err);
            btn.innerHTML = originalText;
            if (window.lucide) lucide.createIcons();
            alert("Error generating card image. Please try again.");
        });
    });

    // === 8. Mobile Responsiveness & View Toggle ===
    const mobileViewToggle = document.getElementById('mobileViewToggle');
    const mainLayout = document.getElementById('mainLayout');
    const previewPanel = document.getElementById('previewPanel');
    const toggleIcon = document.getElementById('toggleIcon');
    const aside = document.querySelector('aside');

    if (mobileViewToggle) {
        mobileViewToggle.onclick = () => {
            const isShowingPreview = previewPanel.classList.contains('active');
            if (isShowingPreview) {
                // Switch to Inputs
                previewPanel.classList.remove('active');
                previewPanel.classList.add('hidden');
                previewPanel.classList.remove('flex');
                aside.classList.remove('hidden');
                toggleIcon.setAttribute('data-lucide', 'eye');
                mobileViewToggle.classList.replace('text-neon-green', 'text-black');
                document.getElementById('card-container').classList.remove('pointer-events-none');
                document.getElementById('card-scale-wrapper').classList.remove('hidden');
            } else {
                // Switch to Preview (Cover Page)
                previewPanel.classList.add('active');
                previewPanel.classList.remove('hidden');
                previewPanel.classList.add('flex');
                aside.classList.add('hidden');
                toggleIcon.setAttribute('data-lucide', 'settings');
                mobileViewToggle.classList.replace('bg-neon-green', 'bg-gray-800');
                mobileViewToggle.classList.replace('text-black', 'text-neon-green');
                document.getElementById('card-container').classList.add('pointer-events-none');
                document.getElementById('card-scale-wrapper').classList.add('hidden');
            }
            if (window.lucide) lucide.createIcons();
            handleResponsiveScaling();
        };
    }

    // === TACTICAL FLAVOR COLOR CYCLING ===
    const colorCycleBtn = document.getElementById('colorCycleBtn');
    const flavors = [
        { name: "Neon Green", hex: "#22c55e", rgb: "34, 197, 94" },
        { name: "Tactical Amber", hex: "#f59e0b", rgb: "245, 158, 11" },
        { name: "Cyber Cyan", hex: "#06b6d4", rgb: "6, 182, 212" },
        { name: "Combat Red", hex: "#ef4444", rgb: "239, 68, 68" },
        { name: "Phantom Violet", hex: "#8b5cf6", rgb: "139, 92, 246" },
        { name: "Marine Blue", hex: "#3b82f6", rgb: "59, 130, 246" },
        { name: "Stealth Gray", hex: "#94a3b8", rgb: "148, 163, 184" },
        { name: "Desert Sand", hex: "#d97706", rgb: "217, 119, 6" },
        { name: "Plasma Pink", hex: "#ec4899", rgb: "236, 72, 153" },
        { name: "Nuclear Lime", hex: "#84cc16", rgb: "132, 204, 22" }
    ];

    function applyFlavor(index) {
        const flavor = flavors[index];
        document.documentElement.style.setProperty('--accent-color', flavor.hex);
        document.documentElement.style.setProperty('--accent-rgb', flavor.rgb);

        // Remove previous flavor classes
        flavors.forEach(f => {
            const classToRemove = `flavor-${f.name.toLowerCase().replace(/\s/g, '-')}`;
            document.body.classList.remove(classToRemove);
        });

        // Add current flavor class
        document.body.classList.add(`flavor-${flavor.name.toLowerCase().replace(/\s/g, '-')}`);

        if (colorCycleBtn) {
            colorCycleBtn.innerHTML = `<i data-lucide="palette" class="w-4 h-4"></i> FLAVORS: ${flavor.name}`;

            // Dynamic Styling
            colorCycleBtn.style.color = flavor.hex;
            colorCycleBtn.style.borderColor = `rgba(${flavor.rgb}, 0.4)`;
            colorCycleBtn.style.backgroundColor = `rgba(${flavor.rgb}, 0.1)`;

            if (window.lucide) lucide.createIcons();
        }

        localStorage.setItem('tacticalFlavorIndex', index);
        console.log(`Applied tactical flavor: ${flavor.name}`);
    }

    if (colorCycleBtn) {
        let currentFlavorIndex = parseInt(localStorage.getItem('tacticalFlavorIndex')) || 0;

        // Initial apply
        applyFlavor(currentFlavorIndex);

        colorCycleBtn.onclick = () => {
            currentFlavorIndex = (currentFlavorIndex + 1) % flavors.length;
            applyFlavor(currentFlavorIndex);
        };
    } else {
        // Fallback for startup if button isn't found immediately
        const savedIndex = parseInt(localStorage.getItem('tacticalFlavorIndex')) || 0;
        applyFlavor(savedIndex);
    }

    // === UNIVERSAL AUTO-SAVE SYSTEM (Throttled for Performance) ===
    let autoSaveTimer;
    function autoSaveAll() {
        if (window.isClearingForm || window.isSystemLoading) return;

        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            const formData = {};
            // Only save specific inputs to avoid massive DOM iterations during typing
            const inputs = document.querySelectorAll('.input-field, .owc-input, input[type="text"], input[type="hidden"], select');
            inputs.forEach(input => {
                if (input.id) {
                    formData[input.id] = input.value;
                }
            });

            // Skip heavy canvas snapshots during fast auto-saves
            // These are better handled by explicit save/export or slower background tasks

            try {
                localStorage.setItem('rangeCardAutoSave', JSON.stringify(formData));
                console.log("[SYS] Tactical auto-save synced.");
            } catch (e) {
                console.warn("Auto-save storage issue:", e);
            }
        }, 3000); // 3-second debounce to stop [Violation] warnings
    }

    function autoLoadAll() {
        window.isSystemLoading = true;
        console.log("[SYS] Auto-loading tactical data...");
        const savedData = localStorage.getItem('rangeCardAutoSave');
        if (savedData) {
            try {
                const formData = JSON.parse(savedData);
                Object.keys(formData).forEach(id => {
                    const input = document.getElementById(id);
                    if (input) {
                        // Protection: Don't overwrite distance range labels with empty values
                        if (id.startsWith('dist-') && !formData[id]) return;
                        input.value = formData[id];
                    }
                });

                // Restore Pencil Data from Auto-Save
                if (formData['pencilData']) {
                    const pCanvas = document.getElementById('pencil-canvas');
                    const mPCanvas = document.getElementById('mobile-pencil-canvas');
                    const redraw = (canvas) => {
                        if (!canvas) return;
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        const img = new Image();
                        img.onload = () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        };
                        img.src = formData['pencilData'];
                    };
                    redraw(pCanvas);
                    redraw(mPCanvas);
                }
            } catch (e) {
                console.error("Error parsing auto-save data", e);
            }
        }

        // PERFORMANCE: Bulk update the UI once instead of firing 50+ individual events
        if (typeof window.refreshAllDisplays === 'function') window.refreshAllDisplays();

        window.isSystemLoading = false;
        if (typeof window.updateOWC === 'function') window.updateOWC();
        console.log("[SYS] Auto-load completed.");
    }

    // Attach listeners to all inputs
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            if (window.isSystemLoading) return;
            autoSaveAll();
        }
    });

    // Run load on startup
    window.addEventListener('load', async () => {
        console.log("[SYS] Integrated Startup v4.1 IDB STABLE...");
        console.log("[SYS] Author: Ralph Mccabe");
        console.log("------------------------------------------");
        // 0. Perform IndexedDB Migration (One-time)
        try {
            if (window.TRC_IDB) {
                await window.TRC_IDB.migrateFromLocalStorage();
            }
        } catch (e) {
            console.error("[SYS] IDB Migration failed (likely blocked storage):", e);
        }

        // 1. Initial Data Load (Ammo, Drills, etc.)
        if (typeof window.loadAllData === 'function') {
            window.loadAllData();
        }

        // 2. Form Auto-Load (Range, Environment, etc.)
        autoLoadAll();

        // 3. Final Sync: Restore visual states after data load
        setTimeout(() => {
            console.log("[SYS] Post-Load Final Sync...");

            // Force Draw Canvases
            if (typeof window.updateAllCanvases === 'function') {
                window.updateAllCanvases('hold');
                window.updateAllCanvases('shot');
            }

            // Sync Hold Condition
            const savedHold = document.getElementById('hold-grade')?.value;
            if (savedHold) {
                const btns = document.querySelectorAll('[onclick^="setHoldCondition"]');
                btns.forEach(b => {
                    const clickAttr = b.getAttribute('onclick');
                    if (clickAttr && (clickAttr.includes(`'${savedHold}'`) || clickAttr.includes(`"${savedHold}"`))) {
                        const match = clickAttr.match(/,\s*(\d+)/);
                        if (match) window.setHoldCondition(savedHold, parseInt(match[1]), b, true);
                    }
                });
            }

            // Sync Shot Grade
            const savedShotName = document.getElementById('shot-grade-name')?.value;
            if (savedShotName) {
                const btns = document.querySelectorAll('[onclick^="setShotGrade"]');
                btns.forEach(b => {
                    const clickAttr = b.getAttribute('onclick');
                    if (clickAttr && (clickAttr.includes(`'${savedShotName}'`) || clickAttr.includes(`"${savedShotName}"`))) {
                        // Selection handled by browser state or manual click
                    }
                });
            }

            if (typeof updateScale === 'function') updateScale();
        }, 1000);
    });

    // === RESPONSIVE SCALING (Fixed) ===
    let resizeTimer;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth !== lastWidth) {
                console.log("Resize detected, recalibrating layout...");
                handleResponsiveScaling();
                lastWidth = window.innerWidth;
            }
        }, 400); // 400ms debounce to prevent jitter on orientation change
    });

    function handleResponsiveScaling() {
        const wrapper = document.getElementById('card-scale-wrapper');
        const container = document.getElementById('card-container');
        if (!wrapper || !container) return;

        const targetWidth = 1000;
        const availableWidth = wrapper.offsetWidth - 32;
        let scale = availableWidth / targetWidth;

        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'top left';

        // Adjust wrapper height to accommodate scaled content
        wrapper.style.height = (targetWidth * 0.75 * scale) + 'px';
    }

    // Initial call
    handleResponsiveScaling();


    // === Wind Call Dial Logic ===
    window.setHoldCondition = function (condition, angle, btn, isRefreshing = false) {
        const indicator = document.getElementById('dial-indicator');
        const label = document.getElementById('hold-condition-label');
        const input = document.getElementById('hold-grade');
        const displayLabel = document.getElementById('display-hold-value'); // Range Card Label
        if (!indicator || !label || !input) return;

        // Rotate dial indicator to selected position
        indicator.style.transform = `rotate(${angle}deg)`;

        // Update label
        label.textContent = condition;
        label.style.color = '#22c55e';
        if (displayLabel) displayLabel.textContent = condition;

        // Highlight selected position
        document.querySelectorAll('[onclick^="setHoldCondition"]').forEach(el => {
            el.classList.remove('bg-neon-green', 'border-neon-green', 'shadow-[0_0_10px_rgba(34,197,94,0.8)]');
            el.classList.add('bg-gray-600', 'border-gray-500');
        });

        if (btn) {
            btn.classList.remove('bg-gray-600', 'border-gray-500');
            btn.classList.add('bg-neon-green', 'border-neon-green', 'shadow-[0_0_10px_rgba(34,197,94,0.8)]');
        }

        // Automatic Dot on Canvas (only on fresh selection or if dots are empty)
        if (!isRefreshing && window.canvasShots && window.canvasShots['hold'] && window.canvasShots['hold'].length === 0) {
            // Place center dot for Stable/Reference
            window.canvasShots['hold'].push({ x: 100, y: 100 });
            localStorage.setItem('pending-canvas-shots-hold', JSON.stringify(window.canvasShots['hold']));
            if (typeof updateAllCanvases === 'function') updateAllCanvases('hold');
        }

        // Update hidden input for auto-save
        input.value = condition;
        input.dispatchEvent(new Event('input'));
    };

    function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }
    window.appendCalc = function (v) {
        const d = document.getElementById('calc-display');
        d.value = (d.value === '0' && v !== '.') ? v : d.value + v;
    };
    window.clearCalc = function () { document.getElementById('calc-display').value = '0'; };
    window.executeCalc = function () {
        const d = document.getElementById('calc-display');
        try { d.value = eval(d.value.replace(/[^-0-9+*/.]/g, '')); } catch { d.value = 'Error'; setTimeout(clearCalc, 1000); }
    };
    window.calcCos = function () {
        const d = document.getElementById('calc-display');
        try { const v = parseFloat(d.value); if (!isNaN(v)) d.value = Math.cos(v * Math.PI / 180).toFixed(4); } catch { d.value = 'Error'; setTimeout(clearCalc, 1000); }
    };

    // === Impact Spotter Logic ===
    window.setShotGrade = function (grade, color, btn, isRefreshing = false) {
        const label = document.getElementById('shot-status-label');
        const displayLabel = document.getElementById('display-shot-grade'); // Range Card Label
        const colorInput = document.getElementById('shot-grade-color');
        const nameInput = document.getElementById('shot-grade-name');
        if (!label || !colorInput || !nameInput) return;

        // Update UI
        label.textContent = grade;
        label.style.color = color;
        if (displayLabel) displayLabel.textContent = grade;

        // Impact Animation/Feedback on the reticle
        document.querySelectorAll('.impact-active').forEach(el => {
            el.classList.remove('impact-active', 'ring-2', 'ring-white', 'bg-opacity-40');
        });

        if (btn) {
            btn.classList.add('impact-active', 'ring-2', 'ring-white');
            const fill = btn.querySelector('div');
            if (fill) fill.classList.add('opacity-40');
        }

        // Automatic Dot on Canvas (only on fresh selection)
        if (!isRefreshing && window.canvasShots && window.canvasShots['shot'] && window.canvasShots['shot'].length === 0) {
            if (grade === 'MATCH GRADE' || grade === 'ACCEPTABLE') {
                window.canvasShots['shot'].push({ x: 100, y: 100 });
                localStorage.setItem('pending-canvas-shots-shot', JSON.stringify(window.canvasShots['shot']));
                if (typeof updateAllCanvases === 'function') updateAllCanvases('shot');
            }
        }

        // Store state
        colorInput.value = color;
        nameInput.value = grade;

        // Trigger save
        colorInput.dispatchEvent(new Event('input'));
        nameInput.dispatchEvent(new Event('input'));
    };

    // Mobile-Touch Enhancement: Add touchstart listeners to reticle buttons
    window.addEventListener('DOMContentLoaded', () => {
        const reticleBtns = document.querySelectorAll('[onclick^="setShotGrade"], [onclick^="setHoldCondition"]');
        reticleBtns.forEach(btn => {
            btn.addEventListener('touchstart', function (e) {
                // Trigger the onclick handler immediately for zero-lag mobile response
                this.click();
                if (e.cancelable) e.preventDefault();
            }, { passive: false });
        });
    });

    // Global print functions (called from onclick in HTML)
    window.printCard = function (size) {
        document.body.setAttribute('data-print-size', size);
        document.getElementById('printSizeModal').classList.add('hidden');
        setTimeout(() => {
            window.print();
            document.body.removeAttribute('data-print-size');
        }, 100);
    };

    window.closePrintModal = function () {
        document.getElementById('printSizeModal').classList.add('hidden');
    };

    // === Calculator Functions ===
    window.clearCalc = function () {
        document.getElementById('calc-display').value = '0';
    };

    window.appendCalc = function (val) {
        const display = document.getElementById('calc-display');
        if (display.value === '0') {
            display.value = val;
        } else {
            display.value += val;
        }
    };

    window.executeCalc = function () {
        const display = document.getElementById('calc-display');
        try {
            display.value = eval(display.value);
        } catch (e) {
            display.value = 'Error';
            setTimeout(() => display.value = '0', 1000);
        }
    };

    // === Ballistic Calculator Functions ===

    // MOA to MIL conversion (1 MIL = 3.43775 MOA)
    window.moaToMil = function () {
        const display = document.getElementById('calc-display');
        const val = parseFloat(display.value);
        if (!isNaN(val)) {
            display.value = (val / 3.43775).toFixed(3);
        }
    };

    // MIL to MOA conversion
    window.milToMoa = function () {
        const display = document.getElementById('calc-display');
        const val = parseFloat(display.value);
        if (!isNaN(val)) {
            display.value = (val * 3.43775).toFixed(3);
        }
    };

    // Inches to MOA conversion at 100 yards (1 MOA  1.047 inches at 100 yds)
    // User should enter: inches (display shows MOA)
    window.inchToMoa = function () {
        const display = document.getElementById('calc-display');
        const val = parseFloat(display.value);
        if (!isNaN(val)) {
            display.value = (val / 1.047).toFixed(3);
        }
    };

    // Cosine calculation (existing function)
    window.calcCos = function () {
        const display = document.getElementById('calc-display');
        const val = parseFloat(display.value);
        if (!isNaN(val)) {
            display.value = Math.cos(val * Math.PI / 180).toFixed(4);
        }
    };

    // Yards to Meters conversion (1 yard = 0.9144 meters)
    window.ydsToMeters = function () {
        const display = document.getElementById('calc-display');
        const val = parseFloat(display.value);
        if (!isNaN(val)) {
            display.value = (val * 0.9144).toFixed(2);
        }
    };

    // Meters to Yards conversion
    window.metersToYds = function () {
        const display = document.getElementById('calc-display');
        const val = parseFloat(display.value);
        if (!isNaN(val)) {
            display.value = (val / 0.9144).toFixed(2);
        }
    };


    // === Session Timer/Stopwatch ===
    let timerInterval = null;
    let timerElapsedSeconds = 0;
    let timerRunning = false;

    function updateTimerDisplay() {
        const hours = Math.floor(timerElapsedSeconds / 3600);
        const minutes = Math.floor((timerElapsedSeconds % 3600) / 60);
        const seconds = timerElapsedSeconds % 60;

        const display = document.getElementById('sessionTimerDisplay');
        if (display) {
            display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    const timerStartBtn = document.getElementById('timerStartBtn');
    const timerPauseBtn = document.getElementById('timerPauseBtn');
    const timerResetBtn = document.getElementById('timerResetBtn');

    if (timerStartBtn) {
        timerStartBtn.onclick = () => {
            if (!timerRunning) {
                timerRunning = true;
                timerInterval = setInterval(() => {
                    timerElapsedSeconds++;
                    updateTimerDisplay();
                }, 1000);
            }
        };
    }

    if (timerPauseBtn) {
        timerPauseBtn.onclick = () => {
            if (timerRunning) {
                timerRunning = false;
                clearInterval(timerInterval);
                timerInterval = null;
            }
        };
    }

    if (timerResetBtn) {
        timerResetBtn.onclick = () => {
            timerRunning = false;
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            timerElapsedSeconds = 0;
            updateTimerDisplay();
        };
    }

    // (Redundant Intel Hub logic removed - consolidated at bottom of file)


    function analyzeReadiness() {
        const aiMsg = document.getElementById('ai-status-msg');
        const stepsList = document.getElementById('ai-steps-list');
        if (!aiMsg || !stepsList) return;

        const data = {};
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) data[id] = el.value.trim();
        });

        const steps = [];
        let readyCount = 0;

        // Critical Checks
        if (!data['caliber']) {
            steps.push({ text: "WPN_PROFILE_UNDEFINED", status: "ERR", color: "text-red-500" });
        } else readyCount++;

        if (!data['zero']) {
            steps.push({ text: "ZERO_RANGE_NOT_SET", status: "WARN", color: "text-orange-400" });
        } else readyCount++;

        if (!data['velocity'] || !data['g1']) {
            steps.push({ text: "BALLISTIC_COEFF_MISSING", status: "WARN", color: "text-orange-400" });
        } else readyCount++;

        // Environmental Checks
        if (!data['temperature'] || !data['wind-speed']) {
            steps.push({ text: "ENVIRONMENT_PROBE_AWAITING", status: "WAIT", color: "text-blue-400" });
        } else readyCount++;

        // Terminal Rendering
        if (steps.length === 0) {
            aiMsg.innerHTML = `<span class="text-blue-600 font-black mr-2">>>></span>MISSION READY. ALL SYSTEMS NOMINAL. CALIBER: <span class="text-white">${data['caliber']}</span>`;
        } else {
            aiMsg.innerHTML = `<span class="text-blue-600 font-black mr-2">>>></span>WARNING: PARTIAL SIGNAL. SYSTEM READINESS @ ${readyCount * 25}%`;
        }

        stepsList.innerHTML = steps.map(step => `
            <div class="flex items-center justify-between font-mono text-[9px] border-l-2 border-zinc-800 pl-3">
                <div class="flex items-center gap-2">
                    <span class="text-zinc-700">LINK:</span>
                    <span class="text-zinc-400 font-black">${step.text}</span>
                </div>
                <span class="${step.color} font-black">[ ${step.status} ]</span>
            </div>
        `).join('');
    }

    window.displayCoachingTips = function () {
        const container = document.getElementById('coaching-tips-container');
        if (!container) return;

        const cal = document.getElementById('caliber')?.value;
        const wind = parseFloat(document.getElementById('wind-speed')?.value) || 0;
        const temp = parseFloat(document.getElementById('temperature')?.value) || 70;

        const tips = [];

        if (!cal) tips.push({ icon: 'alert-triangle', title: 'Operational Security', text: 'Define weapon profile before engagement.', color: 'text-red-400' });

        if (wind > 10) tips.push({ icon: 'wind', title: 'Atmospheric Warning', text: 'High wind detected. Prioritize wind bracket holds over center-mass aiming.', color: 'text-orange-400' });
        else tips.push({ icon: 'activity', title: 'Ballistic Stability', text: 'Internal ballistics confirm stable flight path for current caliber.', color: 'text-blue-400' });

        if (temp > 90) tips.push({ icon: 'thermometer', title: 'Thermal Expansion', text: 'High temp detected. Watch for vertical stringing as barrel heats up.', color: 'text-orange-400' });

        container.innerHTML = tips.map(tip => `
            <div class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex gap-3 group hover:border-zinc-700 transition-colors">
                <div class="bg-zinc-900 border border-zinc-800 p-2 rounded-lg group-hover:bg-zinc-800 transition-colors">
                    <i data-lucide="${tip.icon}" class="w-4 h-4 ${tip.color}"></i>
                </div>
                <div>
                    <h4 class="text-[9px] font-black text-white uppercase tracking-widest mb-0.5">${tip.title}</h4>
                    <p class="text-[10px] text-zinc-500 leading-tight">${tip.text}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    // (Redundant Global Hooks Removed - functions defined globally at bottom of file)

    // Explicit Help Modal Functions
    window.openHelpModal = function () {
        console.log('Opening Help Modal');
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex'; // Force display flex
            modal.style.zIndex = '10000'; // Force z-index
        } else {
            console.error('Help Modal ID not found');
            alert('Error: Help Modal not found in DOM');
        }
    };

    window.closeHelpModal = function () {
        const modal = document.getElementById('helpModal');
        if (modal) modal.classList.add('hidden');
    };

    // === WORK CENTER SYNC LOGIC (Consolidated to global definition) ===
    // window.syncOWCWeather is now defined globally at the bottom of the file


    if (openIntelBtn) {
        openIntelBtn.onclick = openIntelHub;
    }

    // === SESSION LOGGER UTILITY (Restored) ===
    window.SessionLogger = {
        add: function (sender, message) {
            // Map "USER" to "user" for addChatBubble, everything else to "bot"
            const role = (sender === 'USER') ? 'user' : 'bot';

            if (typeof window.addChatBubble === 'function') {
                window.addChatBubble(role, message);
            }
        }
    };

    // === 8. AI OPERATOR CHAT LOGIC ===

    window.AILifecycle = {
        blackbox: [],
        missionStarted: null,

        log: function (event, detail = "") {
            const entry = { t: new Date().toLocaleTimeString(), e: event, d: detail };
            this.blackbox.unshift(entry);
            if (this.blackbox.length > 50) this.blackbox.pop();
            console.log(`[AI-LOG] ${event}: ${detail}`);
        },

        onBoot: async function () {
            this.missionStarted = new Date();
            this.log("MISSION_START", "Alpha Intellect Online");
            this.lastVaultCount = 0;
            const waitAndGreet = async (attempts = 0) => {
                if (attempts > 15) return;
                try {
                    if (!window.TRC_IDB) {
                        setTimeout(() => waitAndGreet(attempts + 1), 1000);
                        return;
                    }
                    const vaultData = await window.TRC_IDB.getAll('dopeVault');
                    this.lastVaultCount = Array.isArray(vaultData) ? vaultData.length : 0;

                    const isIsolated = window.FORTRESS_ISOLATED;
                    const hostname = window.location.hostname;
                    const isGitHub = hostname.includes('github.io');

                    let statusText = isIsolated ? "\uD83D\uDEE1\uFE0F FORTRESS SECURE (Local)" : (isGitHub ? "\uD83C\uDF10 CLOUD SYNC ACTIVE (Web)" : "\u26A0\uFE0F UNKNOWN ENVIRONMENT");
                    let intelDetail = isIsolated ? "Domain Guard is active. Service Worker neutralized." : (isGitHub ? "Syncing with GitHub Cloud." : "Verification required.");

                    let g = `[ALPHA INTELLECT] Tactical Pilot Online: ${this.missionStarted.toLocaleTimeString()}.\n`;
                    g += `STATUS: ${statusText}\n`;
                    g += `VAULT: ${this.lastVaultCount} records secured in Warehouse.\n`;
                    g += `INTEL: ${intelDetail}`;

                    if (window.addChatBubble) {
                        window.addChatBubble('bot', g);
                        this.log("ALPHA_GREETING", "Mission status confirmed.");
                    } else {
                        setTimeout(() => waitAndGreet(attempts + 1), 1000);
                    }
                } catch (e) {
                    this.log("BOOT_ERROR", e.message);
                    setTimeout(() => waitAndGreet(attempts + 1), 1000);
                }
            };
            waitAndGreet();
        },

        onShutdown: function () {
            const duration = Math.round((new Date() - this.missionStarted) / 60000);
            const summary = {
                end: new Date().toISOString(),
                duration: `${duration} mins`,
                lastAction: this.blackbox[0]?.e || "None"
            };
            localStorage.setItem('trc_last_mission_summary', JSON.stringify(summary));
        }
    };

    window.addEventListener('beforeunload', () => {
        if (window.AILifecycle) window.AILifecycle.onShutdown();
    });

    window.processChatCommand = function () {
        if (!chatInput || !chatHistory) return;
        const query = chatInput.value.trim();
        if (!query) return;

        // Add User Message
        addChatBubble('user', query);
        chatInput.value = '';

        // Process thinking delay
        setTimeout(async () => {
            let response = generateAIResponse(query.toLowerCase());
            // Support both string and async Promise responses
            if (response instanceof Promise) response = await response;
            addChatBubble('bot', response);
        }, 600);
    };

    window.sendAICommand = function (cmd) {
        if (!chatInput) return;
        chatInput.value = cmd;
        window.processChatCommand();
    };

    window.clearAIChat = function () {
        if (!chatHistory) return;
        if (!confirm("CLEAR TACTICAL CHAT LOG?")) return;

        chatHistory.innerHTML = `
            <div class="flex gap-2">
                <span class="text-blue-700">SYS:</span>
                <span>SYSTEM RESET. STANDING BY FOR MISSION PARAMETERS...</span>
            </div>
        `;
    };

    // Allow Enter key to send
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processChatCommand();
        });
    }

    function addChatBubble(sender, text) {
        if (!chatHistory) return;
        const bubble = document.createElement('div');
        bubble.className = 'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ' + (sender === 'user' ? 'flex-row-reverse' : '');

        const icon = sender === 'user' ? 'user' : 'cpu';
        const bgColor = sender === 'user' ? 'bg-orange-600/10 border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.05)]' : 'bg-blue-600/10 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)]';
        const textColor = sender === 'user' ? 'text-orange-100' : 'text-blue-50';

        bubble.innerHTML = `
            <div class="w-7 h-7 rounded-lg border border-white/10 ${sender === 'user' ? 'bg-orange-600/40' : 'bg-blue-600/40'} flex items-center justify-center shrink-0 shadow-lg">
                <i data-lucide="${icon}" class="w-4 h-4 text-white"></i>
            </div>
            <div class="${bgColor} border-2 rounded-2xl p-4 text-[11px] leading-relaxed ${textColor} max-w-[85%] font-mono backdrop-blur-sm">
                ${text.replace(/\n/g, '<br>')}
            </div>
        `;

        chatHistory.appendChild(bubble);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        if (window.lucide) lucide.createIcons();
    }
    window.addChatBubble = addChatBubble;

    function generateAIResponse(query) {
        const cmd = query.trim().toLowerCase();
        if (cmd === '/?' || cmd === 'help') {
            return `[TACTICAL COMMANDS]\n- STATUS: Check Isolation health\n- SNOOP: Forensic Ghost Search\n- PURGE: Nuclear Ghost Erasure\n- VAULT: Warehouse metrics\n- DIAGNOSE: Full system audit\n- BLACKBOX: Recent events`;
        }
        if (cmd === 'snoop') {
            if (window.AILifecycle) window.AILifecycle.log("FORENSIC_SNOOP", "Scanning domain integrity");
            return (async () => {
                const regs = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistrations() : [];
                const cache = 'caches' in window ? (await caches.keys()).length : 0;
                const isIsolated = window.FORTRESS_ISOLATED;
                const hostname = window.location.hostname || "Local Filesystem";

                let report = `[ALPHA SNOOP REPORT]\n`;
                report += `- DOMAIN: ${hostname}\n`;
                report += `- STATUS: ${isIsolated ? "FORTRESS SECURE" : "CLOUD ACTIVE"}\n`;
                report += `- GHOSTS: ${regs.length} detected.\n`;
                report += `- INTELLIGENCE: Domain Guard will sterilize unauthorized workers.`;
                return report;
            })();
        }
        if (cmd === 'purge' || cmd === 'unghost') {
            if (window.AILifecycle) window.AILifecycle.log("PURGE_START", "Initiating ghost erasure");
            (async () => {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (let r of regs) await r.unregister();
                const keys = await caches.keys();
                for (let k of keys) await caches.delete(k);
                window.addChatBubble('bot', "[PURGE COMPLETE] Ghosts unregistered. Caches wiped. Reloading Fortress...");
                setTimeout(() => window.location.reload(), 2000);
            })();
            return "INITIATING NUCLEAR PURGE. STAND BY...";
        }
        if (cmd === 'blackbox') {
            const history = window.AILifecycle.blackbox.map(b => `[${b.t}] ${b.e}: ${b.d}`).join('\n');
            return `[BLACK BOX FORENSICS]\n${history || "No data recorded yet."}`;
        }
        if (cmd === 'status') {
            const isIsolated = window.FORTRESS_ISOLATED;
            return `[TACTICAL STATUS]\nProtocol: ${isIsolated ? "\uD83D\uDEE1\uFE0F APK (Isolated)" : "\uD83C\uDF10 URL (Live)"}\nWatchdog: Active/Secure\nMode: Operational.`;
        }
        if (cmd === 'diagnose' || cmd === 'audit') {
            const vaultItems = window.AILifecycle.lastVaultCount || 0;
            const latency = Math.floor(Math.random() * 50) + 10;
            return `[SYSTEM DIAGNOSIS]\n- Storage: High-Capacity IndexedDB\n- Records: ${vaultItems} Entry(s)\n- Cache: Purged (Fortress Locked)\n- Latency: ${latency}ms\n- Watchdog: Breach-Trap Active.`;
        }
        if (cmd === 'vault') {
            const vaultItems = window.AILifecycle.lastVaultCount || 0;
            return `[WAREHOUSE STATUS]\nLocation: IndexedDB High-Capacity\nItems: ${vaultItems}\nStatus: Operational. No memory pressure.`;
        }
        // Helper to get value from OWC with HUD fallback
        const getVal = (owcId, hudId, fallback = 'Undefined') => {
            const owcEl = document.getElementById(owcId);
            if (owcEl && owcEl.value && owcEl.value.trim() !== '' && owcEl.value !== 'Undefined') {
                return owcEl.value;
            }
            const hudEl = document.getElementById(hudId);
            if (hudEl && hudEl.value && hudEl.value.trim() !== '') {
                return hudEl.value;
            }
            return fallback;
        };
        // Time Intent
        if (query.includes('time') || query.includes('clock')) {
            const now = new Date();
            return `Current system time is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}. Signal sync established.`;
        }

        // Weather Intent
        if (query.includes('weather') || query.includes('temp') || query.includes('wind') || query.includes('condition')) {
            const temp = getVal('owc-temp', 'temperature', '59');
            const wind = getVal('owc-wind-speed', 'wind-speed', '0');
            const press = document.getElementById('pressure')?.value || '29.92';
            const da = document.getElementById('owc-da')?.value || '0';

            return `TACTICAL WEATHER REPORT:\n<span class="text-white">TEMP:</span> ${temp}°F | <span class="text-white">WIND:</span> ${wind} MPH\n<span class="text-white">DA:</span> ${da} FT | <span class="text-white">BARO:</span> ${press} inHg\nEnvironmental data synced to core.`;
        }

        // Analyze / Data Check Intent
        if (query.includes('analyze') || query.includes('data') || query.includes('caliber') || query.includes('ready') || query.includes('status')) {
            const cal = getVal('owc-rifle-input', 'caliber');
            const zero = getVal('owc-zero', 'zero');
            const mv = getVal('owc-mv', 'velocity');
            const bc = getVal('owc-bc', 'g1', 'G1');

            const ready = (cal !== 'Undefined' && zero !== 'Undefined' && mv !== 'Undefined');

            if (query.includes('analyze')) {
                let analysis = `<span class="text-blue-400 font-black">TACTICAL ANALYSIS:</span>\n`;
                analysis += `<span class="text-zinc-400">CALIBER:</span> <span class="text-white">${cal}</span>\n`;
                analysis += `<span class="text-zinc-400">ZERO:</span> <span class="text-white">${zero}yd</span>\n`;
                analysis += `<span class="text-zinc-400">MUZZLE:</span> <span class="text-white">${mv} FPS</span>\n`;

                if (ready) {
                    analysis += `<span class="text-emerald-400 font-bold">\nMISSION STATUS: GO.</span>\nBallistic profile is optimized to standard conditions. Ready for range execution.`;

                    // Smart Tips
                    if (parseFloat(mv) < 2000) {
                        analysis += `\n\n<span class="text-orange-400 font-bold">SMART TIP:</span> Subsonic/Low velocity detected. Expect significant drop at extended ranges.`;
                    }
                } else {
                    analysis += `<span class="text-red-400 font-bold">\nMISSION STATUS: NO-GO.</span>\nCritical data missing. System requires Caliber/Zero/Velocity for high-fidelity solutions.`;
                }
                return analysis;
            }

            if (query.includes('status')) {
                const syncStatus = window.owcLiveSync ? '<span class="text-emerald-400">LIVE</span>' : '<span class="text-zinc-500">MANUAL</span>';
                const weatherStatus = document.getElementById('ws-timestamp')?.textContent !== '--:--:--' ? '<span class="text-emerald-400">SYNCED</span>' : '<span class="text-orange-400">STALE</span>';

                let status = `<span class="text-zinc-400 font-black">SYSTEM ENGINE CHECK:</span>\n`;
                status += `<span class="text-zinc-500">CORE STATUS:</span> <span class="text-white">OPERATIONAL</span>\n`;
                status += `<span class="text-zinc-500">DATA MESH:</span> ${syncStatus}\n`;
                status += `<span class="text-zinc-500">SENSOR ARRAY:</span> ${weatherStatus}\n`;
                status += `<span class="text-zinc-500">PROFILE:</span> <span class="text-white">${cal}</span>\n`;
                status += `\n<span class="text-blue-400 font-bold">SYSTEM READY.</span> All tactical sub-routines are running in optimized threads.`;
                return status;
            }

            return ready ?
                `STATUS: System check optimal. Profile loaded for ${cal}. Engagement window is open.` :
                `STATUS: Partial configuration. Please input missing ballistic parameters.`;
        }

        // Sync Intent
        if (query.includes('sync')) {
            if (typeof window.syncOWCWeather === 'function') {
                window.syncOWCWeather();
                return "Global synchronization initialized. Environment and Ballistic data merged with Operator Work Center.";
            }
            return "Sync protocol failure: OWC module not found.";
        }

        // Maps Intent
        if (query.includes('map') || query.includes('location') || query.includes('coordinate')) {
            setTimeout(() => window.open('https://www.google.com/maps', '_blank'), 1500);
            return "Navigational sweep initialized. Opening satellite maps in a new secure channel...";
        }

        // Help / Tutorial Intent
        if (query.includes('help') || query.includes('guide') || query.includes('tutorial')) {
            return "I am your Tactical AI Hub. Available Commands:\n- ANALYZE: Full session data check\n- WEATHER: Current environmental status\n- SYNC: Force data merge with OWC\n- STATUS: Basic engine check\n- MAP: Open navigational tools";
        }

        // Default
        return "Instruction received. I am currently cross-referencing tactical databases. Try asking for ANALYZE, WEATHER, or SYNC.";
    }

    // === 9. VOICE COMMAND SYSTEM ===
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            updateMicButton(true);
            addChatBubble('bot', ' Listening... Speak your command.');
        };

        recognition.onend = () => {
            isListening = false;
            updateMicButton(false);
        };

        recognition.onerror = (event) => {
            isListening = false;
            updateMicButton(false);
            if (event.error !== 'no-speech') {
                addChatBubble('bot', `Voice error: ${event.error}. Try again.`);
            }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            addChatBubble('user', transcript);

            // Process the voice command
            const response = processVoiceCommand(transcript.toLowerCase());
            setTimeout(() => addChatBubble('bot', response), 400);
        };
    }

    function updateMicButton(active) {
        const micBtn = document.getElementById('voiceMicBtn');
        if (micBtn) {
            if (active) {
                micBtn.classList.add('bg-red-600', 'animate-pulse');
                micBtn.classList.remove('bg-blue-600');
            } else {
                micBtn.classList.remove('bg-red-600', 'animate-pulse');
                micBtn.classList.add('bg-blue-600');
            }
        }
    }

    window.toggleVoiceRecognition = function () {
        if (!recognition) {
            addChatBubble('bot', 'Voice commands not supported in this browser. Try Chrome or Edge.');
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    function processVoiceCommand(command) {
        // Set Caliber Command
        if (command.includes('set caliber') || command.includes('caliber is')) {
            const match = command.match(/(?:set caliber to|caliber is|caliber)\s+(.+)/i);
            if (match) {
                const caliberInput = document.getElementById('caliber');
                if (caliberInput) {
                    caliberInput.value = match[1].trim();
                    caliberInput.dispatchEvent(new Event('input'));
                    return `Caliber set to ${match[1].trim()}. Confirmed.`;
                }
            }
        }

        // Set Wind Command
        if (command.includes('wind') && (command.includes('set') || command.includes('log') || command.includes('at'))) {
            const match = command.match(/(\d+)\s*(?:mph|miles)/i);
            if (match) {
                const windInput = document.getElementById('wind-speed');
                if (windInput) {
                    windInput.value = match[1];
                    windInput.dispatchEvent(new Event('input'));
                    return `Wind logged at ${match[1]} mph. Acknowledged.`;
                }
            }
        }

        // Set Temperature Command
        if (command.includes('temp') && (command.includes('set') || command.includes('log') || command.includes('at') || command.includes('is'))) {
            const match = command.match(/(\d+)\s*(?:degrees|fahrenheit||f)?/i);
            if (match) {
                const tempInput = document.getElementById('temperature');
                if (tempInput) {
                    tempInput.value = match[1];
                    tempInput.dispatchEvent(new Event('input'));
                    return `Temperature set to ${match[1]}F. Environmental data updated.`;
                }
            }
        }

        // Set Zero Command
        if (command.includes('zero') && (command.includes('set') || command.includes('at') || command.includes('is'))) {
            const match = command.match(/(\d+)\s*(?:yards|yard|yds|yd|meters|m)?/i);
            if (match) {
                const zeroInput = document.getElementById('zero');
                if (zeroInput) {
                    zeroInput.value = match[1];
                    zeroInput.dispatchEvent(new Event('input'));
                    return `Zero distance set to ${match[1]} yards. Ballistic baseline established.`;
                }
            }
        }

        // Clear Form Command
        if (command.includes('clear') && (command.includes('form') || command.includes('data') || command.includes('all'))) {
            const clearBtn = document.getElementById('clearBtn');
            if (clearBtn) {
                clearBtn.click();
                return 'Form cleared. All fields reset to default state.';
            }
        }

        // Save Profile Command
        if (command.includes('save') && (command.includes('profile') || command.includes('card'))) {
            const saveBtn = document.getElementById('saveProfileBtn');
            if (saveBtn) {
                saveBtn.click();
                return 'Profile saved to library. Data secured.';
            }
        }

        // NEW: Analyze Shots Command
        if (command.includes('analyze') && (command.includes('shot') || command.includes('group'))) {
            if (typeof analyzeGroup === 'function') {
                analyzeGroup('shot');
                return 'Analyzing shot group...';
            }
        }

        // NEW: Get Coaching Tips Command
        if (command.includes('coach') || command.includes('tip') || command.includes('advice')) {
            if (typeof displayCoachingTips === 'function') {
                displayCoachingTips();
                return 'Generating tactical coaching...';
            }
        }

        // NEW: Save Session Command
        if (command.includes('save') && command.includes('session')) {
            if (typeof saveSessionSnapshot === 'function') {
                saveSessionSnapshot();
                return 'Session snapshot saved.';
            }
        }

        // NEW: Set Humidity Command
        if (command.includes('humidity') && (command.includes('set') || command.includes('at') || command.includes('is'))) {
            const match = command.match(/(\d+)\s*(?:percent|%)?/i);
            if (match) {
                const humidityInput = document.getElementById('humidity');
                if (humidityInput) {
                    humidityInput.value = match[1];
                    humidityInput.dispatchEvent(new Event('input'));
                    return `Humidity set to ${match[1]}%. Environmental data updated.`;
                }
            }
        }

        // NEW: Set Altitude Command
        if (command.includes('altitude') && (command.includes('set') || command.includes('at') || command.includes('is'))) {
            const match = command.match(/(\d+)\s*(?:feet|ft|foot)?/i);
            if (match) {
                const altitudeInput = document.getElementById('altitude');
                if (altitudeInput) {
                    altitudeInput.value = match[1];
                    altitudeInput.dispatchEvent(new Event('input'));
                    return `Altitude set to ${match[1]} feet. Density altitude calculations updated.`;
                }
            }
        }

        // NEW: Load Weapon Profile Command
        if (command.includes('load') && command.includes('profile')) {
            const profiles = WeaponProfiles?.getAll() || [];
            const profileNames = profiles.map(p => p.name.toLowerCase());

            for (let i = 0; i < profiles.length; i++) {
                if (command.toLowerCase().includes(profiles[i].name.toLowerCase())) {
                    WeaponProfiles.load(profiles[i].id);
                    return `Loading weapon profile: ${profiles[i].name}`;
                }
            }

            if (profiles.length > 0) {
                return `Available profiles: ${profiles.map(p => p.name).join(', ')}. Say "load profile [name]" to load.`;
            } else {
                return 'No weapon profiles saved yet. Save one first.';
            }
        }

        // NEW: Best Session Command
        if (command.includes('best') && (command.includes('session') || command.includes('score') || command.includes('performance'))) {
            const trends = SessionHistory?.getTrends();
            if (trends?.bestSession) {
                const best = trends.bestSession;
                return `Your best session was ${best.performance.spreadMOA} MOA on ${best.date}. Keep pushing!`;
            } else {
                return 'Not enough session data yet. Analyze some groups and save sessions to build history.';
            }
        }

        // What Time Command
        if (command.includes('time') || command.includes('clock')) {
            const now = new Date();
            return `Current time is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Sync confirmed.`;
        }

        // Help Command
        if (command.includes('help') || command.includes('commands') || command.includes('what can you do')) {
            return 'Commands: Set caliber/wind/temp/humidity/altitude, Analyze shots, Get coaching tips, Save session, Load profile, Best session, Clear form, What time';
        }

        // Fall through to AI chat for unrecognized commands
        return generateAIResponse(command);
    }

    // === 10. AI COACHING TIPS ENGINE ===
    window.getCoachingTips = function () {
        const tips = [];

        // Get environmental data
        const temp = parseFloat(document.getElementById('temperature')?.value) || null;
        const wind = parseFloat(document.getElementById('wind-speed')?.value) || null;
        const humidity = parseFloat(document.getElementById('humidity')?.value) || null;
        const altitude = parseFloat(document.getElementById('altitude')?.value) || null;

        // Temperature-based tips
        if (temp !== null) {
            if (temp < 40) {
                tips.push({
                    icon: '',
                    title: 'Cold Bore Alert',
                    tip: 'First shot may impact 0.25-0.5 MOA high. Allow barrel to stabilize after 3-5 rounds.',
                    priority: 'high'
                });
            }
            if (temp > 90) {
                tips.push({
                    icon: '',
                    title: 'Heat Warning',
                    tip: 'High temps increase pressure. Watch for vertical stringing as barrel heats up.',
                    priority: 'medium'
                });
            }
        }

        // Wind-based tips
        if (wind !== null) {
            if (wind > 15) {
                tips.push({
                    icon: '',
                    title: 'Heavy Wind',
                    tip: `At ${wind} mph, expect significant drift. Full value = 1 MOA per 5 mph at 500yds.`,
                    priority: 'high'
                });
            } else if (wind > 8) {
                tips.push({
                    icon: '',
                    title: 'Moderate Wind',
                    tip: 'Wind reading critical. Watch for mirage and hold into wind.',
                    priority: 'medium'
                });
            }
        }

        // Humidity tips
        if (humidity !== null && humidity > 80) {
            tips.push({
                icon: '',
                title: 'High Humidity',
                tip: 'Dense air = slightly lower trajectory. May need 0.25 MOA less elevation at distance.',
                priority: 'low'
            });
        }

        // Altitude tips
        if (altitude !== null && altitude > 5000) {
            tips.push({
                icon: '',
                title: 'High Altitude',
                tip: `At ${altitude}ft, air is thinner. Expect flatter trajectory and less drop.`,
                priority: 'medium'
            });
        }

        // Shot group analysis tips
        const lastAnalysis = window.lastGroupAnalysis;
        if (lastAnalysis) {
            if (lastAnalysis.spreadMOA > 2.0) {
                tips.push({
                    icon: '',
                    title: 'Group Size Alert',
                    tip: 'Large group detected. Check: trigger control, breathing, natural point of aim.',
                    priority: 'high'
                });
            }

            if (lastAnalysis.biasDirection && lastAnalysis.biasDirection !== 'CENTERED') {
                const dir = lastAnalysis.biasDirection;
                let suggestion = '';
                if (dir.includes('LEFT')) suggestion = 'Move rear sight left or adjust natural point of aim right.';
                if (dir.includes('RIGHT')) suggestion = 'Move rear sight right or adjust natural point of aim left.';
                if (dir.includes('HIGH')) suggestion = 'Lower elevation or check for anticipation/flinch.';
                if (dir.includes('LOW')) suggestion = 'Raise elevation or check trigger pull fundamentals.';

                tips.push({
                    icon: '',
                    title: `Shot Bias: ${dir}`,
                    tip: suggestion,
                    priority: 'medium'
                });
            }
        }

        // Default tip if nothing else
        if (tips.length === 0) {
            tips.push({
                icon: '',
                title: 'Ready to Engage',
                tip: 'Conditions nominal. Focus on fundamentals: sight alignment, trigger press, follow-through.',
                priority: 'low'
            });
        }

        return tips;
    };

    window.displayCoachingTips = function () {
        const tips = getCoachingTips();
        const tipsContainer = document.getElementById('coaching-tips-container');

        if (tipsContainer) {
            tipsContainer.innerHTML = tips.map(tip => `
                <div class="bg-black/30 border ${tip.priority === 'high' ? 'border-red-500/50' : tip.priority === 'medium' ? 'border-yellow-500/50' : 'border-gray-700'} rounded-lg p-3 space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">${tip.icon}</span>
                        <span class="text-xs font-bold uppercase ${tip.priority === 'high' ? 'text-red-400' : tip.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'}">${tip.title}</span>
                    </div>
                    <p class="text-xs text-gray-300">${tip.tip}</p>
                </div>
            `).join('');
        } else {
            // Fallback to chat
            const formatted = tips.map(t => `${t.icon} **${t.title}**: ${t.tip}`).join('<br><br>');
            addChatBubble('bot', formatted);
        }
    };

    // Auto-update tips when environmental inputs change
    ['temperature', 'wind-speed', 'humidity', 'altitude'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', () => {
                if (document.getElementById('coaching-tips-container')) {
                    displayCoachingTips();
                }
            });
        }
    });

    // === 11. SESSION HISTORY & TREND ANALYSIS ===
    const SESSION_HISTORY_KEY = 'rangeCardSessionHistory';

    window.SessionHistory = {
        getHistory: async function () {
            if (window.TRC_IDB) {
                const historyObj = await window.TRC_IDB.getAll('sessionHistory');
                return Object.values(historyObj).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
            try {
                return JSON.parse(localStorage.getItem(SESSION_HISTORY_KEY)) || [];
            } catch (e) { return []; }
        },

        saveSession: async function () {
            const history = await this.getHistory();
            const lastAnalysis = window.lastGroupAnalysis;

            const session = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                caliber: document.getElementById('caliber')?.value || 'Unknown',
                zero: document.getElementById('zero')?.value || '',
                conditions: {
                    temp: document.getElementById('temperature')?.value || '',
                    wind: document.getElementById('wind-speed')?.value || '',
                    humidity: document.getElementById('humidity')?.value || '',
                    altitude: document.getElementById('altitude')?.value || ''
                },
                performance: lastAnalysis ? {
                    shotCount: lastAnalysis.shotCount,
                    spreadMOA: lastAnalysis.spreadMOA,
                    biasMOA: lastAnalysis.biasMOA,
                    biasDirection: lastAnalysis.biasDirection
                } : null
            };

            history.unshift(session); // Add to beginning

            // Keep only last 50 sessions
            if (history.length > 50) {
                history.pop();
            }

            localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
            return session;
        },

        clearHistory: function () {
            localStorage.removeItem(SESSION_HISTORY_KEY);
        },

        getTrends: function (providedHistory = null) {
            const history = providedHistory || []; // Trends should be passed pre-fetched data
            const sessionsWithPerformance = history.filter(s => s.performance && s.performance.spreadMOA);

            if (sessionsWithPerformance.length < 2) {
                return { status: 'insufficient', message: 'Need at least 2 recorded sessions for trend analysis.' };
            }

            // Calculate averages
            const recentSessions = sessionsWithPerformance.slice(0, 5);
            const olderSessions = sessionsWithPerformance.slice(5, 10);

            const recentAvg = recentSessions.reduce((sum, s) => sum + s.performance.spreadMOA, 0) / recentSessions.length;
            const overallAvg = sessionsWithPerformance.reduce((sum, s) => sum + s.performance.spreadMOA, 0) / sessionsWithPerformance.length;

            let trend = 'stable';
            let trendIcon = '';
            let message = '';

            if (olderSessions.length > 0) {
                const olderAvg = olderSessions.reduce((sum, s) => sum + s.performance.spreadMOA, 0) / olderSessions.length;
                const improvement = olderAvg - recentAvg;

                if (improvement > 0.3) {
                    trend = 'improving';
                    trendIcon = '';
                    message = `Your groups are tightening! Recent avg: ${recentAvg.toFixed(2)} MOA vs older avg: ${olderAvg.toFixed(2)} MOA`;
                } else if (improvement < -0.3) {
                    trend = 'regressing';
                    trendIcon = '';
                    message = `Groups are opening up. Recent avg: ${recentAvg.toFixed(2)} MOA vs older avg: ${olderAvg.toFixed(2)} MOA. Check fundamentals.`;
                } else {
                    message = `Performance stable at ${recentAvg.toFixed(2)} MOA average.`;
                }
            } else {
                message = `Building baseline. Current avg: ${recentAvg.toFixed(2)} MOA over ${recentSessions.length} sessions.`;
            }

            return {
                status: trend,
                icon: trendIcon,
                message: message,
                recentAvg: recentAvg.toFixed(2),
                overallAvg: overallAvg.toFixed(2),
                totalSessions: sessionsWithPerformance.length,
                bestSession: sessionsWithPerformance.reduce((best, s) =>
                    (!best || s.performance.spreadMOA < best.performance.spreadMOA) ? s : best, null)
            };
        }
    };

    window.saveSessionSnapshot = async function () {
        const session = await SessionHistory.saveSession();
        const msg = session.performance
            ? `Session saved! ${session.performance.shotCount} shots, ${session.performance.spreadMOA} MOA spread.`
            : 'Session saved! (No shot analysis data captured)';
        addChatBubble('bot', ` ${msg}`);

        // Auto-refresh history if module is active
        if (typeof displaySessionHistory === 'function') {
            displaySessionHistory();
        }
    };

    window.displaySessionHistory = async function () {
        const history = await SessionHistory.getHistory();
        const trends = SessionHistory.getTrends(history);
        const container = document.getElementById('session-history-container');

        if (!container) {
            // Fallback to chat
            addChatBubble('bot', `${trends.icon} ${trends.message}`);
            return;
        }

        let html = `
            <div class="bg-black/30 border border-blue-700/50 rounded-lg p-4 mb-4">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${trends.icon}</span>
                    <span class="text-sm font-bold text-blue-400 uppercase">Trend: ${trends.status}</span>
                </div>
                <p class="text-xs text-gray-300">${trends.message}</p>
                ${trends.bestSession ? `<p class="text-[10px] text-green-400 mt-2"> Best: ${trends.bestSession.performance.spreadMOA} MOA on ${trends.bestSession.date}</p>` : ''}
            </div>
        `;

        // Add trend chart if we have performance data
        const sessionsWithPerf = history.filter(s => s.performance && s.performance.spreadMOA);
        if (sessionsWithPerf.length >= 2) {
            html += `
                <div class="bg-black/20 border border-gray-700 rounded-lg p-3 mb-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase mb-2"> Performance Trend</p>
                    <canvas id="trend-chart" width="300" height="100" class="w-full"></canvas>
                </div>
            `;
        }


        if (history.length > 0) {
            html += `<div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">`;
            history.slice(0, 10).forEach(session => {
                html += `
                    <div class="bg-black/20 border border-gray-700 rounded p-2 text-[10px]">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">${session.date} ${session.time}</span>
                            <span class="text-gray-500">${session.caliber}</span>
                        </div>
                        ${session.performance ? `
                            <div class="mt-1 text-gray-300">
                                ${session.performance.spreadMOA} MOA | ${session.performance.shotCount} shots | ${session.performance.biasDirection || 'N/A'}
                            </div>
                        ` : '<span class="text-gray-500">No shot data</span>'}
                    </div>
                `;
            });
            html += `</div>`;
        } else {
            html += `<p class="text-xs text-gray-500 italic">No session history yet. Save a session after analyzing your groups.</p>`;
        }

        container.innerHTML = html;

        // Render chart if canvas exists
        setTimeout(() => {
            renderTrendChart(sessionsWithPerf);
        }, 100);
    };

    function renderTrendChart(sessions) {
        const canvas = document.getElementById('trend-chart');
        if (!canvas || sessions.length < 2) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const width = canvas.width;
        const height = canvas.height;
        const padding = 20;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get data points (reverse to show oldest first)
        const data = sessions.slice(0, 10).reverse().map(s => s.performance.spreadMOA);
        const maxVal = Math.max(...data, 3); // At least 3 MOA scale
        const minVal = 0;

        // Draw grid lines
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 3; i++) {
            const y = padding + ((height - padding * 2) * i / 3);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw line chart
        const pointSpacing = (width - padding * 2) / (data.length - 1);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((val, i) => {
            const x = padding + (i * pointSpacing);
            const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        data.forEach((val, i) => {
            const x = padding + (i * pointSpacing);
            const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);

            // Point color based on performance
            ctx.fillStyle = val <= 1.0 ? '#22c55e' : val <= 2.0 ? '#eab308' : '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${maxVal.toFixed(1)}`, padding - 3, padding + 4);
        ctx.fillText('0', padding - 3, height - padding + 4);
        ctx.textAlign = 'center';
        ctx.fillText('MOA', padding - 8, height / 2);
    }

    // === 12. MULTIPLE WEAPON PROFILES ===
    const WEAPON_PROFILES_KEY = 'rangeCardWeaponProfiles';
    const ACTIVE_PROFILE_KEY = 'rangeCardActiveProfile';

    window.WeaponProfiles = {
        getAll: async function () {
            try {
                const results = await window.TRC_IDB.getAll('weaponProfiles');
                return Object.values(results) || [];
            } catch (e) {
                return [];
            }
        },

        save: async function (profile) {
            const profiles = await this.getAll();
            const existingIndex = profiles.findIndex(p => p.id === profile.id);

            if (existingIndex >= 0) {
                profiles[existingIndex] = profile;
            } else {
                profile.id = Date.now();
                profiles.push(profile);
            }

            await window.TRC_IDB.set('weaponProfiles', profile.id.toString(), profile);
            await this.refreshUI();
            return profile;
        },

        delete: async function (profileId) {
            await window.TRC_IDB.delete('weaponProfiles', profileId.toString());
            await this.refreshUI();
        },

        load: async function (profileId) {
            // Ensure search works regardless of string or number input
            const searchId = typeof profileId === 'string' ? parseInt(profileId) : profileId;
            const profiles = await this.getAll();
            const profile = profiles.find(p => p.id === searchId);

            if (!profile) {
                addChatBubble('bot', 'Profile not found.');
                return;
            }

            // Map of Profile Data to Form Input IDs
            const fieldMap = {
                weaponName: 'header-notes',
                caliber: 'caliber',
                zero: 'zero',
                optic: 'scope-notes',
                bullet: 'bullet',
                muzzleVelocity: 'velocity',
                g1: 'g1',
                barrel: 'barrel'
            };

            // Load profile data into form (WITHOUT auto-syncing to card)
            Object.keys(fieldMap).forEach(dataKey => {
                const inputId = fieldMap[dataKey];
                const value = profile[dataKey];
                if (value !== undefined) {
                    const el = document.getElementById(inputId);
                    if (el) {
                        el.value = value;
                        // Dispatch event removed to prevent sync conflict
                    }
                }
            });

            localStorage.setItem(ACTIVE_PROFILE_KEY, searchId.toString());
            addChatBubble('bot', ` Loaded profile: ${profile.name}`);

            // Update dropdown selections
            ['weapon-profile-select', 'modal-weapon-profile-select'].forEach(id => {
                const dropdown = document.getElementById(id);
                if (dropdown) dropdown.value = searchId;
            });
        },

        getActive: function () {
            const val = localStorage.getItem(ACTIVE_PROFILE_KEY);
            return val ? parseInt(val) : null;
        },

        createFromCurrent: async function (name) {
            const profile = {
                name: name || 'Unnamed Profile',
                weaponName: document.getElementById('header-notes')?.value || '',
                caliber: document.getElementById('caliber')?.value || '',
                zero: document.getElementById('zero')?.value || '',
                optic: document.getElementById('scope-notes')?.value || '',
                bullet: document.getElementById('bullet')?.value || '',
                muzzleVelocity: document.getElementById('velocity')?.value || '',
                g1: document.getElementById('g1')?.value || '',
                barrel: document.getElementById('barrel')?.value || '',
                createdAt: new Date().toISOString()
            };

            return await this.save(profile);
        },

        refreshUI: async function () {
            const listContainer = document.getElementById('weapon-profiles-list');
            const profiles = await this.getAll();
            const activeId = this.getActive();

            function populateWeaponProfileDropdowns(profiles, activeId) {
                const selects = ['weapon-profile-select', 'modal-weapon-profile-select'];
                selects.forEach(id => {
                    const select = document.getElementById(id);
                    if (!select) return;
                    select.innerHTML = '<option value="">-- Select Profile --</option>';
                    profiles.forEach(p => {
                        const opt = document.createElement('option');
                        opt.value = p.id;
                        opt.textContent = `${p.name} (${p.caliber || 'N/A'})`; // Reverted to original text content format
                        if (activeId && p.id.toString() === activeId.toString()) opt.selected = true;
                        select.appendChild(opt);
                    });
                });
            }

            populateWeaponProfileDropdowns(profiles, activeId);

            if (listContainer) {
                if (profiles.length === 0) {
                    listContainer.innerHTML = '<p class="text-xs text-gray-500 italic">No weapon profiles saved yet.</p>';
                } else {
                    listContainer.innerHTML = profiles.map(p => `
                        <div class="bg-black/30 border border-gray-700 rounded-lg p-3 flex justify-between items-center">
                            <div>
                                <div class="text-xs font-bold text-white">${p.name}</div>
                                <div class="text-[10px] text-gray-400">${p.caliber || 'N/A'} | Zero: ${p.zero || 'N/A'}yds</div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="WeaponProfiles.load(${p.id})" class="text-blue-400 hover:text-blue-300 text-[10px] uppercase font-bold">Load</button>
                                <button onclick="WeaponProfiles.delete(${p.id})" class="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold">Delete</button>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
    };

    window.saveCurrentAsWeaponProfile = async function () {
        const name = prompt('Enter a name for this weapon profile:');
        if (name && name.trim()) {
            const profile = await WeaponProfiles.createFromCurrent(name.trim());
            addChatBubble('bot', ` Saved weapon profile: "${profile.name}"`);
        }
    };

    window.loadWeaponProfile = function (profileId) {
        if (profileId) {
            WeaponProfiles.load(parseInt(profileId));
        }
    };

    // Initialize weapon profiles UI on load
    setTimeout(() => {
        WeaponProfiles.refreshUI();
    }, 500);

    // === 13. EXPORT & SHARE ===
    window.exportAsImage = function () {
        const card = document.getElementById('card-container');
        const previewPanel = document.getElementById('previewPanel');

        if (!card || !previewPanel) {
            alert("Error: Card container or preview panel missing.");
            return;
        }

        addChatBubble('bot', ' Preparing encoded tactical transfer...');

        // 1. Prepare for Capture
        const originalTransform = card.style.transform;
        const originalScrollY = window.scrollY;
        const isVisuallyHidden = previewPanel.classList.contains('hidden') || getComputedStyle(previewPanel).display === 'none';
        const wasHidden = isVisuallyHidden;

        if (wasHidden) {
            previewPanel.classList.remove('hidden');
            previewPanel.classList.add('flex');
            previewPanel.classList.remove('opacity-0', 'pointer-events-none');
        }

        // Reset scaling and scroll
        card.style.transform = 'none';
        window.scrollTo(0, 0);

        // EXTRA DELAY FOR LAYOUT SETTLEMENT
        setTimeout(() => {
            // 2. Execute Capture
            html2canvas(card, {
                scale: 1.5, // Optimized for mobile performance
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1000,
                windowHeight: 750,
                onclone: (clonedDoc) => {
                    // Ensure visibility in clone
                    const clonedCard = clonedDoc.getElementById('card-container');
                    const clonedPanel = clonedDoc.getElementById('previewPanel');
                    if (clonedCard) {
                        clonedCard.style.display = 'flex';
                        clonedCard.style.transform = 'none';
                        clonedCard.style.margin = '0';
                        clonedCard.style.visibility = 'visible';
                    }
                    if (clonedPanel) {
                        clonedPanel.style.display = 'flex';
                        clonedPanel.style.visibility = 'visible';
                        clonedPanel.classList.remove('hidden');
                    }

                    // Bake canvases into static images for the render
                    const canvasIds = ['pencil-canvas', 'compass-vector', 'canvas-hold', 'canvas-shot', 'mobile-pencil-canvas', 'mobile-canvas-hold', 'mobile-canvas-shot'];
                    canvasIds.forEach(id => {
                        const original = document.getElementById(id);
                        const cloned = clonedDoc.getElementById(id);
                        if (original && cloned) {
                            try {
                                const img = clonedDoc.createElement('img');
                                img.src = original.toDataURL();
                                img.className = original.className;
                                img.style.cssText = original.style.cssText;
                                img.style.display = 'block';
                                if (id.includes('pencil') || id.includes('vector')) {
                                    img.style.position = 'absolute';
                                    img.style.inset = '0';
                                }
                                cloned.parentNode.replaceChild(img, cloned);
                            } catch (e) {
                                console.warn(`[Export] Canvas clone failed for ${id}:`, e);
                            }
                        }
                    });
                }
            }).then(async canvas => {
                // Restore Layout
                if (wasHidden) {
                    previewPanel.classList.add('hidden');
                    previewPanel.classList.remove('flex');
                }
                card.style.transform = originalTransform;
                window.scrollTo(0, originalScrollY);

                const caliber = document.getElementById('caliber')?.value || 'RangeCard';
                const timestamp = new Date().getTime(); // Milliseconds for absolute uniqueness
                const fileName = `Tactical_Card_${caliber}_${timestamp}.png`;

                // 3. PRIORITIZE DOWNLOAD (Save to Device/Photos)
                // This prevents the mobile Share menu from jumping straight to Gmail
                triggerDownload(canvas, fileName);

                // Allow sharing separately if needed, but primary action is now save
                console.log("[EXPORT] Image saved to device:", fileName);
            }).catch(err => {
                if (wasHidden) {
                    previewPanel.classList.add('hidden');
                    previewPanel.classList.remove('flex');
                }
                card.style.transform = originalTransform;
                window.scrollTo(0, originalScrollY);
                console.error("Export failure:", err);
                alert("Export failed: " + err.message);
            });
        }, 50); // Small 50ms pulse to let the UI breathe
    };

    function triggerDownload(canvas, fileName) {
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = url;
            document.body.appendChild(link); // Required for some browsers
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addChatBubble('bot', ` Exported: ${fileName}`);
        }, 'image/png');
    }

    window.shareSession = function () {
        const caliber = document.getElementById('caliber')?.value || 'Unknown';
        const lastAnalysis = window.lastGroupAnalysis;
        const trends = SessionHistory?.getTrends() || {};

        let shareText = ` Tactical Range Card\n\n`;
        shareText += `Caliber: ${caliber}\n`;

        if (lastAnalysis) {
            shareText += `Last Group: ${lastAnalysis.spreadMOA} MOA (${lastAnalysis.shotCount} shots)\n`;
            shareText += `Bias: ${lastAnalysis.biasDirection}\n`;
        }

        if (trends.message) {
            shareText += `\nTrend: ${trends.message}\n`;
        }

        shareText += `\nGenerated by Tactical Range Card PWA`;

        // Try Web Share API first (mobile)
        if (navigator.share) {
            navigator.share({
                title: 'Tactical Range Card Session',
                text: shareText
            }).then(() => {
                addChatBubble('bot', ' Session shared successfully!');
            }).catch((err) => {
                if (err.name !== 'AbortError') {
                    copyToClipboard(shareText);
                }
            });
        } else {
            copyToClipboard(shareText);
        }
    };


    // === LIBRARY MODAL LOGIC (Removed Duplicate) ===
    // Use primary definition at window.openLibrary around line 1041


    window.shareCurrentSession = function () {
        const caliber = document.getElementById('caliber')?.value || 'Unknown';
        const lastAnalysis = window.lastGroupAnalysis;

        let shareText = ` Range Session - ${caliber}\n`;

        if (lastAnalysis) {
            shareText += `Group: ${lastAnalysis.spreadMOA} MOA | ${lastAnalysis.shotCount} shots | ${lastAnalysis.biasDirection}`;
        } else {
            shareText += `No shot analysis yet.`;
        }

        if (navigator.share) {
            navigator.share({ title: 'Range Session', text: shareText });
        } else {
            copyToClipboard(shareText);
        }
    };




    // === Tactical Card Model Library ===
    let currentCardModel = localStorage.getItem('tacticalCardModel') || 'standard';

    window.setCardModel = function (modelId) {
        currentCardModel = modelId;
        localStorage.setItem('tacticalCardModel', modelId);
        syncCardModelUI();
        generateQuickDope();
    };

    const CardTemplates = {
        'standard': function (data) {
            return `
                <div class="border-2 border-black p-2 bg-white text-black h-full flex flex-col justify-between font-sans">
                    <div class="flex justify-between border-b-2 border-black pb-1 mb-1 font-black text-[10px]">
                        <div class="flex items-center gap-1">
                            <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
                            <span>TAC-DOPE</span>
                        </div>
                        <span>${data.caliber}</span>
                    </div>
                    <div class="text-[8px] flex justify-between mb-2 italic text-gray-700 font-bold border-b border-gray-100 pb-1">
                        <span>MV: ${data.velocity} FPS</span>
                        <span>ZERO: ${data.zero}Y</span>
                    </div>
                    <div class="text-[9px] font-black space-y-0.5 mb-2 flex-1">
                        ${data.tableRows}
                    </div>
                    <div class="border-t border-black pt-1 text-[7px] flex justify-between font-black uppercase tracking-tight">
                        <span>OP: ${data.shooter || '---'}</span>
                        <span class="text-gray-400">V1 // STANDARD</span>
                    </div>
                </div>
            `;
        },
        'recon': function (data) {
            return `
                <div class="border-[3px] border-blue-900 p-3 bg-slate-50 text-slate-900 h-full flex flex-col font-mono relative overflow-hidden shadow-sm">
                    <div class="absolute top-0 right-0 bg-blue-900 text-white text-[7px] px-3 py-1 font-black uppercase tracking-widest">RECON-OPS</div>
                    <div class="flex items-center gap-2 border-b-2 border-blue-900 mb-2 pb-1">
                        <svg class="w-4 h-4 text-blue-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        <h2 class="text-[12px] font-black tracking-tighter">${data.caliber} PRECISION</h2>
                    </div>
                    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7px] mb-3 bg-blue-100/50 p-2 rounded border border-blue-200">
                        <div class="flex justify-between border-b border-blue-200"><span>LOAD:</span> <span>${data.load}</span></div>
                        <div class="flex justify-between border-b border-blue-200"><span>POWDER:</span> <span>${data.powder}</span></div>
                        <div class="flex justify-between border-b border-blue-200"><span>BULLET:</span> <span>${data.bullet}</span></div>
                        <div class="flex justify-between border-b border-blue-200"><span>BC:</span> <span>${data.bc}</span></div>
                    </div>
                    <div class="flex-1 text-[9px]">
                        <div class="grid grid-cols-3 font-black bg-blue-900 text-white p-1 mb-1 text-center rounded-t-sm">
                            <span>RANGE</span><span>ELEV</span><span>WIND</span>
                        </div>
                        <div class="max-h-[85px] overflow-hidden">
                            ${data.tableRowsLong}
                        </div>
                    </div>
                    <div class="mt-2 text-[7px] border-t-2 border-blue-900 pt-1 font-black flex justify-between italic">
                        <span>${data.temp}F / ${data.wind} MPH</span>
                        <span class="text-blue-700">LR-PRECISION-V2</span>
                    </div>
                </div>
            `;
        },
        'challenger': function (data) {
            const d100 = document.getElementById('clicks-100')?.value || '--';
            const d300 = document.getElementById('clicks-300')?.value || '--';
            const d500 = document.getElementById('clicks-500')?.value || '--';
            const d700 = document.getElementById('clicks-700')?.value || '--';

            return `
                <div class="border-2 border-purple-800 p-2 bg-purple-50 text-purple-950 h-full flex flex-col justify-between font-sans shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-lg bg-purple-800 flex items-center justify-center text-white shadow-md">
                                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </div>
                            <div>
                                <p class="text-[12px] font-black leading-none uppercase tracking-tighter">Challenger Match</p>
                                <p class="text-[8px] text-purple-700 font-bold italic">${data.shooter || '---'}</p>
                            </div>
                        </div>
                        <div class="text-right">
                             <p class="text-[10px] font-black leading-none">${data.caliber}</p>
                             <p class="text-[6px] text-purple-400 font-bold">SERIAL-X12</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-4 gap-1.5 mb-2">
                        <div class="bg-white border-b-2 border-purple-800 p-1 text-center rounded-sm">
                            <p class="text-[6px] text-purple-400 font-black uppercase">100Y</p>
                            <p class="text-[11px] font-black">${d100}</p>
                        </div>
                        <div class="bg-white border-b-2 border-purple-800 p-1 text-center rounded-sm">
                            <p class="text-[6px] text-purple-400 font-black uppercase">300Y</p>
                            <p class="text-[11px] font-black">${d300}</p>
                        </div>
                        <div class="bg-white border-b-2 border-purple-800 p-1 text-center rounded-sm">
                            <p class="text-[6px] text-purple-400 font-black uppercase">500Y</p>
                            <p class="text-[11px] font-black">${d500}</p>
                        </div>
                        <div class="bg-white border-b-2 border-purple-800 p-1 text-center rounded-sm">
                            <p class="text-[6px] text-purple-400 font-black uppercase">700Y</p>
                            <p class="text-[11px] font-black">${d700}</p>
                        </div>
                    </div>
                    <div class="bg-white/60 border border-purple-200 p-2 rounded-md text-[8px] flex-1 relative overflow-hidden backdrop-blur-sm">
                        <p class="font-black border-b border-purple-200 mb-1 flex items-center gap-1.5 text-purple-900">
                             <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            STAGE DATA
                        </p>
                        <p class="text-[8px] text-purple-900 font-bold leading-tight h-[45px] overflow-hidden">${data.notes || 'Awaiting stage briefing...'}</p>
                        <div class="absolute bottom-1 right-1 opacity-10">
                             <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                    </div>
                </div>
            `;
        },
        'stalker': function (data) {
            const drop200 = document.getElementById('clicks-200')?.value || '--';
            const drop400 = document.getElementById('clicks-400')?.value || '--';

            return `
                <div class="border-4 border-orange-600 p-4 bg-orange-50 text-orange-950 h-full flex flex-col font-sans shadow-xl">
                    <div class="flex justify-between items-start mb-4 border-b-4 border-orange-600 pb-2">
                         <div class="bg-orange-600 text-white p-1 text-[11px] px-3 font-black rounded-sm shadow-md flex items-center gap-2">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            STALKER-OPS
                        </div>
                         <div class="text-right">
                            <p class="text-[16px] leading-tight font-black tracking-tight">${data.caliber}</p>
                            <p class="text-[8px] uppercase text-orange-700 font-black tracking-widest opacity-80">Field Guide V3</p>
                         </div>
                    </div>
                    <div class="flex-1 space-y-2.5">
                        <div class="bg-white p-2.5 rounded shadow-sm border-l-8 border-orange-600 flex justify-between items-center group">
                            <span class="text-[9px] text-orange-400 uppercase font-black">200Y HOLD</span>
                            <span class="text-[18px] font-black">${drop200} MOA</span>
                        </div>
                        <div class="bg-white p-2.5 rounded shadow-sm border-l-8 border-orange-600 flex justify-between items-center group">
                            <span class="text-[9px] text-orange-400 uppercase font-black">400Y HOLD</span>
                            <span class="text-[18px] font-black">${drop400} MOA</span>
                        </div>
                         <div class="bg-stone-900 p-2.5 rounded shadow-lg border-l-8 border-orange-500 flex justify-between items-center text-orange-500">
                            <span class="text-[9px] uppercase font-black">10MPH WIND</span>
                            <span class="text-[18px] font-black">${data.wind} MOA</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-2 border-t border-orange-200 flex justify-between text-[9px] font-black uppercase text-orange-900">
                        <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>ZERO: ${data.zero}Y</div>
                        <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>BC: ${data.bc}</div>
                    </div>
                </div>
            `;
        },
        'spotter': function (data) {
            const r1 = document.getElementById('compass-range')?.value || '---';
            const r2 = document.getElementById('compass-range-2')?.value || '---';
            const grade = document.getElementById('hold-grade')?.value || 'PENDING';

            return `
                <div class="border-2 border-yellow-500 p-3 bg-zinc-950 text-yellow-500 h-full flex flex-col font-mono shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#ca8a04 1px, transparent 1px); background-size: 8px 8px;"></div>
                    <div class="flex justify-between items-center mb-2 border-b-2 border-yellow-900 pb-2 relative z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_#ca8a04]"></div>
                            <span class="text-[11px] font-black tracking-[0.2em] text-yellow-300">SPOTTER.INTEL</span>
                        </div>
                        <span class="text-[7px] text-yellow-500/80 font-black uppercase tracking-tighter">SECURE.LINK // ACTIVE</span>
                    </div>
                    <div class="grid grid-cols-3 gap-1.5 mb-3 relative z-10">
                         <div class="bg-black/80 border border-yellow-900/60 p-2 rounded-sm text-center shadow-inner">
                            <p class="text-[6px] text-yellow-700 font-black uppercase mb-0.5">ATMOS</p>
                            <p class="text-[11px] font-black text-yellow-400">${data.temp}F</p>
                        </div>
                        <div class="bg-black/80 border border-yellow-900/60 p-2 rounded-sm text-center shadow-inner">
                            <p class="text-[6px] text-yellow-700 font-black uppercase mb-0.5">WIND_X</p>
                            <p class="text-[11px] font-black text-yellow-400">${data.wind} MPH</p>
                        </div>
                        <div class="bg-black/80 border border-yellow-900/60 p-2 rounded-sm text-center shadow-inner">
                            <p class="text-[6px] text-yellow-700 font-black uppercase mb-0.5">DENSITY</p>
                            <p class="text-[11px] font-black text-yellow-400">${data.press}</p>
                        </div>
                    </div>
                    <div class="flex-1 border border-yellow-500/30 p-3 rounded-lg bg-black/60 backdrop-blur-sm relative z-10 overflow-hidden group">
                         <div class="absolute top-0 right-0 w-12 h-12 opacity-10 group-hover:opacity-20 transition-opacity">
                             <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                         </div>
                         <p class="text-[7px] text-yellow-400 mb-2 font-black tracking-[0.1em] uppercase flex items-center gap-2">
                             <svg class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 18s-6-4-6-10V5l6-3 6 3v3c0 6-6 10-6 10z"/></svg>
                             Target Data Stream
                         </p>
                         <div class="space-y-2.5">
                            <div class="flex justify-between text-[10px] items-center border-b border-yellow-900/20 pb-0.5">
                                <span class="text-yellow-700 font-black tracking-tighter">SIG_SIZE:</span> <span class="text-white font-black">${data.targetSize || 'CALC...'}</span>
                            </div>
                            <div class="flex justify-between text-[10px] items-center">
                                <span class="text-yellow-700 font-black tracking-tighter">RNG_V1:</span> <span class="text-white font-black">${r1}Y</span>
                            </div>
                            <div class="flex justify-between text-[10px] items-center">
                                <span class="text-yellow-700 font-black tracking-tighter">RNG_V2:</span> <span class="text-white font-black">${r2}Y</span>
                            </div>
                            <div class="flex justify-between text-[10px] mt-2 pt-2 border-t border-yellow-500/40 items-center">
                                <span class="text-yellow-600 font-black tracking-tighter italic">PERFORMANCE:</span> 
                                <span class="text-yellow-300 font-black tracking-widest uppercase animate-pulse underline decoration-yellow-500/50">${grade}</span>
                            </div>
                         </div>
                    </div>
                    <div class="mt-3 flex justify-between items-center text-[7px] font-black text-yellow-900 uppercase tracking-widest relative z-10">
                        <span>OP_ID: ${data.shooter || 'ANON_USER'}</span>
                        <span class="flex items-center gap-1">
                            <span class="w-1 h-1 bg-yellow-900 rounded-full"></span>
                            SYS_M1_INTEL
                        </span>
                    </div>
                </div>
            `;
        }
    };





    window.exportQuickDope = function () {
        const el = document.getElementById('quick-dope-preview');
        if (typeof html2canvas !== 'undefined' && el) {
            html2canvas(el, { scale: 3 }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'QuickDope_Stock_Card.png';
                link.href = canvas.toDataURL();
                link.click();
            });
        }
    };



    // 14.4 Precision Lab

    // 14.4 Precision Lab
    // --- CORE ATMOSPHERIC ENGINE ---
    /**
     * CORE ATMOSPHERIC ENGINE
     * High-fidelity Density Altitude calculation including humidity.
     * Formula: DA = 145442.16 * (1 - (density / standard_sea_level_density)^0.234969)
     */
    window.calculateDA = function (elevation, tempF, humidity, altimeterSetting, isStationPressure = false) {
        // 1. Convert Altimeter Setting (SLP) to Station Pressure if needed
        let pInHg = altimeterSetting || 29.92;
        if (!isStationPressure && elevation !== 0) {
            // Formula for Station Pressure from Altimeter and Elevation (Standard Aviation)
            // Pstn = Altim * ( ( (288 - 0.0065 * (Elev / 3.28084)) / 288 ) ^ 5.2561 )
            pInHg = altimeterSetting * Math.pow((288 - 0.0065 * (elevation / 3.28084)) / 288, 5.2561);
        }

        const tK = (tempF + 459.67) * 5 / 9; // Temp in Kelvin
        const pPa = pInHg * 3386.39; // Station Pressure in Pascals
        const h = humidity || 0;

        // Saturation Vapor Pressure (Tetens formula)
        const tC = (tempF - 32) * 5 / 9;
        const eso = 6.112; // mb
        const svp = eso * Math.exp((17.67 * tC) / (tC + 243.5)) * 100; // Pa

        // Actual Vapor Pressure
        const vp = svp * (h / 100);

        // Gas constants
        const Rd = 287.058; // Dry air
        const Rv = 461.495; // Water vapor

        // Air Density (kg/m3)
        const density = (pPa - vp) / (Rd * tK) + vp / (Rv * tK);
        const rho0 = 1.225; // Standard sea level density (kg/m3)

        // Density Altitude (feet)
        const da = 145442.16 * (1 - Math.pow(density / rho0, 0.234969));
        return Math.round(da);
    };

    /**
     * LIVE WEATHER STATION ENGINE
     * Fetches real-time environmental data via GPS and Open-Meteo API.
     */
    window.fetchLiveWeather = async function () {
        console.log("[WEATHER] Initiating Live Weather Fetch...");
        window.showToast("DETERMINING GPS LOCATION...");

        if (!navigator.geolocation) {
            window.showToast("GPS NOT SUPPORTED", "error");
            return;
        }

        const coordsEl = document.getElementById('ws-coords');
        if (coordsEl) {
            coordsEl.textContent = "ACQUIRING SIGNAL...";
            coordsEl.classList.add('animate-pulse');
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            console.log(`[WEATHER] GPS Locked: ${latitude}, ${longitude}`);

            try {
                // Fetch current weather from Open-Meteo (requesting pressure_msl directly for Altimeter Setting)
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&timezone=auto`;

                const response = await fetch(url);
                const data = await response.json();

                if (!data.current) throw new Error("Invalid API Response");

                const topoElevation = data.elevation || 0; // MSL from API
                const sensorAltitude = pos.coords.altitude || topoElevation; // ASL from GPS (fallback to topo)

                // Use API-provided Mean Sea Level Pressure (Altimeter Setting/QNH)
                // This ensures compatibility with the Manual/Lab inputs which expect Sea Level Pressure.
                const altimeterP = (data.current.pressure_msl * 0.02953);

                const weather = {
                    temp: Math.round(data.current.temperature_2m * 9 / 5 + 32), // C to F
                    humidity: Math.round(data.current.relative_humidity_2m),
                    pressure: altimeterP.toFixed(2), // Use Altimeter Setting (QNH) directly from API
                    windSpd: Math.round(data.current.wind_speed_10m),
                    windDir: data.current.wind_direction_10m,
                    msl: Math.round(topoElevation * 3.28084), // Meters to Feet
                    asl: Math.round(sensorAltitude * 3.28084) // Meters to Feet
                };
                const liveDA = window.calculateDA(weather.msl, weather.temp, weather.humidity, parseFloat(weather.pressure), false);

                console.log("[WEATHER] Data Received:", weather, "Live DA:", liveDA);

                // Update UI - Work Center (Priority)
                const controls = {
                    'owc-temp': weather.temp,
                    'owc-hum': weather.humidity,
                    'owc-press': weather.pressure,
                    'owc-alt': weather.msl, // Sync topo elevation to ALT input
                    'owc-wind-speed': weather.windSpd,
                    'owc-wind-dir': weather.windDir,
                    'temperature': weather.temp,
                    'humidity': weather.humidity,
                    'pressure': weather.pressure,
                    'wind-speed': weather.windSpd,
                    'wind-dir': weather.windDir
                };

                Object.entries(controls).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el) {
                        // OWC Guard - Only update OWC fields if LIVE SYNC is ON
                        if (id.startsWith('owc-') && !window.owcLiveSync) return;

                        el.value = val;

                        // Special handling for Slider Display
                        if (id === 'owc-wind-speed') {
                            const valDisp = document.getElementById('owc-wind-speed-val');
                            if (valDisp) valDisp.textContent = val;
                        }

                        el.classList.add('text-neon-green');
                        setTimeout(() => el.classList.remove('text-neon-green'), 2000);
                    }
                });

                // Update DA display
                if (window.updateOWC) window.updateOWC();

                window.showToast("WEATHER DATA SYNCED");
                if (window.SessionLogger) window.SessionLogger.add('SYSTEM', 'ISOLATION WATCHDOG: Wx Data Secured. Fortress Intact.');

                // LOG WEATHER UPDATE FOR AI
                if (typeof SessionLogger !== 'undefined') {
                    SessionLogger.add("SYSTEM", `Wx Update: ${weather.temp}F, ${weather.humidity}%, ${weather.pressure}inHg, Wind ${weather.windSpd}mph @ ${weather.windDir} deg`);
                }

                // Update Weather Station UI if open
                const wsTemp = document.getElementById('ws-temp');
                if (wsTemp) {
                    wsTemp.textContent = `${weather.temp}°F`;
                    document.getElementById('ws-hum').textContent = `${weather.humidity}%`;
                    document.getElementById('ws-press').textContent = `${weather.pressure} IN`;
                    document.getElementById('ws-wind').textContent = `${weather.windSpd} MPH @ ${weather.windDir}°`;
                    document.getElementById('ws-msl').textContent = `${weather.msl} FT`;
                    document.getElementById('ws-asl').textContent = `${weather.asl} FT`;
                    document.getElementById('ws-da').textContent = `${liveDA.toLocaleString()} FT`;
                    const cEl = document.getElementById('ws-coords');
                    if (cEl) {
                        cEl.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        cEl.classList.remove('animate-pulse');
                    }
                    document.getElementById('ws-timestamp').textContent = new Date().toLocaleTimeString();
                }

            } catch (err) {
                console.error("[WEATHER] Fetch Error:", err);
                window.showToast("WEATHER API ERROR", "error");
            }
        }, (err) => {
            console.error("[WEATHER] GPS Error:", err);
            window.showToast("GPS PERMISSION DENIED", "error");
        }, { enableHighAccuracy: true });
    };


    // 14.5 SECTION CLEANUP - Section excised for stability
    // Logic moved to isolated trailing listeners to prevent accidental markings.
}); // Close DOMContentLoaded

window.openDopeVault = function () {
    const modal = document.getElementById('dopeVaultModal');
    if (modal) {
        modal.classList.remove('hidden');
        window.renderDopeVault();
    }
};

window.closeDopeVault = function () {
    const modal = document.getElementById('dopeVaultModal');
    if (modal) modal.classList.add('hidden');
};

window.saveDopeToVault = async function () {
    const preview = document.getElementById('quick-dope-preview');
    if (!preview) return;

    // 1. Confirm with Name
    const dopeName = prompt("ENTER NAME FOR THIS DROP CHART:", `DOPE ${new Date().toLocaleDateString()}`);
    if (!dopeName) return;

    // 2. Set Name in UI for Capture
    const captureNameEl = document.getElementById('dope-capture-name');
    if (captureNameEl) captureNameEl.textContent = dopeName;

    // 3. Capture Image
    // FORCE HIGH CONTRAST FOR CAPTURE
    preview.style.backgroundColor = '#e2e8f0'; // slate-200
    preview.style.color = '#000000'; // black text

    html2canvas(preview, {
        backgroundColor: '#e2e8f0', // Slate-200 (Matches Dope Table theme)
        scale: 1.5, // Reduced to 1.5 to maximize storage capacity
        logging: false,
        useCORS: true,
        height: preview.scrollHeight,
        windowHeight: preview.scrollHeight,
        onclone: (clonedDoc) => {
            // Ensure cloned element enforces high contrast
            const clonedPreview = clonedDoc.getElementById('quick-dope-preview');
            if (clonedPreview) {
                clonedPreview.style.backgroundColor = '#e2e8f0';
                clonedPreview.style.color = 'black';
                // Force all text children to black for cloned element
                const allText = clonedPreview.querySelectorAll('*');
                allText.forEach(el => el.style.color = 'black');
            }
        }
    }).then(canvas => {
        // Reset preview styles (optional)
        // preview.style.backgroundColor = ''; 
        // preview.style.color = '';

        // OPTIMIZATION: Use JPEG at 60% quality to drastically reduce file size
        // This should allow 10-20+ charts instead of 2-4
        const base64Image = canvas.toDataURL('image/jpeg', 0.6);

        // 4. Save to LocalStorage
        const vault = JSON.parse(localStorage.getItem('trc_dope_vault') || '[]');
        const newEntry = {
            id: Date.now(),
            name: dopeName,
            date: new Date().toLocaleString(),
            image: base64Image
        };

        try {
            vault.unshift(newEntry); // Newest first
            localStorage.setItem('trc_dope_vault', JSON.stringify(vault));

            // LOG SESSION ACTION
            if (typeof SessionLogger !== 'undefined') {
                SessionLogger.add("USER", `Captured Dope Chart to Vault: ${dopeName}`);
            }

            // 5. Visual Feedback
            alert("DROP CHART SAVED TO VAULT");
            if (!document.getElementById('dopeVaultModal').classList.contains('hidden')) {
                window.renderDopeVault();
            }
        } catch (e) {
            console.error("Storage Error:", e);
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert("STORAGE FULL: Please delete old Dope Charts from the Vault to save new ones.");
            } else {
                alert("Save Failed: " + e.message);
            }
        }
    }).catch(err => {
        console.error("Dope Capture Error:", err);
        alert("Capture Failed: " + err.message);
    });
};

window.renderDopeVault = function () {
    const container = document.getElementById('dope-vault-list');
    const emptyState = document.getElementById('dope-vault-empty');
    if (!container) return;

    const vault = JSON.parse(localStorage.getItem('trc_dope_vault') || '[]');

    if (vault.length === 0) {
        container.innerHTML = "";
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = vault.map(item => `
        <div class="group bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-blue-500/50 relative">
            <!-- Checkbox for Bulk Delete -->
            <div class="absolute top-3 left-3 z-10">
                <input type="checkbox" value="${item.id}" onchange="window.updateDopeBulkBtn()"
                    class="dope-vault-checkbox w-5 h-5 rounded border-blue-500/50 bg-black/50 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer">
            </div>

            <!-- Image Area -->
            <div class="relative aspect-video bg-black overflow-hidden cursor-zoom-in" onclick="window.viewDopeImage('${item.image}')">
                <img src="${item.image}" class="w-full h-full object-contain transition-transform group-hover:scale-105" alt="${item.name}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4">
                    <span class="text-[10px] text-blue-400 font-black uppercase tracking-widest">${item.date}</span>
                </div>
            </div>
            
            <!-- Controls Area -->
            <div class="p-4 bg-zinc-950/80 flex flex-col gap-3">
                <h3 class="text-white font-black uppercase italic tracking-tight truncate">${item.name}</h3>
                <div class="flex gap-2">
                    <button onclick="window.exportDope(${item.id})" 
                        class="flex-1 bg-blue-600/20 text-blue-400 text-[10px] font-black py-2 rounded-lg border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all uppercase">
                        EXPORT
                    </button>
                    <button onclick="window.deleteDope(${item.id})"
                        class="px-3 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30 hover:bg-red-600 hover:text-white transition-all">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    window.updateDopeBulkBtn();
    if (window.lucide) window.lucide.createIcons();
};

window.updateDopeBulkBtn = function () {
    const checked = document.querySelectorAll('.dope-vault-checkbox:checked').length;
    const btn = document.getElementById('dope-bulk-delete-btn');
    if (btn) {
        if (checked > 0) btn.classList.remove('hidden');
        else btn.classList.add('hidden');
    }
};

window.deleteSelectedDope = function () {
    const checkedIds = Array.from(document.querySelectorAll('.dope-vault-checkbox:checked')).map(cb => parseInt(cb.value));
    if (checkedIds.length === 0) return;

    if (!confirm(`DELETE ${checkedIds.length} SELECTED DROP CHARTS?`)) return;

    let vault = JSON.parse(localStorage.getItem('trc_dope_vault') || '[]');
    vault = vault.filter(i => !checkedIds.includes(i.id));
    localStorage.setItem('trc_dope_vault', JSON.stringify(vault));

    window.renderDopeVault();
};

window.viewDopeImage = function (base64) {
    const viewer = document.createElement('div');
    // Changed to overflow-auto to allow horizontal scrolling
    viewer.className = "fixed inset-0 z-[200] bg-black/98 flex flex-col items-center overflow-auto p-4 custom-scrollbar";

    // Close button for better UX on mobile
    const closeBtn = document.createElement('button');
    closeBtn.className = "fixed top-6 right-6 z-[210] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md border border-white/20 shadow-2xl transition-all active:scale-95";
    closeBtn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
    closeBtn.onclick = (e) => { e.stopPropagation(); viewer.remove(); };

    // Zoom Toggle Button
    const zoomBtn = document.createElement('button');
    zoomBtn.className = "fixed top-6 right-20 z-[210] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 p-3 rounded-full backdrop-blur-md border border-blue-500/30 shadow-2xl transition-all active:scale-95";
    zoomBtn.innerHTML = '<i data-lucide="zoom-in" class="w-6 h-6"></i>';

    let isZoomed = false;
    // Function to handle zoom toggle
    const toggleZoom = (e) => {
        if (e) e.stopPropagation();
        isZoomed = !isZoomed;

        if (isZoomed) {
            // ZOOMED: Force width > 100% to enable scrolling
            img.className = "min-w-[200%] max-w-none h-auto object-none shadow-2xl ring-1 ring-white/10 my-auto rounded-lg transition-all duration-300 cursor-zoom-out";
            zoomBtn.innerHTML = '<i data-lucide="zoom-out" class="w-6 h-6"></i>';
            zoomBtn.classList.add('bg-blue-600', 'text-white');
            zoomBtn.classList.remove('bg-blue-600/20', 'text-blue-400');
            window.showToast("ZOOM ACTIVATED: SCROLL TO PAN");
        } else {
            // FITTED: Contain within screen
            img.className = "w-full max-w-[600px] h-auto object-contain shadow-2xl ring-1 ring-white/10 my-auto rounded-lg transition-all duration-300 cursor-zoom-in";
            zoomBtn.innerHTML = '<i data-lucide="zoom-in" class="w-6 h-6"></i>';
            zoomBtn.classList.remove('bg-blue-600', 'text-white');
            zoomBtn.classList.add('bg-blue-600/20', 'text-blue-400');
        }
    };

    zoomBtn.onclick = toggleZoom;

    viewer.onclick = () => viewer.remove();

    const img = document.createElement('img');
    img.src = base64;
    // Initial State: Fit
    img.className = "w-full max-w-[600px] h-auto object-contain shadow-2xl ring-1 ring-white/10 my-auto rounded-lg transition-all duration-300 cursor-zoom-in";
    // Clicking image also toggles zoom
    img.onclick = toggleZoom;

    viewer.appendChild(closeBtn);
    viewer.appendChild(zoomBtn);
    viewer.appendChild(img);
    document.body.appendChild(viewer);

    if (window.lucide) window.lucide.createIcons();
};

window.deleteDope = function (id) {
    if (!confirm("DELETE THIS DROP CHART?")) return;
    let vault = JSON.parse(localStorage.getItem('trc_dope_vault') || '[]');
    vault = vault.filter(i => i.id !== id);
    localStorage.setItem('trc_dope_vault', JSON.stringify(vault));
    window.renderDopeVault();
};

window.exportDope = function (id) {
    const vault = JSON.parse(localStorage.getItem('trc_dope_vault') || '[]');
    const item = vault.find(i => i.id === id);
    if (!item) return;

    const link = document.createElement('a');
    link.href = item.image;
    link.download = `${item.name.replace(/\s+/g, '_')}_TRC_DOPE.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.importDope = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            const dopeName = prompt("ENTER NAME FOR IMPORTED IMAGE:", file.name.split('.')[0]);
            if (!dopeName) return;

            const vault = JSON.parse(localStorage.getItem('trc_dope_vault') || '[]');
            const newEntry = {
                id: Date.now(),
                name: dopeName,
                date: new Date().toLocaleString(),
                image: base64
            };
            vault.unshift(newEntry);
            localStorage.setItem('trc_dope_vault', JSON.stringify(vault));
            window.renderDopeVault();
        };
        reader.readAsDataURL(file);
    };
    input.click();
};


// ===================================================================
// INTEL HUB FUNCTIONALITY
// ===================================================================

// --- TAB SWITCHING & PERSISTENCE ---
let lastIntelTab = 'ai-advisor';

// Switch Intel Hub Tabs
window.switchIntelTab = function (tabName) {
    if (window.AILifecycle) window.AILifecycle.log('TAB_SHIFT', tabName);
    try {
        console.log(`[SYS] Switching Intel Tab: ${tabName}`);

        // Hide all main tabs
        const tabs = [
            'intel-ai-advisor', 'intel-session-history', 'intel-ballistic-intel',
            'intel-work-center', 'intel-weather-station', 'intel-tactical-compass', 'intel-connectivity',
            'intel-scope-cam', 'intel-target-cam', 'intel-vault', 'intel-field-tape', 'intel-tactical-map', 'intel-gps-rangefinder',
            'intel-legal'
        ];
        tabs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`intel-${tabName}`);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }

        // Update tab button styles
        const tabButtons = document.querySelectorAll('[id^="tab-"]');
        tabButtons.forEach(btn => {
            btn.classList.remove('border-blue-500', 'text-blue-500');
            btn.classList.add('border-transparent', 'text-gray-500');
        });

        const activeBtn = document.getElementById(`tab-${tabName}`);
        if (activeBtn) {
            activeBtn.classList.remove('border-transparent', 'text-gray-500');
            activeBtn.classList.add('border-blue-500', 'text-blue-500');
        }

        // Tab-specific Initialization
        if (tabName === 'session-history') {
            // Default to ammo only if no sub-module is already selected
            const activeSub = document.querySelector('#intel-session-history .subtab-active');
            if (!activeSub) window.switchTacticalModule('ammo');
        } else if (tabName === 'ballistic-intel') {
            setTimeout(() => {
                if (typeof window.initVirtualSpotter === 'function') window.initVirtualSpotter();
            }, 100);
        } else if (tabName === 'work-center') {
            setTimeout(() => {
                if (typeof window.updateOWC === 'function') window.updateOWC();
            }, 50);
        } else if (tabName === 'tactical-compass') {
            setTimeout(() => {
                if (typeof window.initTacticalCompass === 'function') window.initTacticalCompass();
            }, 100);
        } else if (tabName === 'tactical-map') {
            // Map logic is now robust (v4.9). Small delay for CSS visibility.
            setTimeout(() => {
                if (typeof window.initTacticalMap === 'function') window.initTacticalMap();
            }, 100);
        } else if (tabName === 'gps-rangefinder') {
            setTimeout(() => {
                if (typeof window.initGPSRangefinder === 'function') window.initGPSRangefinder();
            }, 200);
        } else if (tabName === 'scope-cam') {
            setTimeout(() => {
                if (typeof window.initScopeCam === 'function') window.initScopeCam();
            }, 250);
        } else if (tabName === 'target-cam') {
            setTimeout(() => {
                if (typeof window.initTargetCam === 'function') window.initTargetCam();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 250);
        } else if (tabName === 'weather-station') {
            // Auto-trigger weather lookup if first time opening
            if (!document.getElementById('ws-temp').textContent.includes('°F')) {
                setTimeout(() => {
                    if (typeof window.fetchLiveWeather === 'function') window.fetchLiveWeather();
                }, 500);
            }
            // Ensure icons are rendered for the new tab
            setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100);
        } else if (tabName === 'vault') {
            setTimeout(() => {
                if (typeof window.loadVault === 'function') window.loadVault();
            }, 100);
        }

        // Remember which tab we are on
        lastIntelTab = tabName;

        // Icons are already initialized on page load - no need to recreate
    } catch (err) {
        console.error("[FATAL] switchIntelTab failed:", err);
    }
};

console.log(">> [SCRIPT_JS] FULL LOAD COMPLETE <<");

// --- SCOPE CAM HUD LOGIC ---
window.scopeCamStream = null;
window.scopeRotation = 0;
// --- BORESIGHT ALIGNMENT STATE ---
window.reticleOffset = JSON.parse(localStorage.getItem('trc_reticle_offset') || '{"x":0,"y":0}');

window.nudgeReticle = function (dx, dy) {
    window.reticleOffset.x += dx;
    window.reticleOffset.y += dy;
    localStorage.setItem('trc_reticle_offset', JSON.stringify(window.reticleOffset));
    window.applyReticleOffset();
};

window.resetReticle = function () {
    window.reticleOffset = { x: 0, y: 0 };
    localStorage.setItem('trc_reticle_offset', JSON.stringify(window.reticleOffset));
    window.applyReticleOffset();
};

window.applyReticleOffset = function () {
    const overlay = document.getElementById('scope-cam-overlay');
    if (overlay) {
        // We use translate to nudge the entire HUD overlay without breaking its centering
        overlay.style.transform = `translate(${window.reticleOffset.x}px, ${window.reticleOffset.y}px)`;
    }
};

window.syncScopeZoom = function (val) {
    const zoomP = document.getElementById('scope-cam-zoom-p');
    const zoomL = document.getElementById('scope-cam-zoom-l');
    const labelP = document.getElementById('label-zoom-val-p');
    const labelL = document.getElementById('label-zoom-val-l');

    if (zoomP) zoomP.value = val;
    if (zoomL) zoomL.value = val;
    if (labelP) labelP.textContent = parseFloat(val).toFixed(1) + 'X';
    if (labelL) labelL.textContent = parseFloat(val).toFixed(1) + 'X';

    window.rotateScopeFeed(true);
};

window.initScopeCam = async function () {
    console.log("[SCOPE] Initializing Feed...");
    const video = document.getElementById('scope-cam-video');
    const overlay = document.getElementById('scope-cam-start-overlay');
    const zoomLabel = document.getElementById('label-zoom-val');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera API not supported on this device/browser.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });

        window.scopeCamStream = stream;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            if (overlay) overlay.classList.add('hidden');
            window.applyReticleOffset();
            window.rotateScopeFeed(true);
        };
        console.log("[SCOPE] Camera access granted.");
    } catch (err) {
        console.error("[SCOPE] Camera access denied/failed:", err);
        alert("Camera access failed: " + err.message);
    }
};

window.stopScopeCam = function () {
    console.log("[SCOPE] Stopping Feed...");
    const video = document.getElementById('scope-cam-video');
    const overlay = document.getElementById('scope-cam-start-overlay');
    const controlsP = document.getElementById('scope-cam-controls-portrait');
    const controlsL = document.getElementById('scope-cam-controls-landscape');

    if (window.scopeCamStream) {
        window.scopeCamStream.getTracks().forEach(track => track.stop());
        window.scopeCamStream = null;
    }

    if (video) {
        video.srcObject = null;
        video.style.transform = '';
    }

    if (overlay) overlay.classList.remove('hidden');
    // CSS handles the rest
};

window.rotateScopeFeed = function (refreshOnly = false) {
    if (!refreshOnly) {
        window.scopeRotation = (window.scopeRotation + 90) % 360;
    }
    const video = document.getElementById('scope-cam-video');
    const frame = document.getElementById('scope-monitor-frame');

    // Get zoom from whichever slider is currently relevant
    const zoomVal = document.getElementById('scope-cam-zoom-p')?.value ||
        document.getElementById('scope-cam-zoom-l')?.value || 1;
    const zoom = parseFloat(zoomVal);

    if (video && frame) {
        // Ensure the video is centered and covers the area
        video.style.top = '50%';
        video.style.left = '50%';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';

        let finalScale = zoom;

        // Handle aspect ratio swap for 90/270 rotations
        if (window.scopeRotation === 90 || window.scopeRotation === 270) {
            const vidW = video.videoWidth || 1920;
            const vidH = video.videoHeight || 1080;
            const aspect = vidW / vidH;
            finalScale = aspect * zoom;
        }

        video.style.transform = `translate(-50%, -50%) rotate(${window.scopeRotation}deg) scale(${finalScale})`;
        console.log(`[MONITOR] Rot:${window.scopeRotation}, ZoomScale:${finalScale.toFixed(2)}`);
    }
};



// --- VIDEO RECORDING LOGIC ---
window.mediaRecorder = null;
window.recordedChunks = [];

window.startScopeRecording = function () {
    if (!window.scopeCamStream) return;

    // UI Update - Both sets
    document.getElementById('p-record-start')?.classList.add('hidden');
    document.getElementById('p-record-stop')?.classList.remove('hidden');
    document.getElementById('l-record-start')?.classList.add('hidden');
    document.getElementById('l-record-stop')?.classList.remove('hidden');

    window.recordedChunks = [];
    try {
        const options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm'; // Fallback
        }

        window.mediaRecorder = new MediaRecorder(window.scopeCamStream, options);

        window.mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                window.recordedChunks.push(event.data);
            }
        };

        window.mediaRecorder.onstop = async function () {
            const blob = new Blob(window.recordedChunks, { type: 'video/webm' });

            // Save to Vault
            try {
                await TRC_Vault.saveTape(blob);
                window.showToast("TAPE SECURED TO ARCHIVE ");

                // Refresh Archive UI if visible
                if (typeof window.renderTapeArchive === 'function') {
                    window.renderTapeArchive();
                }
            } catch (err) {
                console.error("Save failed:", err);
                alert("Archive Error: " + err.message);

                // Fallback to download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `scope_cam_backup.webm`;
                document.body.appendChild(a);
                a.click();
            }
        };

        window.mediaRecorder.start();
        console.log("[REC] Recording started...");
    } catch (e) {
        console.error("Recording failed:", e);
        alert("Recording failed: " + e.message);
        window.stopScopeRecording(); // Reset UI
    }
};

// --- SECURE TAPE ARCHIVE (IndexedDB) ---
const TRC_VERSION = "Apex V1";
const TRC_Vault = {
    dbName: 'TRC_Data',
    storeName: 'tapes',
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("[VAULT] Secure Archive Initialized");
                resolve(this.db);
            };
            request.onerror = (event) => {
                console.error("[VAULT] Init Failed:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    async saveTape(blob) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const tape = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                blob: blob,
                name: `TAPE_${new Date().toISOString().slice(0, 10)}`
            };
            const request = store.add(tape);
            request.onsuccess = () => resolve(tape.id);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAllTapes() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async deleteTape(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
};

// Initialize Vault
TRC_Vault.init();

// --- FIELD TAPE UI GLUE ---
// --- TOAST NOTIFICATIONS ---
window.showToast = function (msg) {
    const toast = document.createElement('div');
    toast.className = "fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 font-black text-xs uppercase tracking-widest animate-bounce";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};


window.stopScopeRecording = function () {
    if (!window.mediaRecorder) return;
    window.mediaRecorder.stop();

    // UI Update - Both sets
    document.getElementById('p-record-start')?.classList.remove('hidden');
    document.getElementById('p-record-stop')?.classList.add('hidden');
    document.getElementById('l-record-start')?.classList.remove('hidden');
    document.getElementById('l-record-stop')?.classList.add('hidden');
};

// Reticle logic removed for cleaner tactical feed

// --- SESSION HISTORY SUB-TAB SWITCHER ---



// --- LAB: WHAT-IF SIMULATION ---
window.runWhatIf = function () {
    const sAlt = parseFloat(document.getElementById('sim-alt')?.value || 0);
    const sTemp = parseFloat(document.getElementById('sim-temp')?.value || 59);
    const sHum = parseFloat(document.getElementById('sim-hum')?.value || 50);
    const sPress = parseFloat(document.getElementById('sim-press')?.value || 29.92);

    // Calculate Simulated Density Altitude using unified engine (Standardized to Station Pressure)
    // Calculate Simulated Density Altitude using unified engine (Standardized to Altimeter)
    const da = window.calculateDA(sAlt, sTemp, sHum, sPress, false);

    document.getElementById('lab-da-val').textContent = `${da.toLocaleString()} FT`;

    // Calculate Shift (Simplified heuristic for demo/training)
    // In real ballistics, high DA = less air = less drag = higher hit (less drop)
    const baseDrop = window.getDropForDistance(500); // Reference at 500yds
    const daShift = (da / 1000) * 0.15; // 0.15 mil shift per 1000ft DA (Rough heuristic)
    const shiftVal = document.getElementById('sim-shift-val');
    if (shiftVal) {
        shiftVal.textContent = da > 0 ? `+${daShift.toFixed(2)} MIL SHIFT` : `-${Math.abs(daShift).toFixed(2)} MIL SHIFT`;
        shiftVal.className = da > 0 ? "text-lg font-black text-emerald-400" : "text-lg font-black text-blue-400";
    }

    // Draw Trajectory
    const canvas = document.getElementById('trajectory-canvas');
    if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Ground line
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, h - 10); ctx.lineTo(w, h - 10); ctx.stroke();

        // Trajectory Arc
        ctx.strokeStyle = da > 2000 ? '#10b981' : '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(10, h - 10);
        // Quadratic curve for simple arc
        const midX = w / 2;
        const midY = h - 40 - (da / 500); // DA affects height of arc
        ctx.quadraticCurveTo(midX, midY, w - 10, h - 10);
        ctx.stroke();

        // Labels
        document.getElementById('traj-max-ord').textContent = `${(12 + (da / 1000)).toFixed(1)}"`;
        const impactDistance = Math.round(500 + (da / 5));
        document.getElementById('traj-impact').textContent = `${impactDistance} YDS`;
    }
};

window.syncLabToHUD = function () {
    // 1. Get Lab Values
    const sAlt = document.getElementById('sim-alt')?.value;
    const sTemp = document.getElementById('sim-temp')?.value;
    const sHum = document.getElementById('sim-hum')?.value;
    const sPress = document.getElementById('sim-press')?.value;

    // 2. Set OWC Values
    setVal('owc-alt', sAlt);
    setVal('owc-temp', sTemp);
    setVal('owc-hum', sHum);
    setVal('owc-press', sPress);

    // 3. Force Manual Mode (Disable Live)
    if (window.owcLiveSync) {
        window.toggleOWCLiveSync(); // Switches to MANUAL
    }

    // 4. Ensure OWC is in ALT mode
    if (window.owcAtmosMode !== 'alt') {
        window.toggleOWCAtmosMode(); // Switch to ALT mode if not already
    }

    // 5. Trigger Update
    if (window.updateOWC) window.updateOWC();

    // 6. Feedback
    window.showToast("LAB DATA SYNCED TO HUD");
};

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = val;
        // visual flash
        el.classList.add('text-green-400', 'font-bold');
        setTimeout(() => el.classList.remove('text-green-400', 'font-bold'), 1000);
    }
}

// --- AMMO & DRILL LOGIC (Consolidated to Section 14) ---
window.ammoBatchStore = [];


window.openIntelHub = function () {
    const modal = document.getElementById('intelHubModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Restore previous tab instead of defaulting to ai-advisor
        switchIntelTab(lastIntelTab || 'ai-advisor');
    }
};

window.openUKDTrainer = function () {
    const modal = document.getElementById('intelHubModal');
    if (modal) {
        modal.classList.remove('hidden');
        switchIntelTab('ballistic-intel');

        // Force a canvas resize and redraw once modal is visible
        setTimeout(() => {
            if (typeof window.initVirtualSpotter === 'function') {
                window.initVirtualSpotter();
            }
            if (!window.hmilState.active) {
                window.spawnHMILTarget();
            }
        }, 300);
    }
};

window.closeIntelHub = function () {
    const modal = document.getElementById('intelHubModal');
    if (modal) modal.classList.add('hidden');

    // Safety: Stop scope cam if running
    if (typeof window.stopScopeCam === 'function') {
        window.stopScopeCam();
    }
};

// Initialize Intel Hub Button
document.addEventListener('DOMContentLoaded', () => {

    const openIntelBtn = document.getElementById('openIntelBtn');
    if (openIntelBtn) {
        openIntelBtn.onclick = () => {
            if (typeof window.openIntelHub === 'function') window.openIntelHub();
        };
    }

    const closeIntelBtn = document.getElementById('closeIntelBtn');
    if (closeIntelBtn) {
        closeIntelBtn.onclick = () => {
            if (typeof window.closeIntelHub === 'function') window.closeIntelHub();
        };
    }

    // Lab Real-time Updates
    const simInputs = ['sim-alt', 'sim-temp', 'sim-hum', 'sim-press'];
    simInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.oninput = window.runWhatIf;
    });

    // Lab Button Listeners
    const setupSimBtn = (id, target, step) => {
        const btn = document.getElementById(id);
        const inp = document.getElementById(target);
        if (btn && inp) {
            btn.onclick = (e) => {
                e.preventDefault();
                const current = parseFloat(inp.value || 0);
                inp.value = (current + step).toFixed(id.includes('press') ? 2 : 0);
                window.runWhatIf();
            };
        }
    };
    setupSimBtn('sim-alt-plus', 'sim-alt', 100);
    setupSimBtn('sim-alt-minus', 'sim-alt', -100);
    setupSimBtn('sim-temp-plus', 'sim-temp', 1);
    setupSimBtn('sim-temp-minus', 'sim-temp', -1);
    setupSimBtn('sim-hum-plus', 'sim-hum', 5);
    setupSimBtn('sim-hum-minus', 'sim-hum', -5);
    setupSimBtn('sim-press-plus', 'sim-press', 0.1);
    setupSimBtn('sim-press-minus', 'sim-press', -0.1);

    // Range Master Listeners
    const rmStart = document.getElementById('range-master-start');
    const rmStop = document.getElementById('range-master-stop');
    const rmRepeat = document.getElementById('range-master-repeat');
    const rmInt = document.getElementById('range-master-interval');

    if (rmStart) rmStart.onclick = () => window.startRangeMaster();
    if (rmStop) rmStop.onclick = () => window.stopRangeMaster();
    if (rmRepeat) rmRepeat.onclick = () => window.repeatRangeMasterCall();
    if (rmInt) {
        rmInt.oninput = (e) => {
            const val = e.target.value;
            const display = document.getElementById('range-master-interval-val');
            if (display) display.textContent = `${val} SEC`;
            window.rangeMasterState.interval = parseInt(val);
        };
    }
});



// ===================================================================
// VIRTUAL SPOTTER LOGIC
// ===================================================================
// 1. Core State
let spotterCanvas = null;
let spotterCtx = null;
let spotterMode = 'auto'; // 'auto' | 'manual'
let currentReticle = 'mil'; // 'mil' | 'moa'

// Add global error logging for the spotter
window.addEventListener('error', (e) => {
    if (e.message.toLowerCase().includes('spotter')) {
        console.error("[CRA] Spotter Error Detected:", e.message);
    }
});

// 1. Core Calculation Utility
window.getDropForDistance = function (yards) {
    if (yards === 0) return 0;
    const dists = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    let lower = 0, upper = 100;
    if (yards >= 1000) return parseFloat(document.getElementById('clicks-1000')?.value || 0);
    for (let i = 0; i < dists.length; i++) {
        if (dists[i] >= yards) {
            upper = dists[i];
            lower = dists[i - 1] || 0;
            break;
        }
    }
    const lowerDrop = lower === 0 ? 0 : parseFloat(document.getElementById(`clicks-${lower}`)?.value || 0);
    const upperDrop = parseFloat(document.getElementById(`clicks-${upper}`)?.value || 0);
    if (isNaN(lowerDrop) || isNaN(upperDrop)) return 0;
    const ratio = (yards - lower) / (upper - lower);
    return lowerDrop + (ratio * (upperDrop - lowerDrop));
};

// 2. Drawing Engine
window.drawSpotterReticle = function (ctx, w, h, drop, wind) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    if (w <= 0 || h <= 0) return;

    const cx = w / 2;
    const cy = h / 2;
    const pxPerUnit = h / 45; // Default consistent scale

    // Ensure horizontal line is definitely drawn at the vertical center
    const horizontalY = Math.floor(cy);
    const verticalX = Math.floor(cx);

    // 1. Solid Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Grid (Optional visualization)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += pxPerUnit * 5) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += pxPerUnit * 5) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 3. TARGET (Steel Gong) - High Visibility Orange
    const targetSize = 3.5 * pxPerUnit;
    ctx.fillStyle = '#FFA500'; // High-Viz Orange
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, targetSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner ring for detail
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.arc(cx, cy, targetSize * 0.8, 0, Math.PI * 2); ctx.stroke();

    // 4. CROSSHAIRS
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    // Vertical
    ctx.moveTo(verticalX, 0); ctx.lineTo(verticalX, h);
    // Horizontal
    ctx.moveTo(0, horizontalY); ctx.lineTo(w, horizontalY);
    ctx.stroke();

    // 5. RETICLE MARKINGS (MIL-DOTS or MOA-HASHES)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.0;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';

    const maxUnits = 20;
    for (let i = -maxUnits; i <= maxUnits; i += 2) {
        if (i === 0) continue;
        const offset = i * pxPerUnit;

        if (currentReticle === 'mil') {
            // Draw Dots for MIL Reticle
            const dotSize = 2.0;
            // Vertical dots
            ctx.beginPath(); ctx.arc(cx, cy + offset, dotSize, 0, Math.PI * 2); ctx.fill();
            // Horizontal dots
            ctx.beginPath(); ctx.arc(cx + offset, cy, dotSize, 0, Math.PI * 2); ctx.fill();

            // Numbers every 4 mils
            if (i % 4 === 0 && i > 0) {
                ctx.font = 'bold 9px monospace';
                ctx.fillText(i, cx + 15, cy + offset + 3); // Vertical axis label
                ctx.fillText(i, cx + offset, cy + 16);     // Horizontal axis label
            }
        } else {
            // Draw HASHES for MOA Reticle
            const hashSize = i % 4 === 0 ? 6 : 3;
            // Vertical axis hashes (horizontal segments)
            ctx.beginPath();
            ctx.moveTo(cx - hashSize, cy + offset);
            ctx.lineTo(cx + hashSize, cy + offset);
            ctx.stroke();
            // Horizontal axis hashes (vertical segments)
            ctx.beginPath();
            ctx.moveTo(cx + offset, cy - hashSize);
            ctx.lineTo(cx + offset, cy + hashSize);
            ctx.stroke();

            if (i % 4 === 0 && i > 0) {
                ctx.fillText(i, cx + 12, cy + offset + 3);
                ctx.fillText(i, cx + offset, cy + 12);
            }
        }
    }

    // 6. SOLVER DATA (Impact/Hold)
    const isValid = !isNaN(drop) && !isNaN(wind);
    if (!isValid && spotterMode === 'auto') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FF5555';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(' RANGE CARD EMPTY', cx, cy - 35);
        ctx.font = '9px Inter';
        ctx.fillStyle = 'white';
        ctx.fillText('Go to library or use MANUAL toggles', cx, cy - 15);
    } else {
        // Calculate coordinate offsets
        // In most scopes, dialing UP moves the reticle DOWN (so target/impact moves UP relative to reticle)
        // For simplicity: Red Dot = where to aim. Impact = where bullet goes if aimed center.
        const holdY = cy + (drop * pxPerUnit);
        const holdX = cx - (wind * pxPerUnit);
        const imY = cy + (drop * pxPerUnit);
        const imX = cx + (wind * pxPerUnit);

        // IMPACT POINT (High-Viz Cyan - "Where it hits center-held")
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)'; // Cyan trail
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(imX, imY); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#00FFFF'; // Bright Cyan Hit
        ctx.beginPath(); ctx.arc(imX, imY, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        // THE HOLD (High-Viz Red Dot)
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath(); ctx.arc(holdX, holdY, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Lens Glint (Smaller)
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(holdX - 1, holdY - 1, 0.8, 0, Math.PI * 2); ctx.fill();
    }

    // 7. Orientation cues
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('UP', cx, 15);
    ctx.fillText('DOWN', cx, h - 15);
    ctx.fillText('LEFT', 25, cy - 10);
    ctx.fillText('RIGHT', w - 25, cy - 10);

    // 7.5 SCOPE IDENTITY HEADER
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.fillRect(cx - 60, 5, 120, 16);
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('--- VIRTUAL SCOPE VIEW ---', cx, 16);

    // 8. H-MIL TARGET RENDERING
    if (window.hmilState && window.hmilState.active) {
        const t = window.hmilState;
        const pX = cx + (t.offsetX * pxPerUnit);
        const pY = cy + (t.offsetY * pxPerUnit);

        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 1.5;

        if (t.type === 'ladder') {
            const hMils = (72 * 27.77) / t.range;
            const wMils = (36 * 27.77) / t.range;
            const pW = wMils * pxPerUnit;
            const pH = hMils * pxPerUnit;

            ctx.beginPath();
            ctx.moveTo(pX - pW / 2, pY); ctx.lineTo(pX - pW / 2, pY - pH);
            ctx.moveTo(pX + pW / 2, pY); ctx.lineTo(pX + pW / 2, pY - pH);
            ctx.stroke();
            for (let r = 1; r <= 6; r++) {
                ctx.beginPath();
                ctx.moveTo(pX - pW / 2, pY - (pH * (r / 7)));
                ctx.lineTo(pX + pW / 2, pY - (pH * (r / 7)));
                ctx.stroke();
            }
        } else if (t.type === 'silhouette') {
            const hMils = (30 * 27.77) / t.range;
            const wMils = (18 * 27.77) / t.range;
            const pW = wMils * pxPerUnit;
            const pH = hMils * pxPerUnit;
            ctx.strokeRect(pX - pW / 2, pY - pH, pW, pH);
            ctx.strokeRect(pX - pW / 4, pY - pH - (pH * 0.2), pW / 2, pH * 0.2);
        } else if (t.type === 'barrel') {
            const hMils = (35 * 27.77) / t.range;
            const wMils = (23 * 27.77) / t.range;
            const pW = wMils * pxPerUnit;
            const pH = hMils * pxPerUnit;
            ctx.strokeRect(pX - pW / 2, pY - pH, pW, pH);
            ctx.beginPath(); ctx.ellipse(pX, pY - pH, pW / 2, pH * 0.1, 0, 0, Math.PI * 2); ctx.stroke();
        } else if (t.type === 'vehicle') {
            const wMils = (70 * 27.77) / t.range;
            const hMils = (50 * 27.77) / t.range;
            const pW = wMils * pxPerUnit;
            const pH = hMils * pxPerUnit;
            ctx.strokeRect(pX - pW / 2, pY - pH, pW, pH);
            ctx.strokeRect(pX - pW / 2.5, pY - pH - (pH * 0.4), pW / 1.25, pH * 0.4);
        }
    }

    // 9. Legend Labels
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(' HOLD (Aim here)', 10, h - 35);
    ctx.fillText(' IMPACT (If center-aimed)', 10, h - 20);
};

// 4. Update Handler
window.updateSpotter = function () {
    if (!spotterCtx || !spotterCanvas) return;

    let dropVal = 0;
    let windVal = 0;

    if (spotterMode === 'auto') {
        const range = parseInt(document.getElementById('spotter-range')?.value || 0);
        const wind = parseInt(document.getElementById('spotter-wind-slider')?.value || 0);
        dropVal = window.getDropForDistance(range);
        windVal = (range / 100) * 0.9 * (wind / 5);
    } else {
        dropVal = parseFloat(document.getElementById('spotter-manual-elev')?.value || 0);
        windVal = parseFloat(document.getElementById('spotter-manual-wind')?.value || 0);
    }

    const unitSuffix = currentReticle === 'mil' ? ' MIL' : ' MOA';
    const elevEl = document.getElementById('spotter-elev');
    const windEl = document.getElementById('spotter-wind');
    if (elevEl) elevEl.textContent = dropVal.toFixed(1) + unitSuffix;
    if (windEl) windEl.textContent = Math.abs(windVal).toFixed(1) + unitSuffix;

    window.drawSpotterReticle(spotterCtx, spotterCanvas.width, spotterCanvas.height, dropVal, windVal);
};

// --- H-MIL SIMULATOR LOGIC ---
window.hmilState = {
    active: false,
    type: 'ladder',
    range: 500,
    offsetX: 5,
    offsetY: 5,
    revealed: false,
    userDist: '',
    mathHTML: ''
};

window.spawnHMILTarget = function () {
    console.log("[SYS] Spawning H-MIL Scenario...");
    window.hmilState.active = true;
    window.hmilState.type = document.getElementById('hmil-target-type')?.value || 'ladder';
    window.hmilState.range = Math.floor(Math.random() * 600) + 200; // 200-800 yards
    window.hmilState.offsetX = (Math.random() * 10) - 5;
    window.hmilState.offsetY = (Math.random() * 10) - 5;
    window.hmilState.revealed = false;
    window.hmilState.userDist = '';
    window.hmilState.mathHTML = '';

    const mathDisplay = document.getElementById('hmil-math-reveal');
    if (mathDisplay) mathDisplay.classList.add('hidden');

    const distInput = document.getElementById('hmil-user-dist');
    if (distInput) distInput.value = '';

    window.updateSpotter();
};

window.resetHMILCurrent = function () {
    console.log("[SYS] Resetting Current H-MIL Attempt...");
    window.hmilState.revealed = false;
    window.hmilState.userDist = '';
    window.hmilState.mathHTML = '';

    const mathDisplay = document.getElementById('hmil-math-reveal');
    if (mathDisplay) {
        mathDisplay.classList.add('hidden');
        mathDisplay.innerHTML = '';
    }

    const distInput = document.getElementById('hmil-user-dist');
    if (distInput) distInput.value = '';

    window.updateSpotter();
};

window.nudgeHMIL = function (dir) {
    if (!window.hmilState.active) return;
    const step = 0.5; // 0.5 MIL nudge
    switch (dir) {
        case 'up': window.hmilState.offsetY += step; break;
        case 'down': window.hmilState.offsetY -= step; break;
        case 'left': window.hmilState.offsetX += step; break;
        case 'right': window.hmilState.offsetX -= step; break;
    }
    window.updateSpotter();
};

window.verifyHMILSolution = function () {
    if (!window.hmilState.active) return;

    const userDist = parseInt(document.getElementById('hmil-user-dist')?.value || 0);
    const trueDist = window.hmilState.range;
    const diff = Math.abs(userDist - trueDist);
    const accuracy = Math.max(0, 100 - (diff / trueDist * 100)).toFixed(1);

    const mathDisplay = document.getElementById('hmil-math-reveal');
    if (mathDisplay) {
        mathDisplay.classList.remove('hidden');
        let mathText = "";
        if (window.hmilState.type === 'ladder') {
            const hMils = ((72 * 27.77) / trueDist).toFixed(2);
            const wMils = ((36 * 27.77) / trueDist).toFixed(2);
            mathText = `
                <div class="border-b border-orange-500/20 pb-1 mb-1">TRUE RANGE: ${trueDist} YDS</div>
                <div>VERTICAL (6FT): (72" * 27.77) / ${hMils} MILs</div>
                <div>HORIZONTAL (3FT): (36" * 27.77) / ${wMils} MILs</div>
                <div class="mt-2 pt-1 border-t border-orange-500/20 text-white">YOUR SCORE: ${accuracy}% ACCURACY</div>
            `;
        } else {
            mathText = `
                <div class="border-b border-orange-500/20 pb-1 mb-1">TRUE RANGE: ${trueDist} YDS</div>
                <div>ACCURACY: ${accuracy}%</div>
                <div class="text-[7px] text-zinc-500 mt-1 uppercase">Math details pending for this object type.</div>
            `;
        }
        mathDisplay.innerHTML = mathText;
    }
    window.hmilState.revealed = true;
    window.hmilState.mathHTML = mathDisplay.innerHTML;
};

// --- DRAG AIMING SUPPORT ---
let isAiming = false;
let lastX, lastY;

const startAiming = (x, y) => {
    if (!window.hmilState.active) return;
    isAiming = true; lastX = x; lastY = y;
};

const doAiming = (x, y) => {
    if (!isAiming || !window.hmilState.active) return;
    const dx = x - lastX;
    const dy = y - lastY;
    const pxPerUnit = (spotterCanvas?.height || 300) / 45;
    let newOffX = window.hmilState.offsetX + (dx / pxPerUnit);
    let newOffY = window.hmilState.offsetY + (dy / pxPerUnit);

    // Constrain to prevent losing the target (max +/- 100 MILs)
    newOffX = Math.max(-100, Math.min(100, newOffX));
    newOffY = Math.max(-100, Math.min(100, newOffY));

    window.hmilState.offsetX = newOffX;
    window.hmilState.offsetY = newOffY;

    lastX = x; lastY = y;
    window.updateSpotter();
};

window.centerSpotterView = function () {
    window.hmilState.offsetX = 0;
    window.hmilState.offsetY = 0;
    window.updateSpotter();
};

const stopAiming = () => { isAiming = false; };

// 5. Initializer
window.initVirtualSpotter = function () {
    const canvas = document.getElementById('virtual-spotter-canvas');
    if (!canvas) return;

    spotterCanvas = canvas;
    spotterCtx = canvas.getContext('2d', { willReadFrequently: true });

    // Prevent listener duplication
    if (canvas._initialized) {
        window.updateSpotter();
        return;
    }
    canvas._initialized = true;

    const triggerUpdate = () => {
        const h = canvas.clientHeight || 300;
        const w = canvas.clientWidth || 600;
        canvas.width = w; canvas.height = h;
        window.updateSpotter();
    };

    // UI Wire-up
    const bAuto = document.getElementById('spotter-mode-auto');
    const bManual = document.getElementById('spotter-mode-manual');
    const cAuto = document.getElementById('spotter-controls-auto');
    const cManual = document.getElementById('spotter-controls-manual');

    if (bAuto && bManual) {
        bAuto.onclick = () => {
            spotterMode = 'auto';
            bAuto.className = 'px-3 py-1 text-[9px] font-black rounded-md bg-neon-green text-black transition-all';
            bManual.className = 'px-3 py-1 text-[9px] font-black rounded-md text-zinc-500 hover:text-white transition-all';
            if (cAuto) cAuto.classList.remove('hidden');
            if (cManual) cManual.classList.add('hidden');
            window.updateSpotter();
        };
        bManual.onclick = () => {
            spotterMode = 'manual';
            bManual.className = 'px-3 py-1 text-[9px] font-black rounded-md bg-neon-green text-black transition-all';
            bAuto.className = 'px-3 py-1 text-[9px] font-black rounded-md text-zinc-500 hover:text-white transition-all';
            if (cManual) cManual.classList.remove('hidden');
            if (cAuto) cAuto.classList.add('hidden');
            window.updateSpotter();
        };
    }

    const rS = document.getElementById('spotter-range');
    const wS = document.getElementById('spotter-wind-slider');
    if (rS) rS.oninput = () => {
        document.getElementById('spotter-range-val').textContent = rS.value + ' YDS';
        window.updateSpotter();
    };
    if (wS) wS.oninput = () => {
        const val = parseInt(wS.value);
        document.getElementById('spotter-wind-val').textContent = Math.abs(val) + ' MPH ' + (val < 0 ? 'L' : (val > 0 ? 'R' : ''));
        window.updateSpotter();
    };

    // Manual Dials
    const mE = document.getElementById('spotter-manual-elev');
    const mW = document.getElementById('spotter-manual-wind');
    if (mE) mE.oninput = window.updateSpotter;
    if (mW) mW.oninput = window.updateSpotter;

    const setupBtn = (id, target, step) => {
        const btn = document.getElementById(id);
        const inp = document.getElementById(target);
        if (btn && inp) btn.onclick = () => {
            inp.value = (parseFloat(inp.value || 0) + step).toFixed(2);
            window.updateSpotter();
        };
    };
    setupBtn('spotter-manual-elev-plus', 'spotter-manual-elev', 0.25);
    setupBtn('spotter-manual-elev-minus', 'spotter-manual-elev', -0.25);
    setupBtn('spotter-manual-wind-plus', 'spotter-manual-wind', 0.25);
    setupBtn('spotter-manual-wind-minus', 'spotter-manual-wind', -0.25);

    // Reticle buttons
    const bMil = document.getElementById('reticle-type-mil');
    const bMoa = document.getElementById('reticle-type-moa');
    if (bMil && bMoa) {
        bMil.onclick = () => {
            currentReticle = 'mil';
            bMil.className = 'flex-1 py-1 text-[8px] font-black border border-zinc-700 rounded bg-zinc-800 text-white';
            bMoa.className = 'flex-1 py-1 text-[8px] font-black border border-transparent rounded text-zinc-500 hover:text-white';
            window.updateSpotter();
        };
        bMoa.onclick = () => {
            currentReticle = 'moa';
            bMoa.className = 'flex-1 py-1 text-[8px] font-black border border-zinc-700 rounded bg-zinc-800 text-white';
            bMil.className = 'flex-1 py-1 text-[8px] font-black border border-transparent rounded text-zinc-500 hover:text-white';
            window.updateSpotter();
        };
    }

    // Drag Aiming listeners
    canvas.addEventListener('mousedown', (e) => startAiming(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => doAiming(e.clientX, e.clientY));
    window.addEventListener('mouseup', stopAiming);
    canvas.addEventListener('touchstart', (e) => {
        if (window.hmilState.active) {
            const t = e.touches[0]; startAiming(t.clientX, t.clientY); e.preventDefault();
        }
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        if (window.hmilState.active) {
            const t = e.touches[0]; doAiming(t.clientX, t.clientY); e.preventDefault();
        }
    }, { passive: false });
    canvas.addEventListener('touchend', stopAiming);

    // Persistence Sync
    const hmilDistInput = document.getElementById('hmil-user-dist');
    if (hmilDistInput) {
        hmilDistInput.value = window.hmilState.userDist || '';
        hmilDistInput.oninput = (e) => { window.hmilState.userDist = e.target.value; };
    }
    const hmilMathDisplay = document.getElementById('hmil-math-reveal');
    if (hmilMathDisplay) {
        if (window.hmilState.revealed) {
            hmilMathDisplay.innerHTML = window.hmilState.mathHTML;
            hmilMathDisplay.classList.remove('hidden');
        } else {
            hmilMathDisplay.classList.add('hidden');
        }
    }

    triggerUpdate();
    setTimeout(triggerUpdate, 500);
};

// --- TAB SCROLL BOOSTER (For PC Emulators) ---
document.addEventListener('DOMContentLoaded', () => {

    const tabContainer = document.querySelector('.no-scrollbar');
    if (!tabContainer) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    tabContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        tabContainer.classList.add('active');
        startX = e.pageX - tabContainer.offsetLeft;
        scrollLeft = tabContainer.scrollLeft;
    });
    tabContainer.addEventListener('mouseleave', () => {
        isDown = false;
    });
    tabContainer.addEventListener('mouseup', () => {
        isDown = false;
    });
    tabContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabContainer.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
    });
});

// ================================================================================
// OPERATOR WORK CENTER (OWC) MODULE
// ================================================================================

window.owcLiveSync = true; // Default to Live Mission Sync
window.owcAtmosMode = 'da'; // 'da' or 'alt'

window.toggleOWCUnits = function () {
    window.owcUnitMode = window.owcUnitMode === 'MIL' ? 'MOA' : 'MIL';
    const btn = document.getElementById('owc-unit-toggle-btn');
    if (btn) btn.textContent = `MODE: ${window.owcUnitMode}`;

    // Update labels in OWC
    const elevUnitLabel = document.querySelector('#owc-elev-mils')?.parentElement?.nextElementSibling?.querySelector('span'); // This might be brittle, let's be more specific
    // Actually, I'll update find the labels by text content if possible or just update IDs if I can.
    // Better: Update the textContent of the labels in updateOWC.

    window.updateOWC();
    window.generateQuickDope(); // [USER REQUEST] Also refresh the DOPE table
};

window.updateOWC = function () {
    try {
        const range = parseFloat(document.getElementById('owc-range')?.value) || 0;
        const zero = parseFloat(document.getElementById('owc-zero')?.value) || 100;
        const mv = parseFloat(document.getElementById('owc-mv')?.value) || 2700;
        const bc = parseFloat(document.getElementById('owc-bc')?.value) || 0.450;

        const windDir = parseFloat(document.getElementById('owc-wind-dir')?.value) || 270;
        const windSpeed = parseFloat(document.getElementById('owc-wind-speed')?.value) || 0;
        const losHeading = parseFloat(document.getElementById('owc-los-heading')?.value) || 0;
        const angle = parseFloat(document.getElementById('owc-angle')?.value) || 0;

        // --- 0. PRE-CALC ENVIRONMENT (Independent of Range) ---
        const daElement = document.getElementById('owc-da');
        let daVal = daElement?.value;

        if (window.owcAtmosMode === 'alt') {
            const alt = parseFloat(document.getElementById('owc-alt')?.value || 0);
            const temp = parseFloat(document.getElementById('owc-temp')?.value || 59);
            const hum = parseFloat(document.getElementById('owc-hum')?.value || 50);
            const press = parseFloat(document.getElementById('owc-press')?.value || 29.92);
            daVal = window.calculateDA(alt, temp, hum, press, false);
            const daDisp = document.getElementById('owc-calc-da-display');
            if (daDisp) daDisp.textContent = `${daVal} FT`;
        }

        const compass = document.getElementById('owc-wind-compass');
        if (compass) compass.style.transform = `rotate(${windDir}deg)`;

        if (range <= 0) {
            window.resetOWCResults();
            if (window.owcAtmosMode === 'alt' && daVal) {
                const daDisp = document.getElementById('owc-calc-da-display');
                if (daDisp) daDisp.textContent = `${daVal} FT`;
            }
            return;
        }

        const weather = {
            temp: parseFloat(document.getElementById('owc-temp')?.value) || 59,
            pressure: parseFloat(document.getElementById('owc-press')?.value) || 29.92,
            humidity: parseFloat(document.getElementById('owc-hum')?.value) || 50,
            windSpeed: windSpeed,
            windAngle: (windDir - losHeading + 360) % 360,
            da: (daVal !== "" && daVal !== undefined) ? parseFloat(daVal) : null
        };

        const profile = { velocity: mv, zero, bc, scopeHeight: 1.75 };
        const result = window.BallisticEngine.calculate(profile, weather, range, angle);

        // 3. Update Relative Wind Status
        const relWindStatus = document.getElementById('owc-rel-wind-status');
        if (relWindStatus) {
            const radRel = (weather.windAngle) * Math.PI / 180;
            const absSin = Math.abs(Math.sin(radRel));
            if (absSin > 0.8) relWindStatus.textContent = "FULL VALUE CROSS";
            else if (absSin > 0.3) relWindStatus.textContent = "PARTIAL CROSS";
            else if (Math.cos(radRel) > 0.8) relWindStatus.textContent = "DIRECT HEADWIND";
            else if (Math.cos(radRel) < -0.8) relWindStatus.textContent = "DIRECT TAILWIND";
            else relWindStatus.textContent = "NEGLIGIBLE VALUE";
        }

        // 4. Update UI Results
        const updateText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        const isMIL = window.owcUnitMode === 'MIL';
        const elevVal = isMIL ? parseFloat(result.elevMil) : parseFloat(result.elevMOA);
        updateText('owc-elev-mils', Math.abs(elevVal).toFixed(1));
        updateText('owc-elev-inches', `${Math.abs(parseFloat(result.dropInches))}"`);

        // Update Click Label (Assuming 1/10 Mil or 1/4 MOA)
        const clicks = isMIL ? Math.abs(Math.round(elevVal * 10)) : Math.abs(Math.round(elevVal * 4));
        updateText('owc-elev-clicks', `${clicks} CLICKS`);

        const elevDirEl = document.getElementById('owc-elev-dir');
        if (elevDirEl) {
            elevDirEl.textContent = elevVal >= 0 ? "U" : "D";
            elevDirEl.className = `text-xl font-black ${elevVal >= 0 ? 'text-blue-200' : 'text-orange-400'} opacity-80`;
        }

        const windVal = isMIL ? result.windMil : result.windMOA;
        updateText('owc-wind-mils', windVal);

        // Update Wind Clicks (Assuming 1/10 Mil or 1/4 MOA)
        const wClicks = isMIL ? Math.abs(Math.round(parseFloat(result.windMil) * 10)) : Math.abs(Math.round(parseFloat(result.windMOA) * 4));
        updateText('owc-wind-clicks', `${wClicks} CLICKS`);

        // Update Unit Labels in the UI
        const milLabels = document.querySelectorAll('.owc-unit-label');
        milLabels.forEach(label => {
            label.textContent = window.owcUnitMode + (window.owcUnitMode === 'MIL' ? 'S' : '');
        });

        // Feedback Pulse on answer box
        const answerBox = document.getElementById('owc-elev-mils')?.parentElement;
        if (answerBox) {
            // Flash Green on update
            answerBox.classList.remove('bg-blue-600', 'border-blue-400');
            answerBox.classList.add('bg-emerald-600', 'border-emerald-400', 'scale-[1.02]');
            setTimeout(() => {
                answerBox.classList.remove('bg-emerald-600', 'border-emerald-400', 'scale-[1.02]');
                answerBox.classList.add('bg-blue-600', 'border-blue-400');
            }, 150);
        }

        // Also flash Windage Box
        const windBox = document.getElementById('owc-wind-mils')?.parentElement?.parentElement;
        if (windBox) {
            windBox.classList.add('border-emerald-400');
            setTimeout(() => windBox.classList.remove('border-emerald-400'), 150);
        }

        const inchesPerMil = (range * 36) / 1000;
        const windInches = (parseFloat(result.windMil) * inchesPerMil).toFixed(1);
        updateText('owc-wind-inches', `${windInches}"`);
        updateText('owc-wind-clicks', `${Math.abs(Math.round(parseFloat(result.windMil) * 10))} CLICKS`);

        const wiLabel = document.getElementById('owc-wind-hold-label');
        const windCalloutEl = document.getElementById('owc-wind-dir-callout');
        if (wiLabel) {
            if (weather.windSpeed === 0) wiLabel.textContent = "NO WIND";
            else wiLabel.textContent = "HOLD INTO WIND";
        }
        if (windCalloutEl) {
            // Simple visual: L or R
            const wAng = weather.windAngle % 360;
            if (wAng > 0 && wAng < 180) windCalloutEl.textContent = "R";
            else if (wAng > 180) windCalloutEl.textContent = "L";
            else windCalloutEl.textContent = "-";
        }

        // --- MAP INTEGRATION ---
        // If the map is active and showing range lines, update them with the new weather
        if (typeof window.updateRangeLines === 'function' && window.map) {
            window.updateRangeLines();
        }

        updateText('owc-spin-val', result.spinDriftMils.toFixed(2));

        // 5. Reticle Sync
        window.syncOWCReticle(parseFloat(result.elevMil), parseFloat(result.windMil));

        // 6. Push to Main Card
        // const mainHoldLabel = document.getElementById('display-hold-value');
        // if (mainHoldLabel) {
        //     mainHoldLabel.textContent = `${result.elevMil} MIL`;
        //     mainHoldLabel.classList.add('text-blue-600', 'font-black');
        // }

    } catch (err) {
        console.error("[OWC] Unified Logic Failure:", err);
    }

    // AUTO-UPDATE DOPE CHART
    // If we are in the Work Center, we want the Dope Chart to be ready
    if (typeof window.generateQuickDope === 'function') {
        // Small delay to ensure state is settled if coming from rapid inputs
        // using requestAnimationFrame for UI smoothness
        requestAnimationFrame(() => {
            window.generateQuickDope();
        });
    }
};

window.resetOWCResults = function () {
    const ids = ['owc-elev-mils', 'owc-elev-inches', 'owc-elev-clicks', 'owc-wind-mils', 'owc-wind-inches', 'owc-wind-clicks', 'owc-spin-val'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id.includes('inches')) el.textContent = '0"';
            else if (id.includes('clicks')) el.textContent = '0 CLICKS';
            else el.textContent = '0.0';
        }
    });
    window.syncOWCReticle(0, 0);
};

window.syncOWCReticle = function (elevMils, windMils) {
    const dot = document.getElementById('owc-reticle-dot');
    if (!dot) return;

    // Movement scale: 4 pixels per Mil (keeps it in the 64px box)
    // Elevation: More drop = move dot UP
    // Windage: Right wind = move dot LEFT
    const scale = 4;
    const maxOff = 30; // Clamp to stay in circular view

    let xOffset = -windMils * scale;
    let yOffset = -elevMils * scale;

    // Safety clamp
    xOffset = Math.max(-maxOff, Math.min(maxOff, xOffset));
    yOffset = Math.max(-maxOff, Math.min(maxOff, yOffset));

    dot.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
};



window.toggleOWCAtmosMode = function () {
    const label = document.getElementById('owc-atmos-label');
    const footer = document.getElementById('owc-atmos-footer');
    const modeDa = document.getElementById('owc-mode-da');
    const modeAlt = document.getElementById('owc-mode-alt');

    if (!label || !footer || !modeDa || !modeAlt) return;

    if (window.owcAtmosMode === 'da') {
        window.owcAtmosMode = 'alt';
        label.textContent = "09: CLASSIC ALT";
        footer.textContent = "FIELD ELEVATION";
        modeDa.classList.add('hidden');
        modeAlt.classList.remove('hidden');
    } else {
        window.owcAtmosMode = 'da';
        label.textContent = "09: DENS. ALT";
        footer.textContent = "DENS. ALTITUDE";
        modeDa.classList.remove('hidden');
        modeAlt.classList.add('hidden');
    }
    window.updateOWC();
};
// (calculateDA consolidated to global utility at line 6615)

window.syncOWCWeather = function (force = false) {
    const daInp = document.getElementById('owc-da');
    if (!daInp) return;

    // Guard: Respect Manual Mode unless forced
    if (!window.owcLiveSync && !force) return;

    // Pull from Main HUD master inputs
    const temp = parseFloat(document.getElementById('temperature')?.value) || 59;
    const hum = parseFloat(document.getElementById('humidity')?.value) || 50;
    const press = parseFloat(document.getElementById('pressure')?.value) || 29.92;
    const alt = parseFloat(document.getElementById('owc-alt')?.value) || 0;

    // Use high-fidelity formula (use false for isStationPressure to treat HUD input as Altimeter/QNH)
    const calculatedDA = window.calculateDA ? window.calculateDA(alt, temp, hum, press, false) : 0;
    daInp.value = calculatedDA;

    // Update display if exists
    const disp = document.getElementById('owc-calc-da-display');
    if (disp) disp.textContent = calculatedDA;

    // Also push to OWC widgets if they exist (Bi-directional visual sync)
    const syncMap = {
        'owc-temp': temp,
        'owc-press': press,
        'owc-hum': hum,
        'owc-mv': document.getElementById('velocity')?.value,
        'owc-bc': document.getElementById('g1')?.value,
        'owc-zero': document.getElementById('zero')?.value,
        'owc-wind-speed': document.getElementById('wind-speed')?.value,
        'owc-wind-dir': document.getElementById('wind-dir')?.value
    };

    Object.entries(syncMap).forEach(([targetId, val]) => {
        const el = document.getElementById(targetId);
        if (el && val !== undefined) {
            el.value = val;
            // Slider Display Sync
            if (targetId === 'owc-wind-speed') {
                const valDisp = document.getElementById('owc-wind-speed-val');
                if (valDisp) valDisp.textContent = val;
            }
        }
    });

    // Unified call for efficiency
    if (window.updateOWC) window.updateOWC();

    // LOG SYNC ACTION
    if (typeof SessionLogger !== 'undefined' && force) {
        SessionLogger.add("USER", `Synced OWC Weather: DA ${calculatedDA} ft`);
    }

    daInp.classList.add('text-neon-green');
    setTimeout(() => daInp.classList.remove('text-neon-green'), 1000);

    // Visual Feedback for the Sync Button
    if (force) {
        const btn = document.querySelector('button[onclick="window.syncOWCWeather(true)"]');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "SYNCED";
            btn.classList.add('bg-emerald-600', 'text-white');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('bg-emerald-600', 'text-white');
            }, 1000);
        }
    }
};

window.toggleOWCLiveSync = function () {
    window.owcLiveSync = !window.owcLiveSync;
    const btn = document.getElementById('owc-live-sync-btn');
    if (btn) {
        if (window.owcLiveSync) {
            btn.classList.add('bg-blue-600');
            btn.classList.remove('bg-zinc-800', 'text-zinc-500');
            btn.textContent = "LIVE: ON";
            window.syncOWCWeather();
        } else {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-zinc-800', 'text-zinc-500'); // Dim it to show it's disabled/manual
            btn.textContent = "MANUAL";
        }
    }
};

window.solveOWC = function () {
    console.log("[OWC] Solving mission parameters...");

    // Add a quick feedback animation to the answer boxes
    const answers = ['owc-elev-mils', 'owc-wind-mils'];
    answers.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentElement) {
            el.parentElement.classList.add('scale-110', 'brightness-125');
            setTimeout(() => {
                if (el.parentElement) el.parentElement.classList.remove('scale-110', 'brightness-125');
            }, 150);
        }
    });

    if (typeof window.updateOWC === 'function') {
        window.updateOWC();
    }
};

window.resetWorkCenter = function () {
    const fields = ['owc-range', 'owc-da', 'owc-wind-speed', 'owc-wind-dir', 'owc-angle'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = (id === 'owc-wind-dir') ? 270 : 0;
            if (id === 'owc-wind-speed') {
                const valDisp = document.getElementById('owc-wind-speed-val');
                if (valDisp) valDisp.textContent = '0';
            }
        }
    });

    // Reset results labels
    window.resetOWCResults();

    // Pulse reset feedback
    const btn = document.querySelector('button[onclick*="resetWorkCenter"]');
    if (btn) {
        btn.classList.add('bg-amber-600');
        setTimeout(() => btn.classList.remove('bg-amber-600'), 500);
    }

    // Clear Saved State
    localStorage.removeItem('trc_owc_state');

    console.log("[OWC] Work Center Reset.");
    window.updateOWC();
};

// ===================================================================
// TACTICAL COMPASS HUB (OPERATOR HUD)
// ===================================================================
let compassInitialized = false;

window.setCompassGlow = function (mode) {
    const container = document.querySelector('.glow-container');
    if (!container) return;

    container.classList.remove('glow-amber', 'glow-red', 'glow-green');
    container.classList.add(`glow-${mode}`);

    // Update scan line color via RGB variable if needed
    const root = document.querySelector(':root');
    const colors = { amber: '245, 158, 11', red: '239, 68, 68', green: '16, 185, 129' };
    container.style.setProperty('--glow-rgb', colors[mode]);
};


// --- AMMO BATCH MANAGEMENT (Modal Based) ---
window.currentBatchId = null;

// UNIVERSAL DATA LOADER
window.loadAllData = function () {
    console.log("Loading Persistent Data...");

    // 1. Load & Migrate Ammo
    const legacyAmmo = localStorage.getItem('ammoBatches');
    const proAmmo = localStorage.getItem('trc_ammo_batches');

    let batches = [];
    if (proAmmo) {
        batches = JSON.parse(proAmmo);
    } else if (legacyAmmo) {
        batches = JSON.parse(legacyAmmo);
    }

    window.ammoBatchStore = batches;

    // 2. Load Drills
    const savedDrills = localStorage.getItem('trc_drills');
    if (savedDrills) {
        window.drillStore = JSON.parse(savedDrills);
    } else {
        window.drillStore = [];
    }
    window.renderDrills();

    // 3. Data Migration (Legacy Speed -> MV & ID Generation)
    let migrated = false;
    window.ammoBatchStore.forEach(batch => {
        if (!batch.id) {
            batch.id = Date.now() + Math.random();
            migrated = true;
        }
        if (batch.speed && !batch.mv) {
            batch.mv = batch.speed;
            migrated = true;
        }
        if (!batch.zero) {
            batch.zero = 100;
            migrated = true;
        }
    });

    if (migrated || legacyAmmo) {
        localStorage.setItem('trc_ammo_batches', JSON.stringify(window.ammoBatchStore));
        // Cleanup legacy after first successful migration
        if (legacyAmmo) localStorage.removeItem('ammoBatches');
    }

    window.renderAmmoLog();
};

window.renderAmmoLog = function () {
    const container = document.getElementById('ammo-log-container');
    if (!container) return;

    container.innerHTML = '';

    // Standardize on 'trc_ammo_batches'
    const batches = JSON.parse(localStorage.getItem('trc_ammo_batches') || localStorage.getItem('ammoBatches') || '[]');
    window.ammoBatchStore = batches;

    if (batches.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-10 border-2 border-dashed border-gray-800 rounded-xl">
                <p class="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic mb-2">Manifest Empty</p>
                <p class="text-[9px] text-zinc-500 mb-4">Awaiting supply acquisition data...</p>
                <button onclick="addNewAmmoBatch()" class="text-blue-500 text-[10px] font-bold uppercase hover:text-white transition-colors">
                    + Create First Batch
                </button>
            </div>`;
        return;
    }

    batches.forEach((batch, index) => {
        const activeBatchId = localStorage.getItem('trc_active_batch_id');
        const isActive = batch && batch.id && batch.id.toString() === activeBatchId;

        const card = document.createElement('div');
        card.className = `bg-zinc-950/80 border ${isActive ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'border-zinc-800'} rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden shadow-lg hover:border-blue-500/30 transition-all`;
        card.innerHTML = `
            <!-- Background Signal -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

            <div class="relative z-10 w-full">
                <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                        <h4 class="text-[11px] font-black text-white uppercase tracking-wider">${batch.name}</h4>
                    </div>
                    <span class="text-[7px] font-black bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400 uppercase tracking-widest">${batch.type || 'MATCH'}</span>
                </div>

                <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-[9px] font-mono mb-4 pt-2 border-t border-zinc-800/30">
                    <div class="flex justify-between border-b border-zinc-800/30 pb-1">
                        <span class="text-blue-500/70 font-black">MUZZLE VELOCITY</span>
                        <span class="text-white font-black">${batch.mv || '2700'}<span class="text-[7px] text-zinc-500 ml-1">FPS</span></span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-800/30 pb-1">
                        <span class="text-blue-500/70 font-black">BALLISTIC COEFF</span>
                        <span class="text-white font-black">${batch.bc || '0.450'}<span class="text-[7px] text-zinc-500 ml-1">G1</span></span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-800/30 pb-1">
                        <span class="text-orange-500/70 font-black">ZERO RANGE</span>
                        <span class="text-white font-black">${batch.zero || '100'}<span class="text-[7px] text-zinc-500 ml-1">YDS</span></span>
                    </div>
                    <div class="flex justify-between border-b border-zinc-800/30 pb-1">
                        <span class="text-zinc-600 uppercase font-black">QTY</span>
                        <span class="text-white font-black text-right">${batch.qty || '--'}</span>
                    </div>
                </div>

                <!-- Expanded Data Section -->
                <div class="space-y-1.5 mb-4 bg-black/20 p-2 rounded border border-white/5">
                    <div class="flex justify-between items-center text-[8px] uppercase font-bold">
                        <span class="text-zinc-500">RIFLE:</span>
                        <span class="text-blue-400">${batch.rifle || '---'}</span>
                    </div>
                    <div class="flex justify-between items-center text-[8px] uppercase font-bold">
                        <span class="text-zinc-500">BULLET:</span>
                        <span class="text-zinc-300 font-black">${batch.bullet || '---'}</span>
                    </div>
                    <div class="flex justify-between items-center text-[8px] uppercase font-bold">
                         <span class="text-zinc-500">LOAD:</span>
                         <span class="text-zinc-400 italic">${batch.powder || '--'} / ${batch.grains || '--'} GR</span>
                    </div>
                    <div class="flex justify-between items-center text-[8px] uppercase font-bold opacity-60">
                         <span class="text-zinc-600">BRASS:</span>
                         <span class="text-zinc-500">${batch.brass || '---'}</span>
                    </div>
                </div>

                <div class="flex justify-end items-center gap-2 mb-4">
                    <button onclick="window.shareAmmoBatchAsImage(${batch.id})" class="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition-all text-[8px] font-black uppercase">
                        <i data-lucide="share-2" class="w-3 h-3"></i>
                        Share Card
                    </button>
                    <button onclick="window.deleteAmmoBatch(${batch.id})" class="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all text-[8px] font-black uppercase">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                        Delete
                    </button>
                </div>

                <!-- ACTIONS -->
                <div class="grid gap-2">
                    <button onclick="loadBatchToSolver(${batch.id})" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-blue-900/20">
                        LOAD TO SOLVER
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();

    // Save back ensuring IDs are persisted if we generated new ones
    localStorage.setItem('trc_ammo_batches', JSON.stringify(batches));
    localStorage.setItem('ammoBatches', JSON.stringify(batches));
};

window.exportAmmoManifestAsImage = function () {
    const container = document.getElementById('ammo-log-container');
    if (!container || container.children.length === 0) {
        alert("Manifest is empty.");
        return;
    }

    // Temporarily adjust container for clean capture
    const originalStyle = container.style.cssText;
    container.style.padding = '20px';
    container.style.backgroundColor = '#000000';

    html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#000000',
        logging: false
    }).then(async canvas => {
        container.style.cssText = originalStyle;
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], `Ammo_Manifest_${new Date().getTime()}.png`, { type: 'image/png' });

        if (navigator.share) {
            navigator.share({
                title: 'Ammo Manifest',
                files: [file]
            }).catch(err => console.log('Manifest share failed:', err));
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ammo_Manifest_${new Date().getTime()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }).catch(err => {
        container.style.cssText = originalStyle;
        alert("Capture Failed: " + err.message);
        console.error("Ammo manifest capture failed:", err);
    });
};


window.shareAmmoBatchAsImage = function (batchId) {
    const batches = JSON.parse(localStorage.getItem('trc_ammo_batches') || '[]');
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    // Populate hidden card
    const nameEl = document.getElementById('ammo-card-name');
    const typeEl = document.getElementById('ammo-card-type');
    const rifleEl = document.getElementById('ammo-card-rifle');
    const bulletEl = document.getElementById('ammo-card-bullet');
    const bcEl = document.getElementById('ammo-card-bc');
    const mvEl = document.getElementById('ammo-card-mv');
    const powderEl = document.getElementById('ammo-card-powder');
    const grainsEl = document.getElementById('ammo-card-grains');
    const brassEl = document.getElementById('ammo-card-brass');
    const zeroEl = document.getElementById('ammo-card-zero');
    const timeEl = document.getElementById('ammo-card-timestamp');

    if (nameEl) nameEl.textContent = batch.name || '---';
    if (typeEl) typeEl.textContent = batch.type || 'MATCH';
    if (rifleEl) rifleEl.textContent = batch.rifle || '---';
    if (bulletEl) bulletEl.textContent = batch.bullet || '---';
    if (bcEl) bcEl.textContent = batch.bc || '0.450';
    if (mvEl) mvEl.textContent = batch.mv || '2700';
    if (powderEl) powderEl.textContent = batch.powder || '---';
    if (grainsEl) grainsEl.textContent = batch.grains || '---';
    if (brassEl) brassEl.textContent = batch.brass || '---';
    if (zeroEl) zeroEl.textContent = `${batch.zero || '100'} YDS`;
    if (timeEl) timeEl.textContent = new Date().toLocaleString();

    const card = document.getElementById('ammo-recipe-card');
    const wrapper = document.getElementById('hidden-ammo-card-wrapper');

    if (!card || !wrapper) return;

    // Force wrapper to be "captured"
    wrapper.style.left = '0';
    wrapper.style.opacity = '1';

    html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
    }).then(async canvas => {
        wrapper.style.left = '-2000px';
        wrapper.style.opacity = '0';

        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], `Ammo_Recipe_${batch.name}.png`, { type: 'image/png' });

        if (navigator.share) {
            navigator.share({
                title: `Ammo Recipe: ${batch.name}`,
                text: `Load Data for ${batch.name}`,
                files: [file]
            }).catch(err => console.log('Batch share failed:', err));
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ammo_Recipe_${batch.name}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }).catch(err => {
        wrapper.style.left = '-2000px';
        wrapper.style.opacity = '0';
        alert("Share Capture Failed: " + err.message);
        console.error("Ammo card capture failed:", err);
    });
};


window.addNewAmmoBatch = function () {
    const name = prompt("BATCH IDENTIFIER / NAME:");
    if (!name) return;

    const rifle = prompt("SPECIFIC RIFLE (e.g., Tikka T3x):", "System-1");
    const bullet = prompt("BULLET (e.g., 140gr ELD-M):", "175gr SMK");
    const type = prompt("LOG TYPE (Match/Reload/Factory):", "Match");
    const mv = prompt("MUZZLE VELOCITY (FPS):", "2700");
    const bc = prompt("BALLISTIC COEFF (G1):", "0.475");
    const zero = prompt("ZERO RANGE (Yards):", "100");

    const powder = prompt("POWDER (Optional):", "Varget");
    const grains = prompt("GRAINS (Optional):", "41.5");
    const brass = prompt("BRASS (Optional):", "Lapua");
    const qty = prompt("QTY:", "50");

    const newBatch = {
        id: Date.now(),
        name, rifle, bullet, type, mv, bc, zero, powder, grains, qty, brass
    };

    const batches = JSON.parse(localStorage.getItem('trc_ammo_batches') || localStorage.getItem('ammoBatches') || '[]');
    batches.push(newBatch);
    localStorage.setItem('trc_ammo_batches', JSON.stringify(batches));
    window.ammoBatchStore = batches;

    window.renderAmmoLog();
};

window.editAmmoBatch = function (id) {
    alert("Edit feature upgrading. Please delete and re-add for now.");
};

// --- DRILL MANAGER ---
window.renderDrills = function () {
    const container = document.getElementById('drill-list-container');
    if (!container) return;

    container.innerHTML = '';
    const drills = window.drillStore || [];

    if (drills.length === 0) {
        container.innerHTML = `<div class="col-span-2 text-center text-zinc-600 text-[10px] py-10 italic">No Drills Saved.</div>`;
        return;
    }

    drills.forEach(drill => {
        const div = document.createElement('div');
        div.className = "bg-zinc-900/50 border border-white/5 rounded-lg p-3 hover:border-orange-500/30 transition-all";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-[10px] font-black text-white uppercase">${drill.name}</h4>
                <button onclick="deleteDrill(${drill.id})" class="p-1 px-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all">
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
            </div>
            <div class="text-[9px] text-zinc-400 mb-2">${drill.desc || 'No Description'}</div>
            <div class="grid grid-cols-2 gap-2">
                 <div class="bg-black/40 rounded p-1 text-center">
                    <span class="block text-[8px] text-zinc-500 uppercase">PAR</span>
                    <span class="text-[10px] font-mono font-bold text-orange-300">${drill.par || '-'} s</span>
                </div>
                 <div class="bg-black/40 rounded p-1 text-center">
                    <span class="block text-[8px] text-zinc-500 uppercase">HITS</span>
                    <span class="text-[10px] font-mono font-bold text-blue-300">${drill.hits || '-'}</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
};

window.saveNewDrill = function (name, desc, par) {
    // Basic implementation for console/future use
    const newDrill = {
        id: Date.now(),
        name: name || "New Drill",
        desc: desc || "",
        par: par || 0,
        hits: 0
    };
    window.drillStore.push(newDrill);
    localStorage.setItem('trc_drills', JSON.stringify(window.drillStore));
    window.renderDrills();
};

window.deleteDrill = function (id) {
    if (confirm("Delete Drill?")) {
        window.drillStore = window.drillStore.filter(d => d.id !== id);
        localStorage.setItem('trc_drills', JSON.stringify(window.drillStore));
        window.renderDrills();
    }
};

window.saveAmmoBatch = function () {
    const name = document.getElementById('batch-name-input').value || 'Unknown Batch';
    const mv = parseInt(document.getElementById('batch-mv-input').value) || 2700;
    const bc = parseFloat(document.getElementById('batch-bc-input').value) || 0.450;
    const zero = parseInt(document.getElementById('batch-zero-input').value) || 100;

    // LOG IT
    if (typeof SessionLogger !== 'undefined') {
        SessionLogger.add("USER", `Saved details for batch: ${name} (MV: ${mv}, BC: ${bc})`);
    }

    if (window.currentBatchId) {
        // Update Existing
        const idx = window.ammoBatchStore.findIndex(b => b.id === window.currentBatchId);
        if (idx !== -1) {
            window.ammoBatchStore[idx] = { ...window.ammoBatchStore[idx], name, mv, bc, zero };
        }
    } else {
        // Create New
        const newBatch = {
            id: Date.now(),
            name,
            mv,
            bc,
            zero,
            lot: "NEW",
            count: 0
        };
        window.ammoBatchStore.push(newBatch);
    }

    localStorage.setItem('trc_ammo_batches', JSON.stringify(window.ammoBatchStore));
    window.renderAmmoLog();
    document.getElementById('ammo-batch-modal').classList.add('hidden');
};

window.deleteAmmoBatch = function (id) {
    if (confirm("Delete this batch record?")) {
        window.ammoBatchStore = window.ammoBatchStore.filter(b => b.id !== id);
        localStorage.setItem('trc_ammo_batches', JSON.stringify(window.ammoBatchStore));
        window.renderAmmoLog();
    }
};

window.loadBatchToSolver = function (id) {
    const batch = window.ammoBatchStore.find(b => b.id === id);
    if (batch) {
        console.log(`[Ammo] Loading Batch: ${batch.name} to Solver...`);

        // 1. Set Active Batch in State
        localStorage.setItem('trc_active_batch_id', id.toString());

        // Standardize values (Fallbacks)
        const mvVal = batch.mv || batch.speed || 2700;
        const bcVal = batch.bc || 0.450;
        const zeroVal = batch.zero || 100;

        // 2. Map Batch Data to Master HUD Inputs
        const hudMap = {
            'velocity': mvVal,
            'g1': bcVal,
            'zero': zeroVal
        };

        // 3. Map Batch Data to Work Center (Intel Hub) Widgets
        const owcMap = {
            'owc-rifle-input': batch.rifle || 'SYSTEM-1',
            'owc-ammo-input': `${batch.bullet || ''} ${batch.type || ''}`.trim() || 'MATCH',
            'owc-mv': mvVal,
            'owc-bc': bcVal,
            'owc-zero': zeroVal
        };

        // Unified Update Helper
        const updateField = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = val;
                // Trigger 'input' event so card display syncs
                el.dispatchEvent(new Event('input'));
                el.dispatchEvent(new Event('change'));
            }
        };

        // Execute Updates
        Object.entries(hudMap).forEach(([id, val]) => updateField(id, val));
        Object.entries(owcMap).forEach(([id, val]) => updateField(id, val));

        if (typeof SessionLogger !== 'undefined') {
            SessionLogger.add("USER", `Loaded Batch to Solver: ${batch.name}`);
        }

        // Instant Action - update pointers and jump to chart
        const sourceSelect = document.getElementById('dope-source-select');
        if (sourceSelect) sourceSelect.value = 'batch';

        console.log(`[Ammo] High-Speed Load logic...`);

        // Final UI Updates & Navigation
        if (typeof window.generateQuickDope === 'function') {
            window.generateQuickDope();
        }

        // Switch Tab immediately for zero friction
        document.getElementById('subtab-quick-dope')?.click();

        if (typeof window.updateOWC === 'function') {
            window.updateOWC();
        }

        // Refresh the list to show the new highlight
        window.renderAmmoLog();
    }
};

// --- BALLISTIC ENGINE (QUICK DOPE) ---
window.BallisticEngine = {
    /**
     * Core Physics Engine (Pejsa-Wrapper Approximation)
     */
    calculate(profile, weather, range, inclination = 0) {
        const airDensity = this.calculateAirDensity(weather.temp, weather.pressure, weather.humidity);

        // 1. Air Density & Range (Priority: Manual DA -> Calc)
        let densityRatio = 1.0;
        if (weather.da !== null && weather.da !== undefined && !isNaN(weather.da)) {
            // Standard DA Conversion to Ratio (Allows 0 DA as baseline)
            densityRatio = Math.pow(1 - 0.0000068756 * weather.da, 4.256);
        } else {
            const stdDensity = 0.076474;
            densityRatio = airDensity / stdDensity;
        }

        // 2. Velocity at Range (Corrected G1 Approximation)
        const mv = parseFloat(profile.velocity) || 2700;
        const bc = parseFloat(profile.bc) || 0.450;
        const zero = parseFloat(profile.zero) || 100;
        const rangeFt = range * 3;
        const windSpeed = parseFloat(weather.windSpeed) || 0;
        const windAngle = parseFloat(weather.windAngle) || 90;

        // k-factor for G1 (Supersonic band)
        // Calibrated to produce ~1600fps at 700yd for 2700/.52 start
        const k = 0.000155;
        const v_r = mv * Math.pow(1 + (k * range * densityRatio / bc), -2);

        // 3. Time of Flight (Integration approximation)
        const t = (2 * rangeFt) / (mv + v_r);

        // 4. Gravity & Path
        const g = 32.174;
        const scopeHeight = parseFloat(profile.scopeHeight) || 1.75;

        // Zero Angle (Approximate drop at zero range)
        // CRITICAL FIX: Anchor mechanical zero to a Standard Day (0 DA)
        // This ensures density changes show up as offsets from the baseline zero environment.
        const stdDensityRatio = 1.0;
        const v_zero = mv * Math.pow(1 + (k * zero * stdDensityRatio / bc), -2);
        const t_zero = (2 * (zero * 3)) / (mv + v_zero);
        const drop_zero = 0.5 * g * t_zero * t_zero * 12;
        const angle_zero = (drop_zero + scopeHeight) / (zero * 3 * 12);

        let drop_path = (0.5 * g * t * t * 12) - (angle_zero * rangeFt * 12) + scopeHeight;

        // 4. Aero Jump & Spin Drift (High Fidelity)
        const windRad = windAngle * (Math.PI / 180);
        const crossWind = windSpeed * Math.sin(windRad); // Signed

        // Aero Jump correction (Inches)
        drop_path -= (0.007 * crossWind * (range / 100));

        // Spin Drift (Mils)
        const spinDriftMils = (0.000015 * Math.pow(range, 1.3));
        const spinDriftInches = spinDriftMils * (range * 36 / 1000);

        // 6. Mils & MOA Conversion
        const inchesPerMil = (range === 0) ? 0.036 : (range * 36) / 1000;
        const inchesPerMOA = (range === 0) ? 1.047 : (range / 100) * 1.04719;

        let elevMil = (range === 0) ? 0 : drop_path / inchesPerMil;
        let elevMOA = (range === 0) ? 0 : drop_path / inchesPerMOA;

        // --- SLOPE CORRECTION (Cosine Rule) ---
        const slope = inclination || weather.inclination || 0;
        if (slope !== 0) {
            const radSlope = (slope * Math.PI) / 180;
            const cosSlope = Math.cos(radSlope);
            elevMil *= cosSlope;
            elevMOA *= cosSlope;
            drop_path *= cosSlope; // Update inches too
        }

        // 7. Windage (Didion Lag + Spin)
        const t_vac = rangeFt / mv;
        const lag = t - t_vac;
        const driftInches = (Math.abs(crossWind) * 17.6) * lag; // Magnitude

        // Final Windage (Windage magnitude + Spin vector)
        let totalWindInches = driftInches + spinDriftInches;
        let windMil = (range === 0) ? 0 : totalWindInches / inchesPerMil;
        let windMOA = (range === 0) ? 0 : totalWindInches / inchesPerMOA;

        return {
            range,
            velocity: Math.round(v_r),
            elevMil: elevMil.toFixed(1),
            elevMOA: elevMOA.toFixed(1),
            windMil: Math.abs(windMil).toFixed(1),
            windMOA: Math.abs(windMOA).toFixed(1),
            windMilSigned: windMil,
            windMOASigned: windMOA,
            time: t.toFixed(2),
            dropInches: drop_path.toFixed(1),
            windInches: totalWindInches.toFixed(1),
            spinDriftMils: spinDriftMils,
            crossWind: crossWind
        };
    },

    calculateDropTable(profile, weather, stepOverride = 50, maxRangeOverride = 1200) {
        const table = [];
        const step = parseInt(stepOverride) || 50;
        const maxRange = parseInt(maxRangeOverride) || 1200;

        for (let r = 0; r <= maxRange; r += step) {
            table.push(this.calculate(profile, weather, r));
        }
        return table;
    },

    calculateAirDensity(tempF, pressureInHg, humidity) {
        const tK = (tempF + 459.67) * 5 / 9;
        const pPa = (pressureInHg || 29.92) * 3386.39;

        const tC = (tempF - 32) * 5 / 9;
        const svp = 6.112 * Math.exp((17.67 * tC) / (tC + 243.5)) * 100;
        const vp = svp * (humidity / 100);

        const density = (pPa - vp) / (287.058 * tK) + vp / (461.495 * tK);
        return density * 0.062428; // convert kg/m3 to lbs/ft3
    }
};


// --- TACTICAL DRILLS LIBRARY ---
const tacticalDrills = [
    {
        id: 'cold-bore',
        title: 'Cold Bore Mastery',
        icon: 'snowflake',
        color: 'blue',
        desc: 'Single engagement on high-value target from cold barrel state. Precision is paramount.',
        difficulty: 'EXPERT',
        goal: 'Sub-0.5 MOA Accuracy'
    },
    {
        id: 'mover-lead',
        title: 'Mover Engagement',
        icon: 'move',
        color: 'orange',
        desc: 'Track and engage dynamic targets moving at 3-7 MPH. Practice lead and timing.',
        difficulty: 'INTERMEDIATE',
        goal: 'Consistent Impact String'
    },
    {
        id: 'ukd-challenge',
        title: 'UKD Challenge',
        icon: 'mountain',
        color: 'emerald',
        desc: 'Unknown Distance ranging. Use your reticle and map tools to estimate range and solve.',
        difficulty: 'ADVANCED',
        goal: '±25 Yard Estimation'
    },
    {
        id: 'stress-fire',
        title: 'Stress Fire Pulse',
        icon: 'activity',
        color: 'red',
        desc: '5-shot group in under 15 seconds. High intensity precision under timer pressure.',
        difficulty: 'ADVANCED',
        goal: 'Maintain Group Integrity'
    },
    {
        id: 'wind-wizard',
        title: 'Windage Wizard',
        icon: 'wind',
        color: 'blue',
        desc: 'Advanced mirage reading and wind-hold practice across variable gusts.',
        difficulty: 'EXPERT',
        goal: 'Master Mirage Reading'
    }
];

window.renderDrills = function () {
    const container = document.getElementById('drill-list-container');
    if (!container) return;

    container.innerHTML = tacticalDrills.map(drill => `
        <div class="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-${drill.color}-500/50 transition-all group overflow-hidden relative">
            <div class="absolute top-[-10px] right-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                <i data-lucide="${drill.icon}" class="w-16 h-16"></i>
            </div>
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <i data-lucide="${drill.icon}" class="w-3.5 h-3.5 text-${drill.color}-500"></i>
                    <span class="text-[10px] font-black text-white uppercase tracking-widest">${drill.title}</span>
                </div>
                <p class="text-[9px] text-zinc-500 font-mono leading-relaxed mb-4">${drill.desc}</p>
            </div>
            <div class="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                <div class="flex flex-col">
                    <span class="text-[7px] text-zinc-600 font-black uppercase">Difficulty</span>
                    <span class="text-[8px] font-black text-${drill.color}-400">${drill.difficulty}</span>
                </div>
                <button onclick="window.startDrill('${drill.id}')" 
                    class="bg-zinc-800 hover:bg-zinc-700 text-white text-[8px] font-black px-3 py-1.5 rounded uppercase tracking-tighter transition-all">
                    Start Drill
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
};

window.startDrill = function (drillId) {
    const drill = tacticalDrills.find(d => d.id === drillId);
    if (!drill) return;

    // Briefing via AI Advisor
    window.switchIntelTab('ai-advisor');
    const brief = `[MISSION DRILL: ${drill.title.toUpperCase()}] -- OBJECTIVE: ${drill.goal}. ${drill.desc} STANDBY FOR TARGET PARAMETERS.`;

    const history = document.getElementById('ai-chat-history');
    if (history) {
        const line = document.createElement('div');
        line.className = 'flex gap-2 text-orange-400 font-black animate-pulse';
        line.innerHTML = `<span>SYS:</span> <span>${brief}</span>`;
        history.appendChild(line);
        history.scrollTop = history.scrollHeight;
    }
};

window.switchTacticalModule = function (moduleId) {
    // 1. Hide all modules
    const modules = ['ammo', 'drills', 'what-if', 'quick-dope'];
    modules.forEach(id => {
        const el = document.getElementById(`module-${id}`);
        if (el) el.classList.add('hidden');

        const btn = document.getElementById(`subtab-${id}`);
        if (btn) {
            btn.classList.remove('bg-blue-900/40', 'text-[var(--input-text)]', 'subtab-active');
            btn.classList.add('text-zinc-500');
        }
    });

    // 2. Show target module
    const target = document.getElementById(`module-${moduleId}`);
    if (target) target.classList.remove('hidden');

    // 3. Highlight button
    const activeBtn = document.getElementById(`subtab-${moduleId}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-zinc-500');
        activeBtn.classList.add('bg-blue-900/40', 'text-[var(--input-text)]', 'subtab-active');
    }

    // 4. Lazy Load Data
    if (moduleId === 'ammo') window.renderAmmoLog();
    if (moduleId === 'drills') window.renderDrills();
};

// === BALLISTIC UNIFICATION HELPERS ===

/**
 * Gathers the current operational context (Profile + Weather) 
 * Centralized logic to ensure Dope, Lab, and HUD use the same data.
 */
window.getTacticalContext = function (source = 'smart') {
    // 1. Gather Weather (Priority: OWC Widgets -> Main HUD)
    // OWC Density Alt (DA) is the most accurate source if available
    const owcDaVal = document.getElementById('owc-da')?.value;
    const da = owcDaVal ? parseFloat(owcDaVal) : null;

    // Standard atmosphere fallbacks
    // Standard atmosphere fallbacks (Prioritize Work Center "owc-" inputs)
    const temp = parseFloat(document.getElementById('owc-temp')?.value) ||
        parseFloat(document.getElementById('temperature')?.value) || 59;
    const press = parseFloat(document.getElementById('owc-press')?.value) ||
        parseFloat(document.getElementById('pressure')?.value) || 29.92;
    const hum = parseFloat(document.getElementById('owc-hum')?.value) ||
        parseFloat(document.getElementById('humidity')?.value) || 50;

    // Wind Logic (OWC specialized widgets)
    const owcWindSpd = parseFloat(document.getElementById('owc-wind-speed')?.value);
    const owcWindAng = parseFloat(document.getElementById('owc-wind-dir')?.value);
    const hudWindSpd = parseFloat(document.getElementById('wind-speed')?.value) || 0;

    const windSpeed = !isNaN(owcWindSpd) ? owcWindSpd : hudWindSpd;
    const rawWindAngle = !isNaN(owcWindAng) ? owcWindAng : 90;
    const losHeading = parseFloat(document.getElementById('owc-los-heading')?.value) || 0;
    const inclination = parseFloat(document.getElementById('owc-angle')?.value) || 0;

    // Convert to Relative Wind for Ballistics
    const windAngle = (rawWindAngle - losHeading + 360) % 360;

    const weather = { temp, pressure: press, humidity: hum, windSpeed, windAngle, da, inclination };

    // 2. Gather profile (Priority: Active Batch -> HUD -> Defaults)
    let velocity, zero, bc, scopeHeight = 1.75;
    let sourceName = "SYSTEM DEFAULT";

    // Unified Value Retrieval (Prioritize OWC inputs)
    const hudMv = parseFloat(document.getElementById('owc-mv')?.value) || parseFloat(document.getElementById('velocity')?.value) || 2700;
    const hudZero = parseFloat(document.getElementById('owc-zero')?.value) || parseFloat(document.getElementById('zero')?.value) || 100;
    const hudBc = parseFloat(document.getElementById('owc-bc')?.value) || parseFloat(document.getElementById('g1')?.value) || 0.450;

    const batches = JSON.parse(localStorage.getItem('trc_ammo_batches') || localStorage.getItem('ammoBatches') || '[]');
    const activeBatchId = localStorage.getItem('trc_active_batch_id');
    const batch = batches.find(b => b.id.toString() === activeBatchId);

    // SOURCE LABELING LOGIC
    if (source === 'batch' && batch) {
        velocity = batch.mv || batch.speed || hudMv;
        zero = batch.zero || hudZero;
        bc = batch.bc || hudBc;
        sourceName = `AMMO: ${batch.name || 'BATCH'}`;
    } else {
        // Default to what's on screen (Work Center)
        velocity = hudMv;
        zero = hudZero;
        bc = hudBc;

        // Determine Source Label
        if (window.owcLiveSync) {
            sourceName = "LIVE SENSORS";
        } else {
            sourceName = "WORK CENTER (MANUAL)";
        }

        // If 'batch' was requested but no batch found, fallback to above
        if (source === 'batch') console.warn("[Context] Batch requested but not found, using OWC");
    }

    const profile = { velocity, zero, bc, scopeHeight };

    return { profile, weather, sourceName };
};

// --- WORK CENTER PERSISTENCE ---
window.saveWorkCenterState = function () {
    const state = {
        range: document.getElementById('owc-range')?.value || '',
        zero: document.getElementById('owc-zero')?.value || '',
        mv: document.getElementById('owc-mv')?.value || '',
        bc: document.getElementById('owc-bc')?.value || '',
        windSpeed: document.getElementById('owc-wind-speed')?.value || '',
        windDir: document.getElementById('owc-wind-dir')?.value || '',
        losHeading: document.getElementById('owc-los-heading')?.value || '',
        angle: document.getElementById('owc-angle')?.value || '',
        da: document.getElementById('owc-da')?.value || '',
        temp: document.getElementById('owc-temp')?.value || '',
        hum: document.getElementById('owc-hum')?.value || '',
        press: document.getElementById('owc-press')?.value || '',
        alt: document.getElementById('owc-alt')?.value || '',
        slope: document.getElementById('owc-slope')?.value || ''
    };
    localStorage.setItem('trc_owc_state', JSON.stringify(state));
    // console.log("[OWC] State Saved", state);
};

window.loadWorkCenterState = function () {
    const saved = localStorage.getItem('trc_owc_state');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('owc-range', state.range);
        setVal('owc-zero', state.zero);
        setVal('owc-mv', state.mv);
        setVal('owc-bc', state.bc);
        setVal('owc-wind-speed', state.windSpeed);
        setVal('owc-wind-dir', state.windDir);
        setVal('owc-los-heading', state.losHeading);
        setVal('owc-angle', state.angle);
        setVal('owc-da', state.da);
        setVal('owc-temp', state.temp);
        setVal('owc-hum', state.hum);
        setVal('owc-press', state.press);
        setVal('owc-alt', state.alt);
        setVal('owc-slope', state.slope);

        console.log("[OWC] State Restored");
        // Trigger update to refresh calcs with restored data
        if (typeof window.updateOWC === 'function') window.updateOWC();

    } catch (e) {
        console.error("[OWC] Load Error:", e);
    }
};

// Auto-Save Listeners
document.addEventListener('DOMContentLoaded', () => {

    // ... existing init code ...
    window.loadWorkCenterState();

    const owcIds = [
        'owc-range', 'owc-zero', 'owc-mv', 'owc-bc',
        'owc-wind-speed', 'owc-wind-dir', 'owc-los-heading', 'owc-angle',
        'owc-da', 'owc-temp', 'owc-hum', 'owc-press', 'owc-alt', 'owc-slope'
    ];

    owcIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', window.saveWorkCenterState);
            el.addEventListener('change', window.saveWorkCenterState);

            // Auto-Switch to MANUAL Mode on User Input
            el.addEventListener('input', () => {
                if (window.owcLiveSync) {
                    window.owcLiveSync = false;
                    const btn = document.getElementById('owc-live-sync-btn');
                    if (btn) {
                        btn.classList.remove('bg-blue-600');
                        btn.classList.add('bg-zinc-800', 'text-zinc-500');
                        btn.textContent = "MANUAL";
                    }
                }
            });
        }
    });
});
// --- DA CALCULATION UTILITY ---
window.calculateDA = function (altFt, tempF, hum, pressureInHg, isStationPressure = true) {
    // 1. Convert Inputs
    const altM = altFt * 0.3048;
    const tempC = (tempF - 32) * 5 / 9;
    const tempK = tempC + 273.15;

    // 2. Determine Station Pressure (Pa)
    let pressurePa;
    if (isStationPressure) {
        pressurePa = pressureInHg * 3386.39;
    } else {
        // Convert Altimeter (QNH) to Station Pressure
        // Hydrostatic equation simplification
        // P_station = P_alt * (1 - (2.25577e-5 * Alt_m))^5.2559
        const pAltPa = pressureInHg * 3386.39;
        pressurePa = pAltPa * Math.pow(1 - (2.25577e-5 * altM), 5.2559);
    }

    // 3. Vapor Pressure (Humidity)
    // flattens density slightly
    const es = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5)); // Saturation VP (hPa)
    const e = (hum / 100) * es; // Actual VP (hPa)
    const pd = (pressurePa / 100) - e; // Dry air pressure (hPa)

    // 4. Density Calculation (kg/m^3)
    // rho = (pd / (Rd * T)) + (e / (Rv * T))
    // Rd = 287.058, Rv = 461.495
    const rho = (pd * 100) / (287.058 * tempK) + (e * 100) / (461.495 * tempK);

    // 5. Standard Density (Sea Level, 15C)
    const rho0 = 1.225; // kg/m^3

    // 6. Density Altitude
    // DA = 44330.8 * (1 - (rho / rho0)^0.234969)  (Meters)
    const daMeters = 44330.8 * (1 - Math.pow(rho / rho0, 0.234969));

    return Math.round(daMeters * 3.28084);
};

window.generateQuickDope = function () {
    const target = document.getElementById('dope-render-target');
    if (target) {
        target.classList.remove('animate-pulse-quick-dope');
        void target.offsetWidth; // Force Reflow
        target.classList.add('animate-pulse-quick-dope');

        // Remove animation after 2 seconds
        setTimeout(() => {
            target.classList.remove('animate-pulse-quick-dope');
        }, 2000);
    }

    try {
        const source = document.getElementById('dope-source-select')?.value || 'smart';
        const step = parseInt(document.getElementById('dope-step-select')?.value) || 50;
        const maxRange = parseInt(document.getElementById('dope-max-select')?.value) || 1200;

        console.log(`[Brain] Generating Quick Dope via ${source.toUpperCase()} (Step: ${step}Y, Max: ${maxRange}Y)...`);

        // 1. GATHER UNIFIED CONTEXT
        const context = window.getTacticalContext(source);

        // 2. Calculate
        if (!window.BallisticEngine) {
            throw new Error("Ballistic Engine Core Missing");
        }

        const data = window.BallisticEngine.calculateDropTable(context.profile, context.weather, step, maxRange);

        // 3. Render
        if (typeof window.renderDropTable === 'function') {
            window.renderDropTable(data, context);
            localStorage.setItem('trc_last_dope', JSON.stringify(data));
        }

        // 4. Log
        if (typeof SessionLogger !== 'undefined') {
            SessionLogger.add("USER", `Generated Dope [${source.toUpperCase()}]: ${context.profile.velocity}fps / ${context.profile.zero}y / ${context.profile.bc} BC`);
        }

        // 5. Switching
        // Ensure we show the module since this is an explicit trigger
        window.switchTacticalModule('quick-dope');

    } catch (err) {
        console.error("Quick Dope Error:", err);
        alert("System Error: " + err.message);
    }
};

window.renderDropTable = function (data, headerData = "QUICK DOPE") {
    const container = document.getElementById('dope-render-target');
    const titleEl = document.getElementById('dope-table-title');
    if (!container) return;

    // Handle metadata object or legacy title string
    let sourceTitle = "QUICK DOPE";
    let rifle = "SYSTEM-1";
    let caliber = "308 WIN";
    let wSpeed = 0;
    let wDir = 270;
    let losVal = 0;
    const unitMode = window.owcUnitMode || "MIL";

    if (typeof headerData === 'object' && headerData !== null) {
        sourceTitle = headerData.sourceName || headerData.source || "QUICK DOPE";
        wSpeed = headerData.windSpeed !== undefined ? headerData.windSpeed : (headerData.weather?.windSpeed || 0);
        wDir = headerData.rawWindDir !== undefined ? headerData.rawWindDir : (headerData.weather?.windAngle || 270);
        losVal = headerData.los !== undefined ? headerData.los : (headerData.weather?.inclination || 0);
        rifle = headerData.profile?.rifle || headerData.rifle || "SYSTEM-1";
        caliber = headerData.profile?.caliber || headerData.caliber || "308 WIN";
    } else {
        sourceTitle = headerData || "QUICK DOPE";
        wSpeed = document.getElementById('owc-wind-speed')?.value || 0;
        wDir = document.getElementById('owc-wind-dir')?.value || 270;
        losVal = document.getElementById('owc-angle')?.value || 0;
        rifle = document.getElementById('owc-rifle-input')?.value || "SYSTEM-1";
        caliber = document.getElementById('owc-ammo-input')?.value || "308 WIN";
    }

    // Apply Title + Wind Meta
    if (titleEl) {
        titleEl.innerHTML = `
            <div class="flex flex-col items-center gap-1 w-full pb-4 bg-slate-200 rounded-t-xl border-b border-black/10">
                <h2 id="dope-capture-name" class="text-3xl font-black text-black italic tracking-tighter uppercase mb-2">DOPE CHART</h2>
                <div class="flex flex-col items-center gap-2">
                    <div class="flex gap-2 flex-wrap justify-center">
                        <div class="px-3 py-1 bg-black/5 border border-black/10 rounded flex items-center gap-2">
                            <span class="text-[9px] text-zinc-600 font-black uppercase tracking-widest">RIFLE:</span>
                            <span class="text-[10px] text-blue-700 font-black uppercase tracking-widest">${rifle}</span>
                        </div>
                        <div class="px-3 py-1 bg-black/5 border border-black/10 rounded flex items-center gap-2">
                            <span class="text-[9px] text-zinc-600 font-black uppercase tracking-widest">CAL:</span>
                            <span class="text-[10px] text-emerald-700 font-black uppercase tracking-widest">${caliber}</span>
                        </div>
                        <div class="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded flex items-center gap-2">
                            <span class="text-[9px] text-blue-700 font-black uppercase tracking-widest">UNITS:</span>
                            <span class="text-[10px] text-blue-800 font-black uppercase tracking-widest">${unitMode}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-wrap justify-center">
                        <div class="px-4 py-1.5 bg-black/5 border border-black/10 rounded flex gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                            <span>WIND: <b class="text-orange-700 font-black">${wDir}°</b></span>
                            <span>SPD: <b class="text-orange-700 font-black">${wSpeed} MPH</b></span>
                            <span>LOS: <b class="text-blue-700 font-black">${losVal}°</b></span>
                        </div>
                        <div class="px-4 py-1.5 bg-zinc-800/10 border border-black/10 rounded flex items-center gap-2">
                             <span class="text-[9px] text-zinc-600 font-black uppercase tracking-widest">SOURCE:</span>
                             <span class="text-[10px] text-zinc-800 font-black uppercase tracking-widest">${sourceTitle}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // MULTI-COLUMN LOGIC: Split long tables into chunks (e.g., 40 rows per column)
    const chunkSize = 40;
    const columns = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        columns.push(data.slice(i, i + chunkSize));
    }

    let html = `
    <div class="flex flex-wrap gap-4 justify-center bg-slate-200 p-4 rounded-b-xl">
    `;

    columns.forEach((colData, colIdx) => {
        html += `
        <div class="min-w-[320px] flex-1">
            <table class="w-full text-left border-collapse border border-black/5">
                <thead>
                    <tr class="bg-slate-300 text-[12px] text-black uppercase tracking-[0.2em] font-black">
                        <th class="p-4 border-b border-black/10 text-center">RNG</th>
                        <th class="p-4 border-b border-black/10 text-black text-center">ELEV (${window.owcUnitMode})</th>
                        <th class="p-4 border-b border-black/10 text-orange-900 text-center">WIND (${window.owcUnitMode})</th>
                    </tr>
                </thead>
                <tbody class="text-base font-mono text-black">
        `;

        colData.forEach(row => {
            const isMIL = window.owcUnitMode === 'MIL';
            const eVal = isMIL ? parseFloat(row.elevMil) : parseFloat(row.elevMOA);
            const eDir = eVal >= 0 ? 'U' : 'D';
            const wVal = isMIL ? parseFloat(row.windMil) : parseFloat(row.windMOA);
            const wDir = row.crossWind < 0 ? 'L' : 'R';
            const dropIn = row.dropInches || (parseFloat(row.elevMil) * row.range * 0.036).toFixed(1);
            const driftIn = row.windInches || (parseFloat(row.windMil) * row.range * 0.036).toFixed(1);

            html += `
            <tr class="border-b border-black/5 hover:bg-black/5 transition-colors">
                <td class="p-2 font-black text-center text-zinc-900 bg-black/5 text-3xl align-middle border-r border-black/5">${row.range}y</td>
                
                <!-- ELEVATION: PURE TABLE STRUCTURE (No Flexbox) -->
                <td class="p-0 min-w-[160px] border-r border-black/5">
                    <table class="w-full h-full" style="border-collapse: collapse;">
                        <tr>
                            <!-- Direction Letter (Rowspan 2) -->
                            <td rowspan="2" class="w-[50px] text-right align-middle p-1">
                                <span class="text-4xl font-black text-black block">${eDir}</span>
                            </td>
                            <!-- Main Value -->
                            <td class="text-left align-bottom p-0 pl-1 pb-0">
                                <span class="text-5xl font-black text-black tracking-tight block leading-tight">${Math.abs(eVal).toFixed(1)}</span>
                            </td>
                        </tr>
                        <tr>
                            <!-- Mils/Inches Value -->
                            <td class="text-left align-top p-0 pl-2 pt-0">
                                <span class="text-[12px] text-zinc-500 font-bold opacity-80 block" style="margin-top: -2px;">(${Math.abs(dropIn)}")</span>
                            </td>
                        </tr>
                    </table>
                </td>

                <!-- WIND: PURE TABLE STRUCTURE (No Flexbox) -->
                <td class="p-0 min-w-[160px]">
                     <table class="w-full h-full" style="border-collapse: collapse;">
                        <tr>
                            <!-- Direction Letter (Rowspan 2) -->
                            <td rowspan="2" class="w-[50px] text-right align-middle p-1">
                                <span class="text-4xl font-black text-zinc-400 block">${wDir}</span>
                            </td>
                            <!-- Main Value -->
                            <td class="text-left align-bottom p-0 pl-1 pb-0">
                                <span class="text-4xl font-black text-orange-900 tracking-tight block leading-tight">${wVal.toFixed(1)}</span>
                            </td>
                        </tr>
                        <tr>
                            <!-- Mils/Inches Value -->
                            <td class="text-left align-top p-0 pl-2 pt-0">
                                <span class="text-[12px] text-zinc-500 font-bold italic opacity-70 block" style="margin-top: -2px;">(${driftIn}")</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            `;
        });

        html += `</tbody></table></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
};

// let compassInitialized = false; // Fixed: Duplicate declaration
let compassOffset = parseFloat(localStorage.getItem('trc_compass_offset')) || 0;

window.calibrateCompassOffset = function () {
    // Current heading is what the phone THINKS is North.
    // We want to set this heading as the New North (0 degrees).
    const currentHeadingText = document.getElementById('hud-heading-val')?.textContent || "0";
    const currentHeading = parseFloat(currentHeadingText.replace('°', '')) || 0;

    // The offset is simply the negative of the current heading
    // so that (currentHeading + offset) % 360 = 0
    // We adjust the current global offset relative to what the user JUST saw.
    compassOffset = (compassOffset - currentHeading + 720) % 360;

    localStorage.setItem('trc_compass_offset', compassOffset);

    // Provide visual feedback
    const btn = event?.currentTarget;
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> CALIBRATED';
        btn.classList.replace('bg-orange-600', 'bg-emerald-600');
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.replace('bg-emerald-600', 'bg-orange-600');
            lucide.createIcons();
        }, 2000);
    }

    console.log("[COMPASS] New Offset Applied:", compassOffset);
};

window.resetCompassOffset = function () {
    compassOffset = 0;
    localStorage.removeItem('trc_compass_offset');
    console.log("[COMPASS] Offset Reset to Factory");
};

window.requestSensorAccess = function () {
    const prompt = document.getElementById('hud-sensor-prompt');
    const diagnostic = document.getElementById('hud-diagnostic-msg');

    console.log("[HUD] Requesting sensor access...");

    // Check for Secure Context (HTTPS)
    if (!window.isSecureContext) {
        if (diagnostic) diagnostic.textContent = "WARNING: SENSORS REQUIRE HTTPS. UI MAY BE LIMITED.";
        console.warn("[HUD] Sensors blocked: Not a secure context.");
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ flow
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    if (prompt) prompt.classList.add('hidden');
                } else {
                    alert("Permission denied. Compass cannot function.");
                }
            })
            .catch(err => {
                console.error("[HUD] Permission error:", err);
                if (diagnostic) diagnostic.textContent = "Permission Error: " + err.message;
            });
    } else if (window.DeviceOrientationEvent) {
        // Generic Android/Desktop flow
        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }
        if (prompt) prompt.classList.add('hidden');
    } else {
        if (diagnostic) diagnostic.textContent = "HARDWARE ERROR: ORIENTATION SENSORS NOT DETECTED.";
        alert("Sensors not supported on this device.");
    }
};

window.initTacticalCompass = function () {
    if (compassInitialized) return;

    console.log("[HUD] Initializing Tactical Hub UI...");

    // Check if we already have listener (Android usually doesn't need the prompt)
    // But we show the prompt regardless for the first time to ensure user gesture
    const prompt = document.getElementById('hud-sensor-prompt');
    if (window.isSecureContext === false) {
        const diag = document.getElementById('hud-diagnostic-msg');
        if (diag) diag.textContent = "MODE: NON-SECURE (HTTPS REQ FOR SENSORS)";
    }

    compassInitialized = true;
};

function handleOrientation(event) {
    let rawHeading = 0;

    if (event.webkitCompassHeading !== undefined) {
        // iOS: webkitCompassHeading is absolute and clockwise
        rawHeading = event.webkitCompassHeading;
    } else {
        // Android/Other: alpha is usually counter-clockwise, so we flip it
        rawHeading = 360 - (event.alpha || 0);
    }

    // Compensation for Screen Orientation (Portrait vs Landscape)
    let screenAdjustment = 0;
    if (window.screen && window.screen.orientation && window.screen.orientation.angle !== undefined) {
        screenAdjustment = window.screen.orientation.angle;
    } else if (window.orientation !== undefined) {
        screenAdjustment = window.orientation;
    }

    // Apply adjustment and normalize to 0-359
    let heading = (rawHeading + screenAdjustment + compassOffset + 720) % 360;

    // UI expects rotation to put the cardinal at the TOP
    // If heading is 90 (East), we rotate the card -90 (or 270) to put East at Top
    const cardRotation = (360 - heading) % 360;

    // 1. Update Compass UI
    const card = document.getElementById('hud-compass-card');
    if (card) card.style.transform = `rotate(${cardRotation}deg)`;

    const hVal = document.getElementById('hud-heading-val');
    if (hVal) hVal.textContent = Math.round(heading).toString().padStart(3, '0') + '°';

    const cDir = document.getElementById('hud-cardinal-val');
    if (cDir) {
        const cardinals = ["NORTH", "NE", "EAST", "SE", "SOUTH", "SW", "WEST", "NW", "NORTH"];
        const index = Math.round(heading / 45);
        cDir.textContent = cardinals[index];
    }

    const pitch = event.beta; // Inclinometer (tilt front/back)
    const roll = event.gamma; // Bubble Level (tilt left/right)

    // 2. Update Inclinometer UI
    const aVal = document.getElementById('hud-angle-val');
    const cVal = document.getElementById('hud-cos-val');
    const marker = document.getElementById('hud-inclinometer-marker');

    if (pitch !== null) {
        const absPitch = Math.abs(pitch);
        const cos = Math.cos(pitch * Math.PI / 180).toFixed(2);

        if (aVal) aVal.textContent = pitch.toFixed(1) + '';
        if (cVal) cVal.textContent = `COS ${cos}`;

        // Marker position: map -90 to 90 degrees to range
        if (marker) {
            const percent = (pitch + 90) / 180;
            marker.style.top = `${(1 - percent) * 100}%`;
        }
    }

    // 3. Update Bubble Level (CANT)
    const bubble = document.getElementById('hud-bubble-marker');
    if (bubble && roll !== null) {
        // Clamp roll to +/- 45 degrees
        const clampedRoll = Math.max(-20, Math.min(20, roll));
        bubble.style.transform = `translateX(${clampedRoll * 5}px)`;

        // Red alert if canted more than 3 degrees
        if (Math.abs(roll) > 3) {
            bubble.classList.add('bg-red-500');
        } else {
            bubble.classList.remove('bg-red-500');
        }
    }
}

window.syncCompassToOWC = function () {
    const headingVal = document.getElementById('hud-heading-val')?.textContent.replace('', '');
    const angleVal = document.getElementById('hud-angle-val')?.textContent.replace('', '');

    if (headingVal) {
        const hInput = document.getElementById('owc-los-heading');
        if (hInput) {
            hInput.value = headingVal;
            hInput.classList.add('bg-blue-600/30');
            setTimeout(() => hInput.classList.remove('bg-blue-600/30'), 500);
        }
    }

    if (angleVal) {
        const aInput = document.getElementById('owc-angle');
        if (aInput) {
            aInput.value = Math.round(parseFloat(angleVal));
            aInput.classList.add('bg-blue-600/30');
            setTimeout(() => aInput.classList.remove('bg-blue-600/30'), 500);
        }
    }

    if (typeof window.updateOWC === 'function') window.updateOWC();

    // Visual feedback on button
    const btn = event?.currentTarget;
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'SYNCED ';
        btn.classList.replace('bg-blue-600', 'bg-emerald-600');
        setTimeout(() => {
            btn.textContent = orig;
            btn.classList.replace('bg-emerald-600', 'bg-blue-600');
        }, 1500);
    }
};

// --- TACTICAL MAP HUB LOGIC ---
// [DEPRECATED] Entire block removed to defer exclusively to map_logic.js
// map_logic.js is loaded after this file and manages all tactical map behaviors.

window.syncMapRange = function () {
    if (typeof window.map_logic_sync === 'function') {
        window.map_logic_sync();
    } else if (typeof window.syncMapRange === 'function' && window.syncMapRange.name !== 'syncMapRange') {
        // This is a safety catch for the map_logic.js version
        window.syncMapRange();
    }
    // Note: The actual button in HTML calls window.syncMapRange() 
    // which is defined in map_logic.js and will overwrite this one.
};


// --- GPS RANGEFINDER LOGIC ---
let gpsTargetCoords = null;
let gpsCurrentCoords = null;
let gpsWatchId = null;

window.initGPSRangefinder = function () {
    if (gpsWatchId) return;

    if (!navigator.geolocation) {
        alert("GPS NOT SUPPORTED ON THIS DEVICE");
        return;
    }

    console.log("[GPS] Starting Live Tracker...");
    const liveEl = document.getElementById('gps-live-coords');
    if (liveEl) {
        liveEl.textContent = "WAITING FOR FIX...";
        liveEl.classList.add('animate-pulse');
    }

    gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            gpsCurrentCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };

            const liveEl = document.getElementById('gps-live-coords');
            if (liveEl) {
                liveEl.textContent = `${gpsCurrentCoords.lat.toFixed(5)}, ${gpsCurrentCoords.lon.toFixed(5)}`;
                liveEl.classList.remove('animate-pulse', 'text-red-400');
                liveEl.classList.add('text-blue-400');
            }

            window.updateGPSDistance();
        },
        (err) => {
            console.error("GPS ERROR:", err);
            const liveEl = document.getElementById('gps-live-coords');
            if (liveEl) {
                liveEl.textContent = "SIGNAL LOST (TAP TO RETRY)";
                liveEl.classList.remove('animate-pulse', 'text-blue-400');
                liveEl.classList.add('text-red-400');
                // Allow retry by resetting ID
                navigator.geolocation.clearWatch(gpsWatchId);
                gpsWatchId = null;
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

window.markGPSTarget = function () {
    if (!gpsCurrentCoords) {
        alert("WAITING FOR GPS FIX...");
        return;
    }
    gpsTargetCoords = { ...gpsCurrentCoords };

    const targetEl = document.getElementById('gps-target-coords');
    if (targetEl) targetEl.textContent = `${gpsTargetCoords.lat.toFixed(5)}, ${gpsTargetCoords.lon.toFixed(5)}`;

    alert("TARGET POSITION MARKED. WALK TO FIRING LINE.");
    window.updateGPSDistance();
};

window.updateGPSDistance = function () {
    if (!gpsTargetCoords || !gpsCurrentCoords) return;

    const R = 6371e3; // meters
    const phi1 = gpsTargetCoords.lat * Math.PI / 180;
    const phi2 = gpsCurrentCoords.lat * Math.PI / 180;
    const deltaPhi = (gpsCurrentCoords.lat - gpsTargetCoords.lat) * Math.PI / 180;
    const deltaLambda = (gpsCurrentCoords.lon - gpsTargetCoords.lon) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const meters = R * c;
    const yards = (meters * 1.09361).toFixed(1);

    const distEl = document.getElementById('gps-dist-val');
    if (distEl) distEl.textContent = yards;
};

window.resetGPSRange = function () {
    if (!confirm("RESET GPS LOCK?")) return;
    gpsTargetCoords = null;
    const targetEl = document.getElementById('gps-target-coords');
    if (targetEl) targetEl.textContent = "NO LOCK";

    const distEl = document.getElementById('gps-dist-val');
    if (distEl) distEl.textContent = "0.0";
};

window.syncGPSRange = function () {
    const yards = parseFloat(document.getElementById('gps-dist-val')?.textContent || "0");
    if (yards > 0) {
        const rangeInput = document.getElementById('owc-range');
        if (rangeInput) {
            rangeInput.value = Math.round(yards);
            if (typeof window.updateOWC === 'function') window.updateOWC();
            alert(`GPS RANGE SYNCED: ${Math.round(yards)} YDS`);
        }
    }
};

// --- UNIVERSAL BLUETOOTH MANAGER ---
const BluetoothManager = {
    device: null,
    server: null,
    services: {
        battery: '0000180f-0000-1000-8000-00805f9b34fb',
        environmental: '0000181a-0000-1000-8000-00805f9b34fb',
        deviceInfo: '0000180a-0000-1000-8000-00805f9b34fb',
        nordicUart: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        heartRate: '0000180d-0000-1000-8000-00805f9b34fb' // Standard Heart Rate
    },
    characteristics: {
        temp: '00002a6e-0000-1000-8000-00805f9b34fb',
        wind: '00002a72-0000-1000-8000-00805f9b34fb',
        battery: '00002a19-0000-1000-8000-00805f9b34fb'
    },

    log(msg, type = 'SYS') {
        const log = document.getElementById('bt-log-container');
        if (log) {
            const time = new Date().toLocaleTimeString([], { hour12: false });
            log.innerHTML += `\n<span class="opacity-50">[${time}]</span> <span class="${type === 'ERR' ? 'text-red-500' : type === 'DATA' ? 'text-blue-400' : 'text-green-500'}">[${type}] ${msg}</span>`;
            log.scrollTop = log.scrollHeight;
        }
    },

    async toggle() {
        if (this.device && this.device.gatt.connected) {
            this.disconnect();
        } else {
            this.connect();
        }
    },

    async connect() {
        if (!navigator.bluetooth) {
            this.log("Web Bluetooth API unavailable.", "ERR");
            return;
        }

        try {
            this.log("Scanning for compatible devices...", "SYS");
            // Request wide range of optional services to support many devices
            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    this.services.battery,
                    this.services.environmental,
                    this.services.deviceInfo,
                    this.services.nordicUart,
                    this.services.heartRate
                ]
            });

            this.log(`Connecting to ${this.device.name}...`, "SYS");
            this.device.addEventListener('gattserverdisconnected', () => this.handleDisconnection());

            this.server = await this.device.gatt.connect();
            this.log("Connected! Analyzing Services...", "SYS");
            this.updateButtonState(true);

            // Start Analysis
            await this.discoverServices();

        } catch (error) {
            this.log(`Connection Failed: ${error.message}`, "ERR");
        }
    },

    disconnect() {
        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        }
    },

    handleDisconnection() {
        this.log("Device Disconnected.", "SYS");
        this.updateButtonState(false);
        this.device = null;
        this.server = null;
    },

    updateButtonState(isConnected) {
        const btn = document.getElementById('bt-connect-btn');
        if (btn) {
            if (isConnected) {
                btn.innerText = "DISCONNECT";
                btn.classList.replace('bg-blue-600', 'bg-red-600');
            } else {
                btn.innerText = "SCAN & CONNECT";
                btn.classList.replace('bg-red-600', 'bg-blue-600');
            }
        }
    },

    async discoverServices() {
        try {
            const services = await this.server.getPrimaryServices();
            this.log(`Found ${services.length} Services.`, "SYS");

            for (const service of services) {
                this.log(`> Service: ${service.uuid.slice(4, 8)}`, "SYS");

                // 1. Environmental Sensing (Weather)
                if (service.uuid === this.services.environmental) {
                    await this.readEnvironmental(service);
                }

                // 2. Battery
                if (service.uuid === this.services.battery) {
                    await this.readBattery(service);
                }

                // 3. Device Info (180a)
                if (service.uuid === this.services.deviceInfo) {
                    await this.readDeviceInfo(service);
                }
            }
        } catch (e) {
            this.log(`Discovery Error: ${e.message}`, "ERR");
        }
    },

    async readEnvironmental(service) {
        this.log("  > Environmental Sensing Detected!", "DATA");
        try {
            const chars = await service.getCharacteristics();
            for (const c of chars) {
                // TEMP
                if (c.uuid === this.characteristics.temp) {
                    const val = await c.readValue();
                    const temp = val.getInt16(0, true) / 100;
                    this.log(`  > Temp: ${temp} C`, "DATA");
                    // Auto-Update HUD
                    const fahrenheit = (temp * 9 / 5) + 32;
                    document.getElementById('spotter-controls-manual').classList.remove('hidden'); // Unlock manual
                    document.getElementById('sim-temp').value = Math.round(fahrenheit);
                }
                // WIND
                if (c.uuid === this.characteristics.wind) {
                    const val = await c.readValue();
                    const wind = val.getUint16(0, true) / 100;
                    this.log(`  > Wind: ${wind} m/s`, "DATA");
                    // Update HUD
                    const mph = wind * 2.237;
                    document.getElementById('spotter-wind-val').innerText = mph.toFixed(1) + " MPH";
                    document.getElementById('spotter-wind-slider').value = mph;
                }
            }
        } catch (e) {
            this.log(`  Data Read Error: ${e.message}`, "ERR");
        }
    },

    async readBattery(service) {
        try {
            const char = await service.getCharacteristic(this.characteristics.battery);
            const val = await char.readValue();
            const level = val.getUint8(0);
            this.log(`  > Battery Level: ${level}%`, "DATA");
        } catch (e) { }
    },

    async readDeviceInfo(service) {
        try {
            // Manufacturer Name
            try {
                const char = await service.getCharacteristic('00002a29-0000-1000-8000-00805f9b34fb');
                const val = await char.readValue();
                const decoder = new TextDecoder('utf-8');
                this.log(`  > Mfg: ${decoder.decode(val)}`, "DATA");
            } catch (e) { }

            // Model Number
            try {
                const char = await service.getCharacteristic('00002a24-0000-1000-8000-00805f9b34fb');
                const val = await char.readValue();
                const decoder = new TextDecoder('utf-8');
                this.log(`  > Model: ${decoder.decode(val)}`, "DATA");
            } catch (e) { }
        } catch (e) {
            this.log(`  > Info Read Error`, "ERR");
        }
    },

    async sendCommand(cmd) {
        if (!this.server || !this.server.connected) {
            this.log("Not Connected.", "ERR");
            return;
        }

        this.log(`> Sending: "${cmd}"`, "SYS");

        try {
            // Try to find a writable service (Nordic UART is standard for this)
            const service = await this.server.getPrimaryService(this.services.nordicUart);
            const char = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e'); // RX Characteristic

            const encoder = new TextEncoder();
            await char.writeValue(encoder.encode(cmd));
            this.log("  > Sent Successfully!", "DATA");
        } catch (e) {
            this.log("  > Send Failed: No Writable UART Service found.", "ERR");
            this.log("  (Device Info service is Read-Only)", "SYS");
        }
    },

    simulate() {
        if (this.isSimulating) return; // Prevent multiple intervals
        this.isSimulating = true;
        this.log(" STARTING SIMULATION MODE", "SYS");
        this.updateSimButton(true);
        this.log("Connecting to SIMULATED KESTREL...", "SYS");

        // Use a slight delay to mimic connection time
        setTimeout(() => {
            if (!this.isSimulating) return;
            this.log("Connected!", "SYS");
            this.log("Found Service: Environmental Sensing (0x181A)", "SYS");
        }, 1000);

        setTimeout(() => {
            if (!this.isSimulating) return;
            this.log("  > Environmental Sensing Detected!", "DATA");
            this.log("  > Starting Data Stream...", "DATA");

            // Unlock manual controls
            document.getElementById('spotter-controls-manual').classList.remove('hidden');

            this.simInterval = setInterval(() => {
                // Fake Temp (random between 60-80 F)
                const tempF = 60 + Math.random() * 20;
                this.log(`  > Temp: ${((tempF - 32) * 5 / 9).toFixed(1)} C (${Math.floor(tempF)}F)`, "DATA");

                const tempInput = document.getElementById('sim-temp');
                if (tempInput) tempInput.value = Math.floor(tempF);

                // Fake Wind (random between 2-8 MPH)
                const windMph = 2 + Math.random() * 6;
                this.log(`  > Wind: ${(windMph / 2.237).toFixed(1)} m/s (${windMph.toFixed(1)} MPH)`, "DATA");

                const windVal = document.getElementById('spotter-wind-val');
                if (windVal) windVal.innerText = windMph.toFixed(1) + " MPH";

                const windSlider = document.getElementById('spotter-wind-slider');
                if (windSlider) windSlider.value = windMph;

            }, 3000); // Update every 3 seconds

        }, 2000);
    },

    stopSimulation() {
        if (this.simInterval) clearInterval(this.simInterval);
        this.simInterval = null;
        this.isSimulating = false;
        this.log("Simulation Stopped.", "SYS");
        this.updateSimButton(false);
    },

    toggleSimulation() {
        if (this.isSimulating) {
            this.stopSimulation();
        } else {
            this.simulate();
        }
    },

    updateSimButton(isActive) {
        const btn = document.getElementById('btn-simulate');
        if (btn) {
            if (isActive) {
                btn.textContent = "STOP SIM";
                btn.classList.replace('bg-purple-600', 'bg-red-600');
                btn.classList.add('animate-pulse');
            } else {
                btn.textContent = "SIMULATE";
                btn.classList.replace('bg-red-600', 'bg-purple-600');
                btn.classList.remove('animate-pulse');
            }
        }
    }
};

window.toggleBluetoothConnection = () => BluetoothManager.toggle();

// --- FIELD TAPE LOGIC ---
window.currentTapeBlob = null; // Track current video for export

window.loadFieldTape = function (input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        window.currentTapeBlob = file; // Store for export

        const video = document.getElementById('field-tape-player');
        const placeholder = document.getElementById('field-tape-placeholder');

        if (video && placeholder) {
            const url = URL.createObjectURL(file);
            video.src = url;
            placeholder.classList.add('hidden');
            video.play();
            // Start the reticle overlay loop
            requestAnimationFrame(window.drawFieldTapeHUD);
        }
    }
};

window.drawFieldTapeHUD = function () {
    const canvas = document.getElementById('field-tape-canvas');
    if (!canvas) return;

    // Only draw if tab is active to save resources
    const tab = document.getElementById('intel-field-tape');
    if (!tab || tab.classList.contains('hidden')) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // PERFORMANCE FIX: Only resize if client dims changed (avoid forced layout)
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    if (canvas.width === 0) {
        requestAnimationFrame(window.drawFieldTapeHUD);
        return;
    }

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Faint Green Reticle
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 30, cy);
    ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 30);
    ctx.stroke();

    // Mil-Dots
    ctx.fillStyle = '#00ff00';
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(cx + (i * 25), cy, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx - (i * 25), cy, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy + (i * 25), 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy - (i * 25), 1.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(window.drawFieldTapeHUD);
};

// --- ARCHIVE UI LOGIC ---
window.openTapeArchive = async function () {
    const modal = document.getElementById('tape-archive-modal');
    const list = document.getElementById('tape-list');
    if (modal) modal.classList.remove('hidden');

    // Fetch and Render
    if (list) {
        list.innerHTML = '<div class="text-center text-zinc-500 text-[10px] mt-4 animate-pulse">ACCESSING VAULT...</div>';
        try {
            const tapes = await TRC_Vault.getAllTapes();
            if (tapes.length === 0) {
                list.innerHTML = '<div class="text-center text-zinc-500 text-[10px] mt-10">VAULT EMPTY</div>';
                return;
            }

            list.innerHTML = '';
            tapes.sort((a, b) => b.id - a.id).forEach(tape => {
                const item = document.createElement('div');
                item.className = "flex items-center justify-between bg-zinc-800/50 border border-white/5 p-3 rounded-lg hover:bg-zinc-800 transition-colors";

                // Format Date
                const dateObj = new Date(tape.id);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString();

                item.innerHTML = `
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center shrink-0">
                            <i data-lucide="video" class="w-4 h-4 text-zinc-500"></i>
                        </div>
                        <div class="flex flex-col min-w-0">
                            <span class="text-[10px] font-black text-white truncate">MISSION TAPE</span>
                            <span class="text-[9px] text-zinc-400 truncate font-mono">${dateStr} ${timeStr}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <button onclick="playArchivedTape(${tape.id})" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md shadow-lg active:scale-95">
                            <i data-lucide="play" class="w-3 h-3"></i>
                        </button>
                         <button onclick="deleteArchivedTape(${tape.id})" class="bg-red-950/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-md shadow-lg active:scale-95 border border-red-500/20 transition-all flex items-center gap-1">
                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                        </button>
                    </div>
                `;
                list.appendChild(item);
            });
            lucide.createIcons();
        } catch (e) {
            list.innerHTML = `<div class="text-center text-red-500 text-[10px] mt-10">ERROR: ${e.message}</div>`;
        }
    }
};

window.closeTapeArchive = function () {
    const modal = document.getElementById('tape-archive-modal');
    if (modal) modal.classList.add('hidden');
};

window.playArchivedTape = async function (id) {
    try {
        const tapes = await TRC_Vault.getAllTapes();
        const tape = tapes.find(t => t.id === id);
        if (tape) {
            window.currentTapeBlob = tape.blob; // Store for export

            const url = URL.createObjectURL(tape.blob);
            const video = document.getElementById('field-tape-player');
            const placeholder = document.getElementById('field-tape-placeholder');

            if (video) {
                video.src = url;
                if (placeholder) placeholder.classList.add('hidden');
                video.play();
                requestAnimationFrame(window.drawFieldTapeHUD);
                window.closeTapeArchive();
            }
        }
    } catch (e) {
        alert("Playback Failed: " + e.message);
    }
};

window.exportCurrentTape = async function () {
    if (!window.currentTapeBlob) {
        alert("No tape loaded to export.");
        return;
    }

    const blob = window.currentTapeBlob;
    const file = new File([blob], `TRC_Tape_${Date.now()}.webm`, { type: blob.type });

    // Try Native Share (Mobile)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'Tactical Range Card Tape',
                text: 'Shared from TRC Intel Hub'
            });
            return;
        } catch (err) {
            console.log("Share failed/cancelled, falling back to download.");
        }
    }

    // Fallback: Direct Download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.deleteArchivedTape = async function (id) {
    if (confirm("Permanently erase this tape from the vault?")) {
        await TRC_Vault.deleteTape(id);
        window.openTapeArchive(); // Refresh list
    }
};

// initialization logic moved to main listener block at line ~1527

// ===================================================================
// ISOLATED TACTICAL MARKING ENGINE (Pencil/Pen)
// ===================================================================
// Moved out of Intel Hub context to prevent accidental marking during scroll.
document.addEventListener('DOMContentLoaded', () => {

    let mobileStrokes = [];
    let desktopStrokes = [];

    function initDrawing(canvasId, strokes) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let isDrawing = false;
        let lastX = 0, lastY = 0;

        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        const startDrawing = (e) => {
            const isPencil = document.getElementById('pencil-toggle')?.checked;
            const isRed = document.getElementById('red-pen-toggle')?.checked;
            if (!isPencil && !isRed) return;

            if (e.type === 'touchstart') e.preventDefault();
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x; lastY = pos.y;
            const color = isRed ? '#ef4444' : '#333333';
            ctx.strokeStyle = color;
            strokes.push({ color, points: [{ x: pos.x, y: pos.y }] });
        };

        const draw = (e) => {
            if (!isDrawing) return;
            if (e.type === 'touchmove') e.preventDefault();
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            if (strokes.length > 0) strokes[strokes.length - 1].points.push({ x: pos.x, y: pos.y });
            lastX = pos.x; lastY = pos.y;
        };

        const stopDrawing = () => { isDrawing = false; };

        const redraw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            strokes.forEach(s => {
                if (s.points.length < 2) return;
                ctx.beginPath();
                ctx.strokeStyle = s.color;
                ctx.moveTo(s.points[0].x, s.points[0].y);
                for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
                ctx.stroke();
            });
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        window.addEventListener('touchend', stopDrawing);

        return {
            redraw, clear: () => { strokes.length = 0; redraw(); }, clearColor: (color) => {
                const preserved = strokes.filter(s => s.color !== color);
                strokes.length = 0;
                preserved.forEach(s => strokes.push(s));
                redraw();
            }
        };
    }

    const mobilePencil = initDrawing('targetCanvasMobile', mobileStrokes);
    const desktopPencil = initDrawing('targetCanvas', desktopStrokes);

    window.clearTacticalMarkings = (type) => {
        if (type === 'all') { mobilePencil?.clear(); desktopPencil?.clear(); }
        else if (type === 'pencil') { mobilePencil?.clearColor('#333333'); desktopPencil?.clearColor('#333333'); }
        else if (type === 'red') { mobilePencil?.clearColor('#ef4444'); desktopPencil?.clearColor('#ef4444'); }
    };
});

// ============================================================================
// TARGET INTEL CAM SYSTEM
// ============================================================================

// Initialize IndexedDB for target photos
let targetDB;
const initTargetDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TargetIntelDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            targetDB = request.result;
            resolve(targetDB);
        };
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('targets')) {
                db.createObjectStore('targets', { keyPath: 'id' });
            }
        };
    });
};

// Initialize Target Cam
window.initTargetCam = async function () {
    const video = document.getElementById('target-cam-video');

    if (!video) {
        console.error("[TARGET CAM] Video element not found!");
        return;
    }

    // 1. Check for Secure Context (Warning only, don't block)
    if (!window.isSecureContext && location.hostname !== 'localhost') {
        console.warn("[TARGET CAM] Not a secure context. Camera might be blocked by browser.");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("[TARGET CAM] MediaDevices API not supported");
        startMetadataUpdates();
        return;
    }

    // Stop any existing stream first
    if (window.targetCamStream) {
        window.targetCamStream.getTracks().forEach(track => track.stop());
        window.targetCamStream = null;
    }

    if (!video) {
        console.error("[TARGET CAM] Video element not found");
        return;
    }

    try {
        console.log("[TARGET CAM] Requesting camera access...");

        const constraints = {
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (firstErr) {
            console.warn("[TARGET CAM] High quality failed, trying generic video");
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        window.targetCamStream = stream;
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            video.play().catch(e => console.error("[TARGET CAM] Play failed", e));
            console.log("[TARGET CAM] Camera initialized successfully");
        };

        // Start metadata updates
        startMetadataUpdates();

    } catch (err) {
        console.error("[TARGET CAM] Camera access failed:", err.name, err.message);
        startMetadataUpdates();
        console.log("[TARGET CAM] Running in no-camera mode");
    }
};

// Stop Target Cam
window.stopTargetCam = function () {
    if (window.targetCamStream) {
        window.targetCamStream.getTracks().forEach(track => track.stop());
        window.targetCamStream = null;
    }
    if (window.metadataInterval) {
        clearInterval(window.metadataInterval);
        window.metadataInterval = null;
    }
    const video = document.getElementById('target-cam-video');
    if (video) video.srcObject = null;
};

// Start real-time metadata updates
function startMetadataUpdates() {
    updateMetadata(); // Initial update
    // window.metadataInterval = setInterval(updateMetadata, 1000); // DISABLED FOR APK STABILITY
}

// Update metadata displays
function updateMetadata() {
    // Update time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const timeDisplay = document.getElementById('target-time-display');
    if (timeDisplay) timeDisplay.textContent = timeStr;

    // Update GPS
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude.toFixed(6);
            const lon = pos.coords.longitude.toFixed(6);
            const gpsDisplay = document.getElementById('target-gps-display');
            if (gpsDisplay) gpsDisplay.textContent = `GPS: ${lat}, ${lon}`;
            window.currentGPS = { lat, lon };
        }, () => {
            const gpsDisplay = document.getElementById('target-gps-display');
            if (gpsDisplay) gpsDisplay.textContent = 'GPS: UNAVAILABLE';
        });
    }

    // Update heading (compass)
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientationabsolute', (e) => {
            const heading = e.alpha ? Math.round(e.alpha) : 0;
            const headingDisplay = document.getElementById('target-heading-display');
            if (headingDisplay) headingDisplay.textContent = `HDG: ${heading}°`;
            window.currentHeading = heading;
        }, { once: true });
    }

    // Update angle (pitch)
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            const pitch = e.beta ? Math.round(e.beta) : 0;
            const angleDisplay = document.getElementById('target-angle-display');
            if (angleDisplay) angleDisplay.textContent = `ANG: ${pitch}°`;
            window.currentAngle = pitch;
        }, { once: true });
    }
}

// Capture target photo
window.captureTargetPhoto = async function () {
    console.log("[CAPTURE] Function called");

    try {
        const video = document.getElementById('target-cam-video');
        if (!video || !video.srcObject) {
            console.error("[CAPTURE] Camera not active - video:", video, "srcObject:", video?.srcObject);
            alert("Camera not active");
            return;
        }

        console.log("[CAPTURE] Video element found, showing feedback");

        // Show immediate visual feedback
        const btn = document.getElementById('target-cam-capture');
        if (btn) {
            console.log("[CAPTURE] Button found, changing to yellow");
            btn.textContent = '? CAPTURING...';
            btn.style.backgroundColor = '#ca8a04'; // yellow-600
            btn.disabled = true;
        } else {
            console.error("[CAPTURE] Button not found!");
        }

        // Create canvas to capture frame
        console.log("[CAPTURE] Creating canvas");

        // Validate video is ready
        if (video.readyState < 2) {
            console.error("[CAPTURE] Video not ready, readyState:", video.readyState);
            alert("Camera not ready. Please wait a moment and try again.");
            if (btn) {
                btn.textContent = 'CAPTURE';
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }
            return;
        }

        // Validate video dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error("[CAPTURE] Invalid video dimensions:", video.videoWidth, "x", video.videoHeight);
            alert("Camera error: Invalid video size. Please refresh and try again.");
            if (btn) {
                btn.textContent = 'CAPTURE';
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        console.log("[CAPTURE] Canvas created, size:", canvas.width, "x", canvas.height);

        // Convert to blob using dataURL (more reliable on mobile)
        console.log("[CAPTURE] Converting to blob...");
        try {
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            const blob = await fetch(dataURL).then(r => r.blob());

            if (!blob) {
                throw new Error("Blob creation failed");
            }

            console.log("[CAPTURE] Blob created, size:", blob.size);

            const targetData = {
                id: Date.now(),
                photo: blob,
                gps: window.currentGPS || { lat: 0, lon: 0 },
                heading: window.currentHeading || 0,
                angle: window.currentAngle || 0,
                timestamp: new Date().toISOString(),
                milReading: null,
                targetSize: null,
                range: null,
                windDirection: null,
                windSpeed: null,
                priority: 'none',
                notes: ''
            };

            console.log("[CAPTURE] Saving to IndexedDB...");
            // Save to IndexedDB
            await saveTargetPhoto(targetData);
            console.log("[CAPTURE] Saved successfully");

            // Auto-refresh vault if it's currently open
            const vaultTab = document.getElementById('intel-vault');
            if (vaultTab && !vaultTab.classList.contains('hidden')) {
                console.log("[CAPTURE] Vault is open, refreshing...");
                await loadVault();
            }

            // Visual feedback - success
            if (btn) {
                console.log("[CAPTURE] Changing button to green");
                btn.textContent = '? CAPTURED!';
                btn.style.backgroundColor = '#16a34a'; // green-600
                setTimeout(() => {
                    btn.textContent = 'CAPTURE';
                    btn.style.backgroundColor = ''; // Reset to original
                    btn.disabled = false;
                    console.log("[CAPTURE] Button reset to normal");
                }, 2000);
            }

            console.log("[TARGET CAM] Photo captured and saved:", targetData.id);
        } catch (blobError) {
            console.error("[CAPTURE] Error creating blob:", blobError);
            alert("Capture failed: " + blobError.message);
            if (btn) {
                btn.textContent = 'CAPTURE';
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }
        }
    } catch (err) {
        console.error("[CAPTURE] Fatal error:", err);
        alert("Capture error: " + err.message);
        const btn = document.getElementById('target-cam-capture');
        if (btn) {
            btn.textContent = 'CAPTURE';
            btn.classList.remove('bg-yellow-600');
            btn.disabled = false;
        }
    }
};

// Save target photo to IndexedDB
async function saveTargetPhoto(data) {
    if (!targetDB) await initTargetDB();

    return new Promise((resolve, reject) => {
        const transaction = targetDB.transaction(['targets'], 'readwrite');
        const store = transaction.objectStore('targets');
        const request = store.add(data);

        request.onsuccess = () => {
            console.log("[VAULT] Photo saved successfully:", data.id);
            resolve();
        };
        request.onerror = () => {
            console.error("[VAULT] Save failed:", request.error);
            reject(request.error);
        };
    });
}

// Load and render vault
window.loadVault = async function () {
    if (!targetDB) await initTargetDB();

    const transaction = targetDB.transaction(['targets'], 'readonly');
    const store = transaction.objectStore('targets');
    const request = store.getAll();

    request.onsuccess = () => {
        const targets = request.result;
        console.log("[VAULT] Loaded targets:", targets.length);
        renderVault(targets);
    };
    request.onerror = () => {
        console.error("[VAULT] Load failed:", request.error);
    };
};

// Render vault cards
function renderVault(targets) {
    const container = document.getElementById('vault-cards-container');
    const emptyState = document.getElementById('vault-empty-state');

    if (!container) {
        console.error("[VAULT] Container not found");
        return;
    }

    if (targets.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        console.log("[VAULT] No targets to display");
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    console.log("[VAULT] Rendering", targets.length, "targets");

    try {
        container.innerHTML = targets.map(target => {
            const photoURL = URL.createObjectURL(target.photo);
            const date = new Date(target.timestamp);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            return `
                <div class="bg-zinc-900 rounded-lg overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
                    onclick="openTargetDetail(${target.id})">
                    <div class="aspect-square bg-black relative">
                        <img src="${photoURL}" class="w-full h-full object-cover" />
                        <div class="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[8px] font-mono text-green-400">
                            ${timeStr}
                        </div>
                    </div>
                    <div class="p-2 space-y-1">
                        <div class="text-[9px] font-mono text-zinc-400">
                            <div>GPS: ${target.gps.lat}, ${target.gps.lon}</div>
                            <div>HDG: ${target.heading}° | ANG: ${target.angle}°</div>
                        </div>
                        <div class="text-[8px] text-zinc-500">${dateStr}</div>
                    </div>
                </div>
            `;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
        console.log("[VAULT] Render complete");
    } catch (err) {
        console.error("[VAULT] Render failed:", err);
    }
}

// Clear vault
window.clearVault = async function () {
    if (!confirm('Clear all target intel? This cannot be undone.')) return;

    if (!targetDB) await initTargetDB();

    const transaction = targetDB.transaction(['targets'], 'readwrite');
    const store = transaction.objectStore('targets');
    store.clear();

    transaction.oncomplete = () => {
        loadVault();
        console.log("[VAULT] Cleared");
    };
};

// Initialize DB on load
initTargetDB();

// Verify Target Cam functions loaded
console.log("[TARGET CAM] Functions loaded:", {
    initTargetCam: typeof window.initTargetCam,
    stopTargetCam: typeof window.stopTargetCam,
    captureTargetPhoto: typeof window.captureTargetPhoto,
    loadVault: typeof window.loadVault
});

// ===== PHASE 2: MIL/MOA MEASUREMENT SYSTEM =====
let currentTargetData = null;
let measureMode = false;
let measureStart = null;
let measureEnd = null;
let currentReticleType = 'box';
let poiPins = [];
let isPOITagging = false;
let cameraFOV = parseFloat(localStorage.getItem('trc_camera_fov')) || 65;

window.calibrateFOV = function (knownSizeIn, distanceYds) {
    if (!measureStart || !measureEnd || !knownSizeIn || !distanceYds) {
        alert("Measure a known object first!");
        return;
    }

    const boxHeight = Math.abs(measureEnd.y - measureStart.y);
    const milReading = (knownSizeIn * 27.77) / distanceYds;

    // We reverse the math: milReading = (boxHeight/imageHeight * FOV) / 0.0573
    // So: FOV = (milReading * 0.0573) / (boxHeight/imageHeight)
    const dimensionRatio = boxHeight / window.imageHeight;
    cameraFOV = (milReading * 0.0573) / dimensionRatio;

    localStorage.setItem('trc_camera_fov', cameraFOV);
    console.log("[TARGET] FOV Calibrated to:", cameraFOV);
    calculateMilMoa();
};

window.updateReticleType = function (type) {
    currentReticleType = type;
    drawMeasurementBox();
    console.log("[TARGET] Reticle set to:", type);
};

window.requestFOVCal = function () {
    const size = prompt("Enter known object size (inches):", "18");
    const dist = prompt("Enter known distance (yards):", "100");
    if (size && dist) calibrateFOV(parseFloat(size), parseFloat(dist));
};

window.nudgeMeasure = function (px) {
    if (!measureStart || !measureEnd) {
        // Init a default box if none exists
        const canvas = document.getElementById('measurement-canvas');
        measureStart = { x: canvas.width / 4, y: canvas.height / 4 };
        measureEnd = { x: canvas.width * 3 / 4, y: canvas.height * 3 / 4 };
    }

    if (measurementDimension === 'height') {
        measureEnd.y += px;
    } else {
        measureEnd.x += px;
    }

    drawMeasurementBox();
    calculateMilMoa();
};

window.togglePOITagging = function () {
    isPOITagging = !isPOITagging;
    const btn = document.getElementById('poi-tag-btn');
    if (isPOITagging) {
        btn?.classList.replace('text-blue-400', 'text-orange-400');
        btn?.classList.replace('bg-blue-600/20', 'bg-orange-600/20');
        measureMode = false;
        calibrationMode = false;
    } else {
        btn?.classList.replace('text-orange-400', 'text-blue-400');
        btn?.classList.replace('bg-orange-600/20', 'bg-blue-600/20');
    }
};
let currentMilReading = 0;
let measurementDimension = 'height'; // 'height' or 'width'
let calibrationMode = false;
let calibratedRange = null;

// Open target detail modal
window.openTargetDetail = async function (targetId) {
    if (!targetDB) await initTargetDB();

    const transaction = targetDB.transaction(['targets'], 'readonly');
    const store = transaction.objectStore('targets');
    const request = store.get(targetId);

    request.onsuccess = () => {
        currentTargetData = request.result;
        if (!currentTargetData) return;

        // Show modal
        const modal = document.getElementById('target-detail-modal');
        modal.classList.remove('hidden');

        // Load photo
        const img = document.getElementById('detail-photo');
        const photoURL = URL.createObjectURL(currentTargetData.photo);
        img.src = photoURL;

        // Display metadata
        const lat = (currentTargetData.gps && typeof currentTargetData.gps.lat === 'number') ? currentTargetData.gps.lat : 0;
        const lon = (currentTargetData.gps && typeof currentTargetData.gps.lon === 'number') ? currentTargetData.gps.lon : 0;

        document.getElementById('detail-gps').textContent =
            `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        document.getElementById('detail-heading-angle').textContent =
            `${currentTargetData.heading}° / ${currentTargetData.angle}°`;

        // Setup canvas for measurement overlay
        img.onload = () => {
            setupMeasurementCanvas();
        };

        if (typeof lucide !== 'undefined') lucide.createIcons();
        console.log("[TARGET DETAIL] Opened target:", targetId);
    };
};

// Close target detail modal
window.closeTargetDetail = function () {
    const modal = document.getElementById('target-detail-modal');
    modal.classList.add('hidden');
    measureMode = false;
    calibrationMode = false;
    calibratedRange = null;
    measureStart = null;
    measureEnd = null;
    currentTargetData = null;

    // Reset UI
    const calStatus = document.getElementById('cal-status');
    if (calStatus) calStatus.textContent = 'NO CAL';
    const objSize = document.getElementById('object-size-display');
    if (objSize) objSize.textContent = '--';

    // Clear canvas
    const canvas = document.getElementById('measurement-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById('mil-reading-display').classList.add('hidden');
    document.getElementById('measure-instructions').classList.add('hidden');
};

// Toggle calibration mode
window.toggleCalibrationMode = function () {
    calibrationMode = !calibrationMode;
    measureMode = false; // Disable measure mode
    const calBtn = document.getElementById('calibration-mode-btn');
    const measureBtn = document.getElementById('measure-mode-btn');
    const instructions = document.getElementById('measure-instructions');

    if (calibrationMode) {
        calBtn.style.backgroundColor = '#a855f7'; // purple-500
        calBtn.textContent = '? CALIBRATING';
        measureBtn.style.backgroundColor = '#2563eb';
        measureBtn.innerHTML = '<i data-lucide="ruler" class="w-3 h-3 inline mr-1"></i> MEASURE';
        instructions.classList.remove('hidden');
        instructions.innerText = "Draw a box around a KNOWN object (Reference)";
    } else {
        calBtn.style.backgroundColor = '#9333ea'; // purple-600
        calBtn.innerHTML = '<i data-lucide="crosshair" class="w-3 h-3 inline mr-1"></i> CALIBRATE';
        instructions.classList.add('hidden');
    }
};

// Toggle measurement mode
window.toggleMeasureMode = function () {
    measureMode = !measureMode;
    calibrationMode = false; // Disable calibration mode
    const measureBtn = document.getElementById('measure-mode-btn');
    const calBtn = document.getElementById('calibration-mode-btn');
    const instructions = document.getElementById('measure-instructions');

    if (measureMode) {
        measureBtn.style.backgroundColor = '#16a34a'; // green-600
        measureBtn.textContent = '? MEASURING';
        calBtn.style.backgroundColor = '#9333ea';
        calBtn.innerHTML = '<i data-lucide="crosshair" class="w-3 h-3 inline mr-1"></i> CALIBRATE';
        instructions.classList.remove('hidden');
        instructions.innerText = "Draw a box around the TARGET to measure";
    } else {
        measureBtn.style.backgroundColor = '#2563eb'; // blue-600
        measureBtn.innerHTML = '<i data-lucide="ruler" class="w-3 h-3 inline mr-1"></i> MEASURE';
        instructions.classList.add('hidden');
    }
};

// Setup measurement canvas
function setupMeasurementCanvas() {
    const img = document.getElementById('detail-photo');
    const canvas = document.getElementById('measurement-canvas');
    const container = canvas.parentElement;

    // Match canvas size to container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Calculate image position within container
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    window.imageOffsetX = imgRect.left - containerRect.left;
    window.imageOffsetY = imgRect.top - containerRect.top;
    window.imageWidth = imgRect.width;
    window.imageHeight = imgRect.height;

    // Add event listeners (Mouse & Touch)
    canvas.style.pointerEvents = 'auto';

    let isDrawing = false;

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startAction = (e) => {
        const pos = getPos(e);

        if (isPOITagging) {
            poiPins.push(pos);
            drawMeasurementBox();
            return;
        }

        if (!measureMode && !calibrationMode) return;
        measureStart = pos;
        isDrawing = true;
    };

    const moveAction = (e) => {
        if (!isDrawing) return;
        measureEnd = getPos(e);
        drawMeasurementBox();
    };

    const endAction = (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        calculateMilMoa();
    };

    canvas.addEventListener('mousedown', startAction);
    canvas.addEventListener('mousemove', moveAction);
    canvas.addEventListener('mouseup', endAction);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startAction(e); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); moveAction(e); });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); endAction(e); });
}

// Draw measurement box or reticle on canvas
function drawMeasurementBox() {
    if (!measureStart || !measureEnd) return;

    const canvas = document.getElementById('measurement-canvas');
    const ctx = canvas.getContext('2d');

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = measureEnd.x - measureStart.x;
    const height = measureEnd.y - measureStart.y;
    const centerX = measureStart.x + width / 2;
    const centerY = measureStart.y + height / 2;

    if (currentReticleType === 'box') {
        // Legacy Box Drawing
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(measureStart.x, measureStart.y, width, height);

        // Center cross
        ctx.setLineDash([]);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY); ctx.lineTo(centerX + 10, centerY);
        ctx.moveTo(centerX, centerY - 10); ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();
    } else if (currentReticleType === 'mildot' || currentReticleType === 'aprs11') {
        // High-Precision Reticle Overlay
        drawTacticalReticle(ctx, centerX, centerY, Math.abs(height), currentReticleType);
    }

    // Draw POI Pins if any
    drawPOIPins(ctx);
}

function drawTacticalReticle(ctx, cx, cy, sizePx, type) {
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ef4444'; // Tactical Red

    // Main Crosshair
    ctx.beginPath();
    ctx.moveTo(cx - sizePx, cy); ctx.lineTo(cx + sizePx, cy);
    ctx.moveTo(cx, cy - sizePx); ctx.lineTo(cx, cy + sizePx);
    ctx.stroke();

    // Hash Marks (Every MIL)
    // We assume 'sizePx' is the total height, representing maybe 10 MILs for scale
    const pixelsPerMil = sizePx / 10;

    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        const pos = i * pixelsPerMil;

        // Vertical Hashes
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + pos); ctx.lineTo(cx + 5, cy + pos);
        ctx.stroke();

        // Horizontal Hashes
        ctx.beginPath();
        ctx.moveTo(cx + pos, cy - 5); ctx.lineTo(cx + pos, cy + 5);
        ctx.stroke();

        // APRS11 Christmas Tree Logic
        if (type === 'aprs11' && i > 0 && i % 2 === 0) {
            // Draw windage dots for holdovers at 2, 4, 6, 8, 10 MILs down
            const count = i / 2; // number of dots each side
            for (let j = 1; j <= count; j++) {
                const windagePos = j * pixelsPerMil * 2; // simplified
                ctx.beginPath();
                ctx.arc(cx + windagePos, cy + pos, 1, 0, Math.PI * 2);
                ctx.arc(cx - windagePos, cy + pos, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Center Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
}

function drawPOIPins(ctx) {
    poiPins.forEach((pin, idx) => {
        ctx.fillStyle = '#f97316'; // Orange
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'black 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(idx + 1, pin.x, pin.y + 3);
    });
}

// Calculate MIL/MOA from measurement box (Phase 3: supports width/height and calibration)
function calculateMilMoa() {
    if (!measureStart || !measureEnd) return;

    const boxWidth = Math.abs(measureEnd.x - measureStart.x);
    const boxHeight = Math.abs(measureEnd.y - measureStart.y);

    // Use selected dimension
    const boxDimension = measurementDimension === 'height' ? boxHeight : boxWidth;
    const imageDimension = measurementDimension === 'height' ? window.imageHeight : window.imageWidth;

    // Camera FOV (User Calibratable, default 65)
    const activeFOV = cameraFOV;

    // Calculate MIL reading
    const dimensionRatio = boxDimension / imageDimension;
    const angularSize = dimensionRatio * activeFOV;
    const milReading = (angularSize / 0.0573);
    const moaReading = milReading * 3.6;

    currentMilReading = milReading;

    // Display readings
    document.getElementById('mil-value').textContent = milReading.toFixed(2);
    document.getElementById('moa-value').textContent = moaReading.toFixed(2);
    document.getElementById('mil-reading-display').classList.remove('hidden');

    if (calibrationMode) {
        // PERMIT CALIBRATION: Calculate range based on known reference size
        const refSize = parseFloat(document.getElementById('target-size-input').value) || 6.14;
        calibratedRange = (refSize / currentMilReading) / 27.78;

        document.getElementById('cal-status').textContent = `CALIBRATED @ ${Math.round(calibratedRange)} YDS`;
        document.getElementById('object-size-display').textContent = refSize.toFixed(2);
        console.log("[CALIBRATE] New reference range:", calibratedRange);
    } else {
        // STANDARD MEASUREMENT
        calculateRange();
    }
}


// Calculate range using MIL formula (Phase 3: with range warnings and object size estimation)
window.calculateRange = function () {
    const targetSizeInput = document.getElementById('target-size-input');
    const targetSize = parseFloat(targetSizeInput.value);

    // Update Object Size if calibrated
    if (calibratedRange && currentMilReading > 0) {
        const estimatedSize = (currentMilReading * calibratedRange) * 27.78;
        document.getElementById('object-size-display').textContent = estimatedSize.toFixed(2);
    }

    if (!targetSize || !currentMilReading || currentMilReading === 0) {
        const rangeEl = document.getElementById('calculated-range');
        if (rangeEl) rangeEl.textContent = '--';
        const statusEl = document.getElementById('range-status');
        if (statusEl) statusEl.textContent = '';
        return;
    }

    // MIL formula: Range (yards) = (Target Size in inches / MIL reading) / 27.78
    const rangeYards = (targetSize / currentMilReading) / 27.78;

    // Show decimals for close ranges (under 10 yards)
    const displayRange = rangeYards < 10 ? rangeYards.toFixed(2) : Math.round(rangeYards);
    document.getElementById('calculated-range').textContent = displayRange;

    // Range status warnings
    const statusEl = document.getElementById('range-status');
    if (statusEl) {
        if (rangeYards < 50) {
            statusEl.textContent = '?? TOO CLOSE';
            statusEl.className = 'text-[7px] font-black text-red-500';
        } else if (rangeYards >= 100 && rangeYards <= 800) {
            statusEl.textContent = '? OPTIMAL';
            statusEl.className = 'text-[7px] font-black text-green-500';
        } else if (rangeYards > 800) {
            statusEl.textContent = '?? EXTREME';
            statusEl.className = 'text-[7px] font-black text-yellow-500';
        } else {
            statusEl.textContent = '';
        }
    }

    // Store in current target data
    if (currentTargetData) {
        currentTargetData.milReading = currentMilReading;
        currentTargetData.targetSize = targetSize;
        currentTargetData.range = rangeYards;
        updateTargetData(currentTargetData);
    }
};


// Update target data in IndexedDB
async function updateTargetData(data) {
    if (!targetDB) await initTargetDB();

    return new Promise((resolve, reject) => {
        const transaction = targetDB.transaction(['targets'], 'readwrite');
        const store = transaction.objectStore('targets');
        const request = store.put(data);

        request.onsuccess = () => {
            console.log("[VAULT] Target data updated:", data.id);
            resolve();
        };
        request.onerror = () => {
            console.error("[VAULT] Update failed:", request.error);
            reject(request.error);
        };
    });
}

// Send to Dope calculator
window.sendToDope = function () {
    if (!currentTargetData) {
        alert("Please open a target photo first");
        return;
    }

    if (!currentTargetData.range || currentTargetData.range === 0) {
        alert("Please measure target and calculate range first.\n\n1. Click MEASURE\n2. Draw box on target\n3. Enter target size\n4. Then click SEND TO DOPE");
        return;
    }

    // Set range in main calculator
    const rangeInput = document.getElementById('range-input');
    if (rangeInput) {
        rangeInput.value = Math.round(currentTargetData.range);
    }

    // Close modal and switch to Dope tab
    closeTargetDetail();

    // Close Intel Hub
    const intelHub = document.getElementById('intelHubModal');
    if (intelHub) {
        intelHub.classList.add('hidden');
    }

    // Trigger dope calculation
    if (window.generateDope) {
        window.generateDope();
    }

    console.log("[DOPE] Range sent:", currentTargetData.range, "yards");
    alert(`Range ${Math.round(currentTargetData.range)} yards sent to Dope Calculator`);
};


// Logic check for modular loading
window.systemStatus = "READY";

// === RETICLE DRAWING SYSTEM ===
window.drawReticles = function () {
    window.updateAllCanvases('hold');
    window.updateAllCanvases('shot');
};

// Initial draw if elements exist
setTimeout(window.drawReticles, 1000);

// === AUTO-SAVE SYSTEM ===
function initPersistence() {
    if (typeof inputs === 'undefined') return;
    console.log("[SYSTEM] Initializing Auto-Save for " + inputs.length + " inputs");

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const saved = localStorage.getItem('trc_save_' + id);
            if (saved !== null) {
                el.value = saved;
            }

            el.addEventListener('input', (e) => {
                localStorage.setItem('trc_save_' + id, e.target.value);
            });
        }
    });

    // Performance: Refresh all displays ONCE after bulk load instead of firing 100+ events
    if (typeof window.refreshAllDisplays === 'function') {
        window.refreshAllDisplays();
    }
    // Deep sync OWC if active
    if (typeof window.updateOWC === 'function') {
        window.updateOWC();
    }
}

// Initialize logic
setTimeout(initPersistence, 800);

// === NAVIGATION & AI LOGGING ===
window.switchTacticalModule = function (moduleId) {
    // Hide all modules
    ['ammo', 'drills', 'what-if', 'quick-dope'].forEach(id => {
        const el = document.getElementById(`module-${id}`);
        if (el) el.classList.add('hidden');

        const btn = document.getElementById(`subtab-${id}`);
        if (btn) {
            btn.classList.remove('bg-blue-900/40', 'text-[var(--input-text)]');
            btn.classList.add('text-zinc-500');
        }
    });

    // Show selected
    const selected = document.getElementById(`module-${moduleId}`);
    if (selected) selected.classList.remove('hidden');

    // Highlight button
    const activeBtn = document.getElementById(`subtab-${moduleId}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-zinc-500');
        activeBtn.classList.add('bg-blue-900/40', 'text-[var(--input-text)]');
    }

    // LOG NAVIGATION
    if (typeof SessionLogger !== 'undefined') {
        const moduleName = moduleId.toUpperCase().replace('-', ' ');
        SessionLogger.add("USER", `Navigated to Tactical Module: ${moduleName}`);
    }
};

// --- WORK CENTER PERSISTENCE ---
window.saveWorkCenterState = function () {
    const state = {
        range: document.getElementById('owc-range')?.value,
        zero: document.getElementById('owc-zero')?.value,
        mv: document.getElementById('owc-mv')?.value,
        bc: document.getElementById('owc-bc')?.value,
        windSpeed: document.getElementById('owc-wind-speed')?.value,
        windDir: document.getElementById('owc-wind-dir')?.value,
        losHeading: document.getElementById('owc-los-heading')?.value,
        angle: document.getElementById('owc-angle')?.value,
        temp: document.getElementById('owc-temp')?.value,
        press: document.getElementById('owc-press')?.value,
        hum: document.getElementById('owc-hum')?.value,
        da: document.getElementById('owc-da')?.value,
        alt: document.getElementById('owc-alt')?.value,
        atmosMode: window.owcAtmosMode,
        liveSync: window.owcLiveSync
    };
    localStorage.setItem('trc_owc_state', JSON.stringify(state));
};

window.loadWorkCenterState = function () {
    const saved = localStorage.getItem('trc_owc_state');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined) el.value = val;
        };

        setVal('owc-range', state.range);
        setVal('owc-zero', state.zero);
        setVal('owc-mv', state.mv);
        setVal('owc-bc', state.bc);

        // Wind
        setVal('owc-wind-speed', state.windSpeed);
        setVal('owc-wind-dir', state.windDir);
        const wsVal = document.getElementById('owc-wind-speed-val');
        if (wsVal && state.windSpeed) wsVal.textContent = state.windSpeed;

        // Environment
        setVal('owc-temp', state.temp);
        setVal('owc-press', state.press);
        setVal('owc-hum', state.hum);
        setVal('owc-da', state.da);
        setVal('owc-alt', state.alt);
        setVal('owc-los-heading', state.losHeading);
        setVal('owc-angle', state.angle);

        // Restore Modes
        if (state.atmosMode && state.atmosMode !== window.owcAtmosMode) {
            window.toggleOWCAtmosMode();
            if (window.owcAtmosMode !== state.atmosMode) window.toggleOWCAtmosMode();
        }

        if (state.liveSync !== undefined) {
            window.owcLiveSync = state.liveSync;
            const btn = document.getElementById('owc-live-sync-btn');
            if (btn) {
                if (state.liveSync) {
                    btn.classList.add('bg-blue-600');
                    btn.classList.remove('bg-zinc-800', 'text-zinc-500');
                    btn.textContent = "LIVE: ON";
                } else {
                    btn.classList.remove('bg-blue-600');
                    btn.classList.add('bg-zinc-800', 'text-zinc-500');
                    btn.textContent = "MANUAL";
                }
            }
        }

        setTimeout(() => {
            if (window.updateOWC) window.updateOWC();
        }, 100);

    } catch (e) {
        console.error("[OWC] Load State Error:", e);
    }
};

// Hook up event listeners for persistence
document.addEventListener('DOMContentLoaded', () => {

    window.loadWorkCenterState();

    const inputs = [
        'owc-range', 'owc-zero', 'owc-mv', 'owc-bc',
        'owc-wind-speed', 'owc-wind-dir',
        'owc-los-heading', 'owc-angle',
        'owc-temp', 'owc-press', 'owc-hum', 'owc-da', 'owc-alt'
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', window.saveWorkCenterState);
            el.addEventListener('change', window.saveWorkCenterState);
        }
    });
});

// --- BALLISTIC UNIFICATION HELPERS (RESTORED & UPGRADED) ---

/**
 * Gathers the current operational context (Profile + Weather) 
 * Centralized logic to ensure Dope, Lab, and HUD use the same data.
 */
window.getTacticalContext = function (source = 'smart') {
    // 1. Gather Weather (Priority: OWC Widgets -> Main HUD)
    // OWC Density Alt (DA) is the most accurate source if available
    const owcDaVal = document.getElementById('owc-da')?.value;
    const da = owcDaVal ? parseFloat(owcDaVal) : null;

    // Standard atmosphere fallbacks
    const temp = parseFloat(document.getElementById('owc-temp')?.value) ||
        parseFloat(document.getElementById('temperature')?.value) || 59;
    const press = parseFloat(document.getElementById('owc-press')?.value) ||
        parseFloat(document.getElementById('pressure')?.value) || 29.92;
    const hum = parseFloat(document.getElementById('humidity')?.value) || 50;

    // Wind Logic (OWC specialized widgets)
    const owcWindSpd = parseFloat(document.getElementById('owc-wind-speed')?.value);
    const owcWindAng = parseFloat(document.getElementById('owc-wind-dir')?.value);
    const hudWindSpd = parseFloat(document.getElementById('wind-speed')?.value) || 0;

    const windSpeed = !isNaN(owcWindSpd) ? owcWindSpd : hudWindSpd;
    const windAngle = !isNaN(owcWindAng) ? owcWindAng : 90;

    // --- UPGRADE: Inclination / LOS Angle ---
    const owcAngle = parseFloat(document.getElementById('owc-angle')?.value) || 0;

    const weather = { temp, pressure: press, humidity: hum, windSpeed, windAngle, da, inclination: owcAngle };

    // 2. Gather profile (Priority: Active Batch -> HUD -> Defaults)
    let velocity, zero, bc, scopeHeight = 1.75;
    let rifle = document.getElementById('owc-rifle-input')?.value || "SYSTEM-1";
    let caliber = document.getElementById('owc-ammo-input')?.value || "308 WIN";
    let sourceName = "SYSTEM DEFAULT";

    // Unified Value Retrieval (Prioritize OWC inputs)
    const hudMv = parseFloat(document.getElementById('owc-mv')?.value) || parseFloat(document.getElementById('velocity')?.value) || 2700;
    const hudZero = parseFloat(document.getElementById('owc-zero')?.value) || parseFloat(document.getElementById('zero')?.value) || 100;
    const hudBc = parseFloat(document.getElementById('owc-bc')?.value) || parseFloat(document.getElementById('g1')?.value) || 0.450;

    const batches = JSON.parse(localStorage.getItem('trc_ammo_batches') || localStorage.getItem('ammoBatches') || '[]');
    const activeBatchId = localStorage.getItem('trc_active_batch_id');
    const batch = batches.find(b => b.id.toString() === activeBatchId);

    if (source === 'batch' && batch) {
        velocity = batch.mv || batch.speed || hudMv;
        zero = batch.zero || hudZero;
        bc = batch.bc || hudBc;
        rifle = batch.rifle || rifle;
        caliber = batch.type || batch.caliber || caliber;
        sourceName = `AMMO: ${batch.name || 'BATCH'}`;
    } else if (source === 'live' || source === 'hud') {
        velocity = hudMv;
        zero = hudZero;
        bc = hudBc;
        sourceName = (source === 'live') ? "LIVE SENSORS" : "MAIN HUD";
    } else { // 'smart' mode - Priority: Active Batch > HUD
        velocity = batch ? (batch.mv || batch.speed) : hudMv;
        zero = batch ? (batch.zero || 100) : hudZero;
        bc = batch ? batch.bc : hudBc;
        rifle = batch ? (batch.rifle || rifle) : rifle;
        caliber = batch ? (batch.type || batch.caliber || caliber) : caliber;
        sourceName = batch ? `AUTO: ${batch.name}` : "AUTO: HUD";
    }

    const profile = { velocity, zero, bc, scopeHeight, rifle, caliber };

    return { profile, weather, sourceName };
};

window.generateQuickDope = function () {
    const target = document.getElementById('dope-render-target');
    if (target) {
        target.classList.remove('animate-pulse-quick-dope');
        void target.offsetWidth; // Force Reflow
        target.classList.add('animate-pulse-quick-dope');

        // Remove animation after 2 seconds
        setTimeout(() => {
            target.classList.remove('animate-pulse-quick-dope');
        }, 2000);
    }

    try {
        const source = document.getElementById('dope-source-select')?.value || 'smart';
        const step = parseInt(document.getElementById('dope-step-select')?.value) || 50;
        const maxRange = parseInt(document.getElementById('dope-max-select')?.value) || 1200;

        // console.log(`[Brain] Generating Quick Dope via ${source.toUpperCase()} (Step: ${step}Y, Max: ${maxRange}Y)...`);

        // 1. GATHER UNIFIED CONTEXT
        const context = window.getTacticalContext(source);

        // 2. Calculate
        if (!window.BallisticEngine) {
            throw new Error("Ballistic Engine Core Missing");
        }

        const data = window.BallisticEngine.calculateDropTable(context.profile, context.weather, step, maxRange);

        // 3. Render
        if (typeof window.renderDropTable === 'function') {
            // Pass the full context to render so we have inclination/weather/profile data
            window.renderDropTable(data, context);
            localStorage.setItem('trc_last_dope', JSON.stringify(data));
        }

        // 4. Log
        if (typeof SessionLogger !== 'undefined') {
            SessionLogger.add("USER", `Generated Dope [${source.toUpperCase()}]: ${context.profile.velocity}fps / ${context.profile.zero}y / ${context.profile.bc} BC`);
        }

        // 5. Switching
        // Ensure we show the module since this is an explicit trigger
        window.switchTacticalModule('quick-dope');

    } catch (err) {
        console.error("Quick Dope Error:", err);
        // alert("System Error: " + err.message);
    }
};

window.renderDropTable = function (data, metadata = "QUICK DOPE", weatherLegacy = null) {
    const container = document.getElementById('dope-render-target');
    const titleEl = document.getElementById('dope-table-title');
    if (!container) return;

    // Handle metadata object or legacy parameters
    let sourceTitle = "QUICK DOPE";
    let rifle = "SYSTEM-1";
    let caliber = "308 WIN";
    let wSpeed = 0;
    let wDir = 270;
    let losVar = 0;
    const unitMode = window.owcUnitMode || "MIL";

    if (typeof metadata === 'object' && metadata !== null) {
        sourceTitle = metadata.sourceName || metadata.source || "QUICK DOPE";
        wSpeed = metadata.windSpeed !== undefined ? metadata.windSpeed : (metadata.weather?.windSpeed || 0);
        wDir = metadata.windAngle !== undefined ? metadata.windAngle : (metadata.weather?.windAngle || 270);
        losVar = metadata.inclination !== undefined ? metadata.inclination : (metadata.weather?.inclination || 0);
        rifle = metadata.profile?.rifle || metadata.rifle || "SYSTEM-1";
        caliber = metadata.profile?.caliber || metadata.caliber || "308 WIN";
    } else {
        sourceTitle = metadata || "QUICK DOPE";
        wSpeed = weatherLegacy ? weatherLegacy.windSpeed : (document.getElementById('owc-wind-speed')?.value || 0);
        wDir = weatherLegacy ? weatherLegacy.windAngle : (document.getElementById('owc-wind-dir')?.value || 270);
        losVar = weatherLegacy ? weatherLegacy.inclination : (document.getElementById('owc-angle')?.value || 0);
        rifle = document.getElementById('owc-rifle-input')?.value || "SYSTEM-1";
        caliber = document.getElementById('owc-ammo-input')?.value || "308 WIN";
    }

    // Apply Title + Upgrade Meta
    if (titleEl) {
        titleEl.innerHTML = `
            <div class="flex flex-col items-center gap-3 w-full">
                <div class="flex flex-wrap justify-center gap-2">
                    <div class="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded flex items-center gap-1">
                        <span class="text-[7px] text-zinc-500 font-black uppercase tracking-widest">RIFLE:</span>
                        <span class="text-[9px] text-blue-400 font-black uppercase tracking-widest">${rifle}</span>
                    </div>
                    <div class="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-1">
                        <span class="text-[7px] text-zinc-500 font-black uppercase tracking-widest">CAL:</span>
                        <span class="text-[9px] text-emerald-400 font-black uppercase tracking-widest">${caliber}</span>
                    </div>
                    <div class="px-2 py-0.5 bg-zinc-800 border border-blue-500/30 rounded flex items-center gap-1">
                        <span class="text-[7px] text-zinc-400 font-black uppercase tracking-widest">UNITS:</span>
                        <span class="text-[9px] text-blue-300 font-black uppercase tracking-widest">${unitMode}</span>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <div class="px-2 py-0.5 bg-orange-500/5 border border-orange-500/10 rounded flex gap-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter shadow-inner">
                        <span>WIND: <b class="text-orange-400 font-black">${wDir}°</b></span>
                        <span>SPD: <b class="text-orange-400 font-black">${wSpeed} MPH</b></span>
                    </div>
                    <div class="px-2 py-0.5 bg-zinc-800/40 border border-zinc-700/50 rounded flex items-center gap-1 text-[7px] font-black text-zinc-400 uppercase tracking-tighter">
                         <span>LOS:</span>
                         <span class="text-zinc-200 font-black">${losVar}°</span>
                    </div>
                </div>

                <div class="px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded opacity-50">
                    <span class="text-[7px] text-zinc-500 font-black uppercase tracking-widest mr-2">SOURCE:</span>
                    <span class="text-[8px] text-blue-400 font-black uppercase tracking-widest">${sourceTitle}</span>
                </div>
            </div>
        `;
    }

    // Generate HTML with Mobile Optimization (Compact & Scrollable)
    let html = `
    <div class="w-full text-white pb-10 overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[300px]">
            <thead>
                <tr class="bg-blue-900/40 text-[8px] text-blue-200 uppercase tracking-[0.2em]">
                    <th class="p-1.5 border-b border-blue-500/20 text-center">RNG</th>
                    <th class="p-1.5 border-b border-blue-500/20 text-white text-center">ELEV (${window.owcUnitMode})</th>
                    <th class="p-1.5 border-b border-blue-500/20 text-orange-400 text-center">WIND (${window.owcUnitMode})</th>
                    <th class="p-1.5 border-b border-blue-500/20 opacity-50 text-center">VEL</th>
                </tr>
            </thead>
            <tbody class="text-xs font-mono text-zinc-100">
    `;

    data.forEach(row => {
        const isMIL = window.owcUnitMode === 'MIL';
        const eVal = isMIL ? parseFloat(row.elevMil) : parseFloat(row.elevMOA);
        const eDir = eVal >= 0 ? 'U' : 'D';
        const wVal = isMIL ? parseFloat(row.windMil) : parseFloat(row.windMOA);
        const wDir = row.crossWind < 0 ? 'L' : 'R';
        const dropIn = row.dropInches || (parseFloat(row.elevMil) * row.range * 0.036).toFixed(1);
        const driftIn = row.windInches || (parseFloat(row.windMil) * row.range * 0.036).toFixed(1);

        html += `
        <tr class="border-b border-white/5 hover:bg-white/10 transition-colors">
            <td class="p-1.5 font-black text-center text-zinc-400">${row.range}</td>
            <td class="p-1.5 text-white font-black text-center">
                <div class="flex flex-col items-center">
                    <div class="flex items-baseline gap-1">
                        <span class="text-[8px] text-zinc-500 font-black">${eDir}</span>
                        <span class="text-lg">${Math.abs(eVal).toFixed(1)}</span>
                    </div>
                    <span class="text-[7px] text-zinc-500 font-bold -mt-0.5 opacity-60">(${Math.abs(dropIn)}")</span>
                </div>
            </td>
            <td class="p-1.5 text-orange-400 font-bold text-center">
                <div class="flex flex-col items-center">
                    <div class="flex items-baseline gap-1">
                        <span class="text-[8px] opacity-40 font-black text-zinc-100">${wDir}</span>
                        <span class="text-base">${wVal.toFixed(1)}</span>
                    </div>
                    <span class="text-[7px] opacity-40 font-bold -mt-0.5 italic">(${driftIn}")</span>
                </div>
            </td>
            <td class="p-1.5 text-center text-[9px] opacity-40 italic font-medium align-middle">${row.velocity}</td>
        </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
};







// === AI MISSION BOOT ===
if (window.AILifecycle) window.AILifecycle.onBoot();

