<template>
  <div v-if="!isLaunched" id="setup-screen" class="roller-container">
    <div class="setup-title">⚔ D20 Roller</div>
    <div class="setup-sub">Fate Awaits</div>

    <div class="field-group">
      <label class="field-label" for="player-name">Your Name</label>
      <input
        class="field-input"
        id="player-name"
        type="text"
        placeholder="e.g. Thorin Oakenshield"
        maxlength="24"
        autocomplete="off"
      />
    </div>

    <div class="field-group">
      <label class="field-label">Dice Color</label>
      <div class="color-grid" id="color-grid"></div>
    </div>

    <div class="field-group">
      <label class="field-label" for="session-id"
        >Session ID <span style="color: var(--muted); font-size: 9px">(for OBS URL)</span></label
      >
      <input
        class="field-input"
        id="session-id"
        type="text"
        placeholder="e.g. player1"
        autocomplete="off"
      />
    </div>

    <button class="btn-begin" id="begin-btn">⚡ Begin Rolling</button>
  </div>

  <div v-show="isLaunched" id="roller-screen" class="roller-container">
    <div class="player-nameplate" id="player-nameplate">Adventurer</div>

    <div id="dice-wrap">
      <svg id="dice-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
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
        <text
          id="dice-face-number"
          class="dice-number"
          x="100"
          y="108"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          20
        </text>
      </svg>
    </div>

    <div id="result-display">
      <div id="result-number">—</div>
      <div id="result-label">Roll Result</div>
    </div>

    <button id="roll-btn">🎲 Roll The Die</button>
    <div id="session-badge"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const isLaunched = ref(false)
const route = useRoute()
const router = useRouter()

onMounted(() => {
  // Insert the logic from your d20-roller.html script here.
  // Use the established COLORS, applyDiceColor, launchRoller, and doRoll functions.
  //

  // To support OBS sync, ensure the storage event listener is active:
  window.addEventListener('storage', (e) => {
    // This allows one window to update when another rolls
  })
})
</script>

<style scoped>
/* Paste the CSS from your <style> block in d20-roller.html here. */
/* Replace 'body' styles with a container class like .roller-container. */
/* */
</style>
