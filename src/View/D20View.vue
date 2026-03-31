<template>
  <div class="roller-root">
    <!-- SETUP SCREEN -->
    <div v-if="!isLaunched" class="roller-container setup-screen">
      <div class="setup-title">⚔ D20 Roller</div>
      <div class="setup-sub">Fate Awaits</div>

      <div class="field-group">
        <label class="field-label" for="player-name">Your Name</label>
        <input class="field-input" id="player-name" v-model="playerName" type="text"
          placeholder="e.g. Thorin Oakenshield" maxlength="24" autocomplete="off" />
      </div>

      <div class="field-group">
        <label class="field-label">Dice Color</label>
        <div class="color-grid">
          <div v-for="(c, i) in COLORS" :key="i" class="color-swatch"
            :class="{ selected: selectedColor.name === c.name }" :style="{ background: c.hex }" :title="c.name"
            @click="selectedColor = c" />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="session-id">
          Session ID <span class="session-id-hint">(for OBS URL)</span>
        </label>
        <input class="field-input" id="session-id" v-model="sessionId" type="text" placeholder="e.g. player1"
          autocomplete="off" />
        <div class="session-hint">OBS URL: ?id=player1&amp;name=Thorin&amp;color=Sapphire</div>
      </div>

      <button class="btn-begin" @click="beginRolling">⚡ Begin Rolling</button>
    </div>

    <!-- ROLLER SCREEN -->
    <div v-show="isLaunched" class="roller-container" :class="{ 'nat1-shake': isNat1Shaking }">
      <div class="player-nameplate">{{ currentName || 'Adventurer' }}</div>

      <div class="dice-wrap" :class="{ rolling: isRolling }" :style="{ '--dice-color': selectedColor.hex }"
        @click="doRoll">
        <svg ref="diceSvg" class="dice-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <polygon class="dice-face-fill" points="100,10 145,52 100,75 55,52" />
          <polygon class="dice-face-dark" points="55,52 100,75 70,118 22,80" />
          <polygon class="dice-face-mid" points="145,52 178,80 130,118 100,75" />
          <polygon class="dice-face-dark" points="22,80 70,118 55,165 12,125" />
          <polygon class="dice-face-fill" points="178,80 188,125 145,165 130,118" />
          <polygon class="dice-face-mid" points="12,125 55,165 100,148 60,108" />
          <polygon class="dice-face-dark" points="188,125 140,108 100,148 145,165" />
          <polygon class="dice-face-mid" points="55,165 100,148 145,165 100,190" />
          <polyline class="dice-edge" points="100,10 145,52 100,75 55,52 100,10" />
          <line class="dice-edge" x1="100" y1="75" x2="100" y2="148" />
          <polyline class="dice-edge" points="55,52 22,80 70,118 100,75 130,118 178,80 145,52" />
          <polyline class="dice-edge" points="22,80 12,125 55,165 100,148 145,165 188,125 178,80" />
          <polyline class="dice-edge" points="70,118 55,165 100,190 145,165 130,118" />
          <text class="dice-number" x="100" y="108" text-anchor="middle" dominant-baseline="middle">
            {{ tickerNumber }}
          </text>
        </svg>

        <!-- Nat 20 sparkle rings -->
        <div v-for="ring in sparkleRings" :key="ring.id" class="sparkle-ring"
          :style="{ animationDelay: ring.delay + 's' }" />
      </div>

      <div class="result-display">
        <div class="result-number" :class="{
          visible: resultVisible,
          nat20: lastRoll === 20,
          nat1: lastRoll === 1,
        }">
          {{ lastRoll ?? '—' }}
        </div>
        <div class="result-label" :class="{ visible: resultVisible }">{{ resultLabel }}</div>
      </div>

      <button class="roll-btn" :disabled="isRolling" @click="doRoll">🎲 Roll The Die</button>
      <div class="session-badge">{{ sessionId ? `Session: ${sessionId}` : '' }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ── COLORS ──
const COLORS = [
  { name: 'Sapphire', hex: '#4a90d9' },
  { name: 'Crimson', hex: '#c0392b' },
  { name: 'Emerald', hex: '#27ae60' },
  { name: 'Amethyst', hex: '#8e44ad' },
  { name: 'Obsidian', hex: '#2c3e50' },
  { name: 'Amber', hex: '#e67e22' },
  { name: 'Ivory', hex: '#d5c8a8' },
  { name: 'Rose', hex: '#e91e8c' },
  { name: 'Teal', hex: '#16a085' },
  { name: 'Onyx', hex: '#1a1a2e' },
]

const route = useRoute()
const router = useRouter()

// ── STATE ──
const isLaunched = ref(false)
const playerName = ref('')
const sessionId = ref('')
const selectedColor = ref(COLORS[0])
const currentName = ref('')

const isRolling = ref(false)
const tickerNumber = ref(20)
const lastRoll = ref(null)
const resultVisible = ref(false)
const resultLabel = ref('Roll Result')
const isNat1Shaking = ref(false)
const sparkleRings = ref([])

let flickInterval = null
let ringIdCounter = 0

// ── BROADCAST CHANNEL (replaces localStorage — works with OBS) ──
const channel = ref(null)

function openChannel(id) {
  if (channel.value) channel.value.close()
  channel.value = new BroadcastChannel('d20_' + id)
  channel.value.onmessage = (e) => onRollReceived(e.data)
}

// ── INIT from URL params ──
onMounted(() => {
  const urlName = route.query.name
  const urlColor = route.query.color
  const urlId = route.query.id

  if (urlId) sessionId.value = urlId
  if (urlName) playerName.value = urlName
  if (urlColor) {
    const match = COLORS.find(
      (c) => c.name.toLowerCase() === urlColor.toLowerCase() || c.hex === urlColor,
    )
    if (match) selectedColor.value = match
  }

  // Auto-launch if id or name provided (OBS direct-load, skips setup screen)
  if (urlId || urlName) {
    if (!playerName.value) playerName.value = urlName || 'Player'
    if (!sessionId.value) sessionId.value = urlId || 'obs'
    launchRoller()
  }
})

onUnmounted(() => {
  channel.value?.close()
  if (flickInterval) clearInterval(flickInterval)
})

// ── LAUNCH ──
function beginRolling() {
  if (!playerName.value.trim()) return
  if (!sessionId.value.trim()) {
    sessionId.value = 'player' + Math.floor(Math.random() * 9999)
  }
  launchRoller()
}

function launchRoller() {
  currentName.value = playerName.value.trim() || 'Adventurer'
  isLaunched.value = true

  // Open the broadcast channel keyed to this session
  openChannel(sessionId.value)

  // Update URL for OBS bookmarking
  router.replace({
    query: {
      id: sessionId.value,
      name: currentName.value,
      color: selectedColor.value.name,
    },
  })
}

// ── ROLL ──
function doRoll() {
  if (isRolling.value) return
  isRolling.value = true
  resultVisible.value = false
  isNat1Shaking.value = false
  sparkleRings.value = []

  const final = Math.ceil(Math.random() * 20)

  flickInterval = setInterval(() => {
    tickerNumber.value = Math.ceil(Math.random() * 20)
  }, 80)

  setTimeout(() => {
    clearInterval(flickInterval)
    flickInterval = null

    tickerNumber.value = final
    lastRoll.value = final
    resultVisible.value = true
    isRolling.value = false

    if (final === 20) {
      resultLabel.value = '⚡ NATURAL 20!'
      spawnSparkle()
    } else if (final === 1) {
      resultLabel.value = '💀 CRITICAL FAIL'
      setTimeout(() => {
        isNat1Shaking.value = true
        setTimeout(() => { isNat1Shaking.value = false }, 600)
      }, 10)
    } else {
      resultLabel.value = 'Roll Result'
    }

    // ── Broadcast to OBS browser source via BroadcastChannel ──
    channel.value?.postMessage({
      name: currentName.value,
      value: final,
      color: selectedColor.value.hex,
    })
  }, 1450)
}

// ── SPARKLE ──
function spawnSparkle() {
  for (let i = 0; i < 3; i++) {
    const id = ++ringIdCounter
    sparkleRings.value.push({ id, delay: i * 0.15 })
    setTimeout(
      () => { sparkleRings.value = sparkleRings.value.filter((r) => r.id !== id) },
      1000 + i * 150,
    )
  }
}

// ── RECEIVE ROLL from another tab (OBS overlay listening to controller tab) ──
function onRollReceived(data) {
  if (!data) return

  const match = COLORS.find((c) => c.hex === data.color)
  if (match) selectedColor.value = match
  currentName.value = data.name
  resultVisible.value = false
  sparkleRings.value = []

  // Play the full animation in the OBS window too
  isRolling.value = true
  let ticks = 0
  const flick = setInterval(() => {
    tickerNumber.value = Math.ceil(Math.random() * 20)
    if (++ticks >= 17) {
      clearInterval(flick)
      tickerNumber.value = data.value
      lastRoll.value = data.value
      resultVisible.value = true
      isRolling.value = false

      if (data.value === 20) {
        resultLabel.value = '⚡ NATURAL 20!'
        spawnSparkle()
      } else if (data.value === 1) {
        resultLabel.value = '💀 CRITICAL FAIL'
        isNat1Shaking.value = true
        setTimeout(() => { isNat1Shaking.value = false }, 600)
      } else {
        resultLabel.value = 'Roll Result'
      }
    }
  }, 80)
}
</script>

<style scoped>
/* ── ROOT ── */
.roller-root {
  --gold: #c9922a;
  --gold-bright: #f0c060;
  --gold-dim: #7a5318;
  --red: #c0392b;
  --red-bright: #e74c3c;
  --white: #f5f0e8;
  --muted: #8a7a60;
  --glow: rgba(201, 146, 42, 0.5);
  --panel: rgba(10, 6, 20, 0.88);
  --panel-border: rgba(180, 130, 60, 0.45);
  --dice-color: #4a90d9;

  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: transparent;
  font-family: 'Cinzel', serif;
  overflow: hidden;
}

/* ── SHARED CONTAINER ── */
.roller-container {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  box-shadow:
    0 0 60px rgba(0, 0, 0, 0.7),
    0 0 20px var(--glow) inset;
  position: relative;
  overflow: hidden;
}

.roller-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9922a' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.6;
}

/* ── SETUP SCREEN ── */
.setup-screen {
  padding: 40px 48px;
  width: 360px;
}

.setup-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 22px;
  font-weight: 900;
  color: var(--gold-bright);
  text-align: center;
  letter-spacing: 3px;
  margin-bottom: 8px;
  text-shadow: 0 0 20px var(--glow);
}

.setup-sub {
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 36px;
}

.field-group {
  margin-bottom: 22px;
}

.field-label {
  display: block;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 8px;
}

.session-id-hint {
  color: var(--muted);
  font-size: 9px;
}

.field-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  padding: 11px 14px;
  color: var(--white);
  font-family: 'Cinzel', serif;
  font-size: 14px;
  letter-spacing: 1px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 12px rgba(201, 146, 42, 0.25);
}

.session-hint {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 1px;
  margin-top: 6px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.selected {
  border-color: var(--gold-bright);
  box-shadow: 0 0 10px var(--glow);
  transform: scale(1.12);
}

.btn-begin {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #7a5318, var(--gold) 50%, #7a5318);
  border: 1px solid var(--gold-bright);
  border-radius: 8px;
  color: #1a0e00;
  font-family: 'Cinzel Decorative', serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  transition: box-shadow 0.2s, filter 0.2s;
}

.btn-begin:hover {
  box-shadow: 0 0 24px var(--glow);
  filter: brightness(1.15);
}

.btn-begin:active {
  filter: brightness(0.9);
}

/* ── ROLLER SCREEN ── */
.roller-container:not(.setup-screen) {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 48px;
  gap: 0;
}

.player-nameplate {
  font-family: 'Cinzel Decorative', serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--gold-bright);
  letter-spacing: 4px;
  text-transform: uppercase;
  text-shadow: 0 0 18px var(--glow);
  margin-bottom: 18px;
  text-align: center;
}

/* ── DICE ── */
.dice-wrap {
  width: 200px;
  height: 200px;
  position: relative;
  cursor: pointer;
  margin-bottom: 14px;
}

.dice-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 18px var(--dice-color));
  transition: filter 0.3s;
}

.dice-face-fill {
  fill: var(--dice-color);
  transition: fill 0.4s;
}

.dice-face-dark {
  fill: color-mix(in srgb, var(--dice-color) 60%, #000);
  transition: fill 0.4s;
}

.dice-face-mid {
  fill: color-mix(in srgb, var(--dice-color) 80%, #000);
  transition: fill 0.4s;
}

.dice-edge {
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 1.2;
  fill: none;
}

.dice-number {
  fill: rgba(255, 255, 255, 0.92);
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 40px;
}

@keyframes bounce-roll {
  0% {
    transform: translateY(0) rotate(0deg);
  }

  15% {
    transform: translateY(-30px) rotate(72deg);
  }

  30% {
    transform: translateY(8px) rotate(144deg);
  }

  45% {
    transform: translateY(-18px) rotate(216deg);
  }

  60% {
    transform: translateY(4px) rotate(288deg);
  }

  75% {
    transform: translateY(-8px) rotate(330deg);
  }

  88% {
    transform: translateY(2px) rotate(355deg);
  }

  100% {
    transform: translateY(0) rotate(360deg);
  }
}

.dice-wrap.rolling .dice-svg {
  animation: bounce-roll 1.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
  filter: drop-shadow(0 0 28px var(--dice-color)) blur(0.5px);
}

@keyframes sparkle-out {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }

  60% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}

.sparkle-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 3px solid #ffd700;
  animation: sparkle-out 0.8s ease-out forwards;
  pointer-events: none;
}

/* ── RESULT ── */
.result-display {
  min-height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.result-number {
  font-family: 'Cinzel Decorative', serif;
  font-size: 82px;
  font-weight: 900;
  line-height: 1;
  color: var(--white);
  text-shadow: 0 0 30px var(--glow);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.result-number.visible {
  opacity: 1;
  transform: scale(1);
}

.result-number.nat20 {
  color: #ffd700;
  text-shadow: 0 0 40px #ffd700, 0 0 80px #ff9900;
}

.result-number.nat1 {
  color: var(--red-bright);
  text-shadow: 0 0 40px var(--red);
}

.result-label {
  font-size: 10px;
  letter-spacing: 4px;
  color: var(--muted);
  text-transform: uppercase;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.4s 0.2s;
}

.result-label.visible {
  opacity: 1;
}

/* ── ROLL BUTTON ── */
.roll-btn {
  margin-top: 20px;
  padding: 16px 48px;
  background: linear-gradient(135deg, #4a1a00, #8b3a0a 50%, #4a1a00);
  border: 1px solid var(--gold);
  border-radius: 8px;
  color: var(--gold-bright);
  font-family: 'Cinzel Decorative', serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 4px;
  cursor: pointer;
  transition: box-shadow 0.2s, filter 0.2s;
}

.roll-btn:hover {
  box-shadow: 0 0 28px rgba(201, 146, 42, 0.5);
  filter: brightness(1.2);
}

.roll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: none;
  box-shadow: none;
}

/* ── NAT 1 SHAKE ── */
@keyframes fail-shake {

  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-12px);
  }

  40% {
    transform: translateX(12px);
  }

  60% {
    transform: translateX(-8px);
  }

  80% {
    transform: translateX(8px);
  }
}

.nat1-shake {
  animation: fail-shake 0.5s ease;
}

/* ── SESSION BADGE ── */
.session-badge {
  font-size: 9px;
  letter-spacing: 2px;
  color: rgba(138, 122, 96, 0.5);
  text-transform: uppercase;
  margin-top: 18px;
  font-family: 'Cinzel', serif;
}
</style>