// ===== PHASE 3: ADVANCED MEASUREMENT FEATURES =====

// Toggle between height and width measurement
window.toggleDimension = function () {
    measurementDimension = measurementDimension === 'height' ? 'width' : 'height';
    const btn = document.getElementById('dimension-toggle-btn');
    if (btn) {
        btn.textContent = measurementDimension === 'height' ? 'H' : 'W';
        btn.style.backgroundColor = measurementDimension === 'height' ? '#3f3f46' : '#7c3aed'; // zinc-700 or violet-600
    }

    // Recalculate if measurement exists
    if (measureStart && measureEnd) {
        calculateMilMoa();
    }

    console.log("[MEASURE] Dimension switched to:", measurementDimension);
};

// Set target size from preset buttons
window.setTargetSize = function (size) {
    const input = document.getElementById('target-size-input');
    if (input) {
        input.value = size;
        calculateRange();
        console.log("[PRESET] Target size set to:", size, "inches");
    }
};

// Enhanced range calculation with warnings
window.calculateRange = function () {
    const targetSizeInput = document.getElementById('target-size-input');
    const targetSize = parseFloat(targetSizeInput.value);

    console.log("[RANGE] Calculate called - Target size:", targetSize, "MIL:", currentMilReading);

    if (!targetSize || !currentMilReading || currentMilReading === 0) {
        document.getElementById('calculated-range').textContent = '--';
        document.getElementById('range-status').textContent = '';
        console.log("[RANGE] Missing data, cannot calculate");
        return;
    }

    // MIL formula: Range (yards) = (Target Size in inches / MIL reading) / 27.78
    const rangeYards = (targetSize / currentMilReading) / 27.78;

    console.log("[RANGE] Calculated:", rangeYards, "yards");

    // Show decimals for close ranges (under 10 yards)
    const displayRange = rangeYards < 10 ? rangeYards.toFixed(2) : Math.round(rangeYards);
    document.getElementById('calculated-range').textContent = displayRange;

    // Range status warnings
    const statusEl = document.getElementById('range-status');
    if (rangeYards < 50) {
        statusEl.textContent = '⚠️ TOO CLOSE';
        statusEl.className = 'text-[7px] font-black text-red-500';
    } else if (rangeYards >= 100 && rangeYards <= 800) {
        statusEl.textContent = '✓ OPTIMAL';
        statusEl.className = 'text-[7px] font-black text-green-500';
    } else if (rangeYards > 800) {
        statusEl.textContent = '⚠️ EXTREME';
        statusEl.className = 'text-[7px] font-black text-yellow-500';
    } else {
        statusEl.textContent = '';
    }

    // Store in current target data
    if (currentTargetData) {
        currentTargetData.milReading = currentMilReading;
        currentTargetData.targetSize = targetSize;
        currentTargetData.range = rangeYards; // Store actual value, not rounded

        // Update in database
        updateTargetData(currentTargetData);
    }

    console.log("[RANGE] Calculated:", displayRange, "yards");
};

// Enhanced MIL/MOA calculation with dimension support
function calculateMilMoa() {
    if (!measureStart || !measureEnd) return;

    const boxWidth = Math.abs(measureEnd.x - measureStart.x);
    const boxHeight = Math.abs(measureEnd.y - measureStart.y);

    // Use selected dimension
    const boxDimension = measurementDimension === 'height' ? boxHeight : boxWidth;
    const imageDimension = measurementDimension === 'height' ? window.imageHeight : window.imageWidth;

    const cameraFOV = 65; // degrees

    // Calculate MIL reading based on box dimension relative to image dimension
    const dimensionRatio = boxDimension / imageDimension;
    const angularSize = dimensionRatio * cameraFOV; // degrees

    // Convert to MIL (1 MIL = 3.6 MOA = 0.0573 degrees)
    const milReading = (angularSize / 0.0573);
    const moaReading = milReading * 3.6;

    currentMilReading = milReading;

    // Display readings
    document.getElementById('mil-value').textContent = milReading.toFixed(2);
    document.getElementById('moa-value').textContent = moaReading.toFixed(2);
    document.getElementById('mil-reading-display').classList.remove('hidden');

    // Auto-calculate range if target size is entered
    calculateRange();

    console.log("[MEASURE] MIL:", milReading.toFixed(2), "MOA:", moaReading.toFixed(2), "Dimension:", measurementDimension);
}

console.log("[PHASE 3] Advanced measurement features loaded");
