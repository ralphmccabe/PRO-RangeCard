const CARD_TEMPLATES = {
    // 1. STANDARD RELOADING PRO CARD
    'standard': `
        <div class="flex gap-4 h-[40%]">
            <!-- Column 1: Load Details -->
            <div id="display-group-reloading" class="grid grid-cols-4 gap-2 w-[40%] content-start transition-all duration-300">
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">TIMESTAMP</span><span id="display-time" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Zero Range</span><span id="display-zero" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Caliber</span><span id="display-caliber" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Bullet</span><span id="display-bullet" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Barrel</span><span id="display-barrel" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Powder</span><span id="display-powder" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Load (gr)</span><span id="display-load" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">C.O.L</span><span id="display-col" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Rings</span><span id="display-rings" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Primer</span><span id="display-primer" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Velocity</span><span id="display-velocity" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Target</span><span id="display-targetSize" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">G-1 BC</span><span id="display-g1" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Env</span><span id="display-environment-summary" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Temp</span><span id="display-temperature" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Humidity</span><span id="display-humidity" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Pressure</span><span id="display-pressure" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Wind</span><span id="display-wind-speed" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Cosine</span><span id="display-cosine" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Misc</span><span id="display-misc" class="text-blue-800 font-normal"></span></div>
                <div class="flex flex-col"><span class="text-[8px] text-gray-500 uppercase">Group</span><span id="display-groupSize" class="text-blue-800 font-normal"></span></div>
                
                <div class="col-span-3 mt-2 grid grid-cols-2 gap-4 bg-gray-50 p-2 border border-black rounded-sm">
                    <div class="flex justify-between"><span>ELEV:</span> <span id="display-elevation" class="text-blue-800 font-bold"></span></div>
                    <div class="flex justify-between"><span>HOLD:</span> <span id="display-hold-data" class="text-blue-800 font-bold"></span></div>
                    <div class="col-span-2 flex justify-between items-center bg-black text-white px-2 py-1 mt-1">
                        <span class="text-[10px] font-bold text-neon-green">FINAL DOPE:</span>
                        <span id="display-final-dope" class="text-lg font-bold"></span>
                    </div>
                </div>
            </div>

            <!-- Column 2: Equipment (Fixed Width) -->
            <div class="w-[20%] flex flex-col gap-2">
                <div class="border border-black p-1 h-8 flex items-center relative"><img src="./assets/rifle.png" class="h-6 w-auto opacity-50"><span id="display-rifle-notes" class="ml-2 text-[10px] font-bold"></span></div>
                <div class="border border-black p-1 h-8 flex items-center relative"><img src="./assets/scope.png" class="h-6 w-auto opacity-50"><span id="display-scope-notes" class="ml-2 text-[10px] font-bold"></span></div>
                <div class="border border-black p-1 h-8 flex items-center relative"><img src="./assets/binoculars.png" class="h-6 w-auto opacity-50"><span id="display-lrf-notes" class="ml-2 text-[10px] font-bold"></span></div>
                <div class="border border-black p-1 h-8 flex items-center relative"><img src="./assets/wind.png" class="h-6 w-auto opacity-50"><span id="display-wind-notes" class="ml-2 text-[10px] font-bold"></span></div>
                <div class="border border-black p-1 h-8 flex items-center relative"><img src="./assets/compass.png" class="h-6 w-auto opacity-50"><span id="display-direction-notes" class="ml-2 text-[10px] font-bold"></span></div>
                
                <!-- Target Data (T1-T3) -->
                <div class="border border-black p-1 mt-1 bg-gray-50 flex-1 overflow-visible">
                    <div class="text-[8px] font-bold border-b border-black mb-1 text-center bg-gray-200">TARGET DATA</div>
                    <div class="grid grid-cols-1 gap-y-1 text-[8px] leading-tight">
                         <div class="flex justify-between border-b border-gray-300"><span>T1:</span> <span><span id="display-shooting-angle"></span> / <span id="display-compass-range"></span></span></div>
                         <div class="flex justify-between border-b border-gray-300"><span>T2:</span> <span><span id="display-shooting-angle-2"></span> / <span id="display-compass-range-2"></span></span></div>
                         <div class="flex justify-between border-b border-gray-300"><span>T3:</span> <span><span id="display-shooting-angle-3"></span> / <span id="display-compass-range-3"></span></span></div>
                    </div>
                </div>

            </div>

            <!-- Column 3: Reticles (Flex Fill) -->
            <div class="flex-1 flex gap-4">
                <div class="flex flex-col items-center">
                    <div class="text-[8px] uppercase font-bold mb-1">HOLD</div>
                    <div class="relative w-[120px] h-[120px] border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <canvas id="canvas-hold" width="120" height="120" class="absolute inset-0 z-10"></canvas>
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-75"></div>
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-50"></div>
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-25"></div>
                        <div class="absolute inset-0 w-[1px] h-full bg-gray-200 left-1/2 -translate-x-1/2"></div>
                        <div class="absolute inset-0 h-[1px] w-full bg-gray-200 top-1/2 -translate-y-1/2"></div>
                    </div>
                    <span id="display-hold-grade" class="text-[8px] font-bold mt-1"></span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-[8px] uppercase font-bold mb-1">SHOT</div>
                    <div class="relative w-[120px] h-[120px] border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <canvas id="canvas-shot" width="120" height="120" class="absolute inset-0 z-10"></canvas>
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-75"></div>
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-50"></div>
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-25"></div>
                        <div class="absolute inset-0 w-[1px] h-full bg-gray-200 left-1/2 -translate-x-1/2"></div>
                        <div class="absolute inset-0 h-[1px] w-full bg-gray-200 top-1/2 -translate-y-1/2"></div>
                    </div>
                    <span id="display-shot-grade" class="text-[8px] font-bold mt-1"></span>
                </div>
            </div>
        </div>
        <hr class="border-black my-2">
        <!-- DOPE TABLE -->
        <div class="w-full flex-1 border border-black overflow-hidden flex flex-col">
            <div class="grid grid-cols-3 bg-black text-white text-[10px] font-bold text-center py-1">
                <div>CLICKS</div>
                <div>RANGE</div>
                <div>UD-LR</div>
            </div>
            <div id="display-dope-rows" class="flex-1 flex flex-col divide-y divide-black">
                <!-- Rows injected via JS -->
            </div>
        </div>
    `,

    // 2. SNIPER MISSION CARD
    'sniper': `
        <div class="flex gap-4 h-full">
            <!-- Left: Mission Data -->
            <div class="w-[45%] flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-4xl font-black uppercase tracking-tighter leading-none">MISSION\nDATA</h1>
                        <span class="text-[10px] italic text-gray-400">ProVersion</span>
                    </div>
                    <div class="flex flex-col text-right">
                        <span class="text-[10px] font-bold uppercase">NOTES :</span>
                        <div id="display-header-notes" class="text-xs font-mono"></div>
                    </div>
                </div>
                
                <hr class="border-2 border-black">

                <div class="grid grid-cols-2 gap-4">
                    <div class="border border-black p-2 bg-gray-50">
                        <span class="text-[8px] text-gray-400 uppercase">MISSION ID</span>
                        <div id="display-mission-id" class="text-lg font-mono font-bold text-blue-900"></div>
                    </div>
                    <div class="border border-black p-2 bg-gray-50">
                        <span class="text-[8px] text-gray-400 uppercase">TEAM ID</span>
                        <div id="display-team-id" class="text-lg font-mono font-bold text-blue-900"></div>
                    </div>
                </div>

                <div class="border border-black p-2 bg-gray-50 flex-1">
                    <span class="text-[8px] text-gray-400 uppercase">SECTOR OF FIRE / INSTRUCTIONS</span>
                    <div id="display-sector-fire" class="text-xs font-mono whitespace-pre-wrap mt-1"></div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div class="flex justify-between border-b border-black pb-1"><span>SNIPER:</span> <span id="display-sniper-name" class="text-blue-800"></span></div>
                    <div class="flex justify-between border-b border-black pb-1"><span>SPOTTER:</span> <span id="display-spotter-name" class="text-blue-800"></span></div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-black text-neon-green p-2 text-center rounded">
                        <div class="text-[8px] opacity-70">FREQUENCY</div>
                        <div id="display-radio-freq" class="font-bold"></div>
                    </div>
                    <div class="bg-black text-neon-green p-2 text-center rounded">
                        <div class="text-[8px] opacity-70">CALLSIGN</div>
                        <div id="display-callsign" class="font-bold"></div>
                    </div>
                </div>
            </div>

            <!-- Right: Equipment & Reticles -->
            <div class="flex-1 flex flex-col gap-4">
                 <!-- Reuse Standard Equipment Column Logic or Custom -->
                 <div class="grid grid-cols-2 gap-2">
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/rifle.png" class="h-5 w-auto opacity-50"><span id="display-rifle-notes" class="ml-2 text-[10px] font-bold"></span></div>
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/scope.png" class="h-5 w-auto opacity-50"><span id="display-scope-notes" class="ml-2 text-[10px] font-bold"></span></div>
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/binoculars.png" class="h-5 w-auto opacity-50"><span id="display-lrf-notes" class="ml-2 text-[10px] font-bold"></span></div>
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/wind.png" class="h-5 w-auto opacity-50"><span id="display-wind-notes" class="ml-2 text-[10px] font-bold"></span></div>
                 </div>

                 <!-- Target Data (T1-T3) -->
                 <div class="border border-black p-2 bg-gray-50">
                    <div class="text-[10px] font-bold border-b border-black mb-2 flex justify-between">
                        <span>TARGET DATA LIST</span>
                        <span class="text-[8px] font-normal uppercase opacity-70">Angle / Range</span>
                    </div>
                    <div class="grid grid-cols-1 gap-y-1 text-[10px] font-mono">
                         <div class="flex justify-between border-b border-gray-300"><span>T1:</span> <span class="font-bold text-blue-900"><span id="display-shooting-angle"></span> / <span id="display-compass-range"></span></span></div>
                         <div class="flex justify-between border-b border-gray-300"><span>T2:</span> <span class="font-bold text-blue-900"><span id="display-shooting-angle-2"></span> / <span id="display-compass-range-2"></span></span></div>
                         <div class="flex justify-between border-b border-gray-300"><span>T3:</span> <span class="font-bold text-blue-900"><span id="display-shooting-angle-3"></span> / <span id="display-compass-range-3"></span></span></div>
                    </div>
                 </div>



                 <!-- Reticles -->
                 <div class="flex justify-center gap-4 py-4 border-t border-b border-gray-200">
                    <div class="relative w-[120px] h-[120px] border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <canvas id="canvas-hold" width="120" height="120" class="absolute inset-0 z-10"></canvas>
                        <!-- Targets -->
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-75"></div>
                        <div class="absolute inset-0 w-[1px] h-full bg-gray-200 left-1/2 -translate-x-1/2"></div>
                        <div class="absolute inset-0 h-[1px] w-full bg-gray-200 top-1/2 -translate-y-1/2"></div>
                    </div>
                    <div class="relative w-[120px] h-[120px] border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <canvas id="canvas-shot" width="120" height="120" class="absolute inset-0 z-10"></canvas>
                        <!-- Targets -->
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-75"></div>
                        <div class="absolute inset-0 w-[1px] h-full bg-gray-200 left-1/2 -translate-x-1/2"></div>
                        <div class="absolute inset-0 h-[1px] w-full bg-gray-200 top-1/2 -translate-y-1/2"></div>
                    </div>
                 </div>

                 <!-- Footer Info -->
                 <div class="mt-auto text-[10px] text-gray-400">
                    LOG START: <span id="display-date-sniper"></span> @ <span id="display-time"></span>
                 </div>
            </div>
        </div>
    `,
    // 3. SWAT / URBAN OPS CARD
    'swat': `
        <div class="flex gap-4 h-full">
            <!-- Left: Mission Data -->
            <div class="w-[45%] flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-4xl font-black uppercase tracking-tighter leading-none text-red-800">URBAN\nOPS</h1>
                        <span class="text-[10px] italic text-gray-400">Tactical Response</span>
                    </div>
                    <div class="flex flex-col text-right">
                        <span class="text-[10px] font-bold uppercase">NOTES :</span>
                        <div id="display-header-notes" class="text-xs font-mono"></div>
                    </div>
                </div>
                
                <hr class="border-2 border-red-900">

                <div class="grid grid-cols-2 gap-4">
                    <div class="border border-black p-2 bg-gray-50">
                        <span class="text-[8px] text-gray-400 uppercase">OPERATION ID</span>
                        <div id="display-mission-id" class="text-lg font-mono font-bold text-red-900"></div>
                    </div>
                    <div class="border border-black p-2 bg-gray-50">
                        <span class="text-[8px] text-gray-400 uppercase">TEAM / UNIT</span>
                        <div id="display-team-id" class="text-lg font-mono font-bold text-red-900"></div>
                    </div>
                </div>

                <div class="border border-black p-2 bg-gray-50 flex-1">
                    <span class="text-[8px] text-gray-400 uppercase">ROE / ENTRY ORDER</span>
                    <div id="display-sector-fire" class="text-xs font-mono whitespace-pre-wrap mt-1"></div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div class="flex justify-between border-b border-black pb-1"><span>ENTRY:</span> <span id="display-sniper-name" class="text-red-800"></span></div>
                    <div class="flex justify-between border-b border-black pb-1"><span>COVER:</span> <span id="display-spotter-name" class="text-red-800"></span></div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-black text-red-500 p-2 text-center rounded">
                        <div class="text-[8px] opacity-70">PRIMARY FREQ</div>
                        <div id="display-radio-freq" class="font-bold"></div>
                    </div>
                    <div class="bg-black text-red-500 p-2 text-center rounded">
                        <div class="text-[8px] opacity-70">CALLSIGN</div>
                        <div id="display-callsign" class="font-bold"></div>
                    </div>
                </div>
            </div>

            <!-- Right: Equipment & Reticles -->
            <div class="flex-1 flex flex-col gap-4">
                 <!-- Reuse Standard Equipment Column Logic or Custom -->
                 <div class="grid grid-cols-2 gap-2">
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/rifle.png" class="h-5 w-auto opacity-50"><span id="display-rifle-notes" class="ml-2 text-[10px] font-bold"></span></div>
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/scope.png" class="h-5 w-auto opacity-50"><span id="display-scope-notes" class="ml-2 text-[10px] font-bold"></span></div>
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/binoculars.png" class="h-5 w-auto opacity-50"><span id="display-lrf-notes" class="ml-2 text-[10px] font-bold"></span></div>
                    <div class="border border-black p-1 h-8 flex items-center"><img src="./assets/wind.png" class="h-5 w-auto opacity-50"><span id="display-wind-notes" class="ml-2 text-[10px] font-bold"></span></div>
                 </div>

                 <!-- Target Data (T1-T3) -->
                 <div class="border border-black p-2 bg-gray-50">
                    <div class="text-[10px] font-bold border-b border-black mb-2 flex justify-between text-red-900">
                        <span>TARGET / SECTOR DATA</span>
                        <span class="text-[8px] font-normal uppercase opacity-70">Deg / Yds</span>
                    </div>
                    <div class="grid grid-cols-1 gap-y-1 text-[10px] font-mono">
                         <div class="flex justify-between border-b border-gray-300"><span>T1:</span> <span class="font-bold text-red-900"><span id="display-shooting-angle"></span> / <span id="display-compass-range"></span></span></div>
                         <div class="flex justify-between border-b border-gray-300"><span>T2:</span> <span class="font-bold text-red-900"><span id="display-shooting-angle-2"></span> / <span id="display-compass-range-2"></span></span></div>
                         <div class="flex justify-between border-b border-gray-300"><span>T3:</span> <span class="font-bold text-red-900"><span id="display-shooting-angle-3"></span> / <span id="display-compass-range-3"></span></span></div>
                    </div>
                 </div>



                 <!-- Reticles -->
                 <div class="flex justify-center gap-4 py-4 border-t border-b border-gray-200">
                    <div class="relative w-[120px] h-[120px] border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <canvas id="canvas-hold" width="120" height="120" class="absolute inset-0 z-10"></canvas>
                        <!-- Targets -->
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-75"></div>
                        <div class="absolute inset-0 w-[1px] h-full bg-gray-200 left-1/2 -translate-x-1/2"></div>
                        <div class="absolute inset-0 h-[1px] w-full bg-gray-200 top-1/2 -translate-y-1/2"></div>
                    </div>
                    <div class="relative w-[120px] h-[120px] border border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <canvas id="canvas-shot" width="120" height="120" class="absolute inset-0 z-10"></canvas>
                        <!-- Targets -->
                        <div class="absolute inset-0 border border-gray-200 rounded-full scale-75"></div>
                        <div class="absolute inset-0 w-[1px] h-full bg-gray-200 left-1/2 -translate-x-1/2"></div>
                        <div class="absolute inset-0 h-[1px] w-full bg-gray-200 top-1/2 -translate-y-1/2"></div>
                    </div>
                 </div>

                 <!-- Footer Info -->
                 <div class="mt-auto text-[10px] text-gray-400">
                    LOG START: <span id="display-date-sniper"></span> @ <span id="display-time"></span>
                 </div>
            </div>
        </div>
    `
};

window.CARD_TEMPLATES = CARD_TEMPLATES;
