<template>
  <div class="bg3-tracker">

    <!-- ── Header ───────────────────────────────────────── -->
    <header class="tracker-header">
      <div class="header-deco">⸻◆⸻</div>
      <h1>Honour Mode Boss Tracker</h1>
      <p class="subtitle">Baldur's Gate III · Stream Companion</p>
      <p v-if="!isDev" class="readonly-notice">👁 View-only — live site</p>
      <span v-if="isActuallyDev" class="separator">|</span>
      <button
        v-if="isActuallyDev"
        class="filter-btn"
        :class="{ active: previewProd }"
        :style="previewProd ? { background: '#1a2a3a', color: '#6090c0', borderColor: '#3060a0' } : {}"
        @click="previewProd = !previewProd"
      >{{ previewProd ? '👁 Prod Preview' : 'Preview Prod' }}</button>
      <div class="header-deco">⸻◆⸻</div>
    </header>

    <!-- ── Stats bar ─────────────────────────────────────── -->
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-num">{{ stats.slainCount }}</span>
        <span class="stat-label">Slain</span>
      </div>
      <div class="stat">
        <span class="stat-num missed-num">{{ stats.missedCount }}</span>
        <span class="stat-label">Missed</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ stats.remaining }}</span>
        <span class="stat-label">Remaining</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ stats.majorLeft }}</span>
        <span class="stat-label">Major Left</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: stats.pct + '%' }" />
        </div>
        <span class="progress-pct">{{ stats.pct }}%</span>
      </div>
    </div>

    <!-- ── Filters ───────────────────────────────────────── -->
    <div class="controls">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: activeFilter === f.value }"
        @click="activeFilter = f.value"
      >{{ f.label }}</button>
      <span class="separator">|</span>
      <button v-if="isDev" class="reset-btn" @click="handleReset">Reset All</button>
      <span v-if="isDev" class="separator">|</span>
      <button
        class="filter-btn"
        :class="{ active: sortOrder === 'default' }"
        @click="sortOrder = 'default'"
      >Default Order</button>
      <button
        class="filter-btn"
        :class="{ active: sortOrder === 'date' }"
        @click="sortOrder = 'date'"
      >By Slain/Missed Date</button>
    </div>

    <!-- ── Boss grid ──────────────────────────────────────── -->
    <main class="tracker-main">
      <template v-for="{ act, bosses } in bossesByAct" :key="act">
        <section
          v-show="filteredBossesMap[act].length > 0"
          class="act-section"
        >
          <div class="act-header">
            <span class="act-title">Act {{ romanAct[act] }}</span>
            <span class="act-badge" :class="`badge-act${act}`">{{ actNames[act] }}</span>
            <span class="act-count">
              {{ bosses.filter(b => slain.has(b.id)).length }} slain
              <template v-if="bosses.filter(b => missed.has(b.id)).length > 0">
                · {{ bosses.filter(b => missed.has(b.id)).length }} missed
              </template>
              / {{ bosses.length }} total
            </span>
          </div>

          <div class="boss-grid">
            <article
              v-for="boss in filteredBossesMap[act]"
              :key="boss.id"
              class="boss-card"
              :class="[
                boss.tier,
                {
                  slain:       slain.has(boss.id),
                  missed:      missed.has(boss.id),
                  interactive: isDev
                }
              ]"
              @click="isDev && openModal(boss)"
            >
              <div class="boss-card-inner">

                <!-- Portrait thumbnail -->
                <div class="boss-portrait-wrap">
                  <img
                    v-if="!failedImages.has(boss.id)"
                    :src="`/images/bosses/${boss.id}.png`"
                    :alt="boss.name"
                    class="boss-portrait"
                    :style="portraitStyle(boss)"
                    @error="failedImages.add(boss.id); failedImages = new Set(failedImages)"
                  />
                  <div v-else class="boss-portrait-fallback">{{ boss.icon }}</div>
                </div>

                <!-- Content -->
                <div class="boss-content">
                  <div class="boss-meta">
                    <div class="boss-name">{{ boss.name }}</div>
                    <div class="boss-tags">
                      <span class="tag" :class="boss.tier === 'major' ? 'tag-major' : 'tag-minor'">
                        {{ boss.tier === 'major' ? '★ Major' : 'Minor' }}
                      </span>
                      <span class="tag tag-type">{{ boss.type }}</span>
                      <span class="tag" :class="boss.optional ? 'tag-optional' : 'tag-story'">
                        {{ boss.optional ? 'Optional' : 'Story' }}
                      </span>
                      <span v-if="slain.has(boss.id)"  class="tag tag-slain">SLAIN</span>
                      <span v-if="missed.has(boss.id)" class="tag tag-missed">MISSED</span>
                    </div>
                    <div class="boss-location">{{ boss.location }}</div>
                  </div>

                  <p class="boss-desc">{{ boss.desc }}</p>

                  <!-- Defeated by / date summary if set -->
                  <div v-if="bossDetail(boss.id).player || bossDetail(boss.id).date" class="card-detail-summary">
                    <span v-if="bossDetail(boss.id).player" class="detail-player">
                      ⚔ {{ bossDetail(boss.id).player }}
                    </span>
                    <span v-if="bossDetail(boss.id).date" class="detail-date">
                      · {{ formatDate(bossDetail(boss.id).date) }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="boss.legendary" class="legendary-box">
                <div class="legendary-label">⚔ Honour Mode Legendary Action</div>
                <div class="legendary-text">{{ boss.legendary }}</div>
              </div>

              <!-- State stamps -->
              <div v-if="slain.has(boss.id)"  class="state-stamp slain-stamp">SLAIN</div>
              <div v-if="missed.has(boss.id)" class="state-stamp missed-stamp">MISSED</div>

            </article>
          </div>
        </section>
      </template>
    </main>

    <!-- ── Modal ──────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalBoss" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-panel" role="dialog" :aria-label="modalBoss.name">

            <!-- Modal portrait -->
            <div class="modal-portrait-wrap" :class="modalBoss.tier">
              <img
                v-if="!failedImages.has(modalBoss.id)"
                :src="`/images/bosses/${modalBoss.id}.png`"
                :alt="modalBoss.name"
                class="modal-portrait"
                :style="modalPortraitStyle(modalBoss)"
                @error="failedImages.add(modalBoss.id); failedImages = new Set(failedImages)"
              />
              <div v-else class="modal-portrait-fallback">{{ modalBoss.icon }}</div>

              <!-- Overlay gradient so text reads over portrait -->
              <div class="modal-portrait-gradient" />

              <!-- Name overlaid on portrait -->
              <div class="modal-portrait-name">
                <div class="modal-boss-name">{{ modalBoss.name }}</div>
                <div class="modal-boss-type">{{ modalBoss.type }}</div>
              </div>
            </div>

            <!-- Modal body -->
            <div class="modal-body">

              <!-- Tags row -->
              <div class="modal-tags">
                <span class="tag" :class="modalBoss.tier === 'major' ? 'tag-major' : 'tag-minor'">
                  {{ modalBoss.tier === 'major' ? '★ Major' : 'Minor' }}
                </span>
                <span class="tag" :class="modalBoss.optional ? 'tag-optional' : 'tag-story'">
                  {{ modalBoss.optional ? 'Optional' : 'Story' }}
                </span>
                <span class="tag tag-type">Act {{ romanAct[modalBoss.act] }}</span>
              </div>

              <div class="modal-location">{{ modalBoss.location }}</div>

              <!-- State toggle -->
              <div class="modal-section">
                <div class="modal-section-label">Status</div>
                <div class="state-toggle">
                  <button
                    class="state-btn"
                    :class="{ active: modalState === 'unmarked' }"
                    @click="modalState = 'unmarked'"
                  >Unmarked</button>
                  <button
                    class="state-btn state-btn--slain"
                    :class="{ active: modalState === 'slain' }"
                    @click="modalState = 'slain'"
                  >✓ Slain</button>
                  <button
                    class="state-btn state-btn--missed"
                    :class="{ active: modalState === 'missed' }"
                    @click="modalState = 'missed'"
                  >✗ Missed</button>
                </div>
              </div>

              <!-- Player name -->
              <div class="modal-section" v-if="modalState === 'slain'">
                <div class="modal-section-label">
                  {{ 'Defeated by' }}
                </div>
                <div class="player-toggle">
                <button
                  v-for="player in players"
                  :key="player"
                  class="player-btn"
                  :style="selectedPlayer === player ? {
                    background: '#3d2f14',
                    color: '#e8cc7a',
                    borderColor: '#c9a84c'
                  } : {}"
                  @click="selectPlayer(player)"
                >{{ player }}</button>
                </div>
              </div>

              <!-- Date -->
              <div class="modal-section" v-if="modalState === 'slain' || modalState === 'missed'">
                <div class="modal-section-label">Date</div>
                <input
                  v-model="modalDate"
                  class="modal-input"
                  type="date"
                  :disabled="!isDev"
                />
              </div>

              <!-- Legendary action -->
              <div v-if="modalBoss.legendary" class="legendary-box modal-legendary">
                <div class="legendary-label">⚔ Honour Mode Legendary Action</div>
                <div class="legendary-text">{{ modalBoss.legendary }}</div>
              </div>

              <!-- Description -->
              <p class="modal-desc">{{ modalBoss.desc }}</p>

              <!-- Actions -->
              <div class="modal-actions">
                <button class="modal-cancel" @click="closeModal">Cancel</button>
                <button v-if="isDev" class="modal-save" @click="saveModal">Save</button>
              </div>

            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBg3Tracker } from '@/composables/useBg3Tracker.js'

const {
  slain, missed, details,
  isDev: isActuallyDev, loadSave,
  setState, setDetails,
  resetAll, stats, bossesByAct
} = useBg3Tracker()

const previewProd = ref(false)
const isDev = computed(() => isActuallyDev && !previewProd.value)

const players = ['Elliot','Iain','Otto']

// ── Filters ──────────────────────────────────────────────
const activeFilter = ref('all')
const failedImages = ref(new Set())

const romanAct = { 1: 'I', 2: 'II', 3: 'III' }
const actNames  = { 1: 'The Sunlit Lands', 2: 'The Shadow-Cursed Lands', 3: "The City of Baldur's Gate" }

const filters = [
  { value: 'all',    label: 'All' },
  { value: 'act1',   label: 'Act I' },
  { value: 'act2',   label: 'Act II' },
  { value: 'act3',   label: 'Act III' },
  { value: 'major',  label: 'Major Only' },
  { value: 'minor',  label: 'Minor Only' },
  { value: 'slain',  label: 'Slain' },
  { value: 'missed', label: 'Missed' },
  { value: 'alive',  label: 'Still Alive' },
]

const sortOrder = ref('default')

const selectedPlayer = computed(() => modalPlayer.value)

// Remove the filteredBosses function and replace with this:
const filteredBossesMap = computed(() => {
  const result = {}
  for (const { act, bosses } of bossesByAct.value) {
    let list = bosses.filter(b => {
      const f = activeFilter.value
      if (f === 'act1')   return b.act === 1
      if (f === 'act2')   return b.act === 2
      if (f === 'act3')   return b.act === 3
      if (f === 'major')  return b.tier === 'major'
      if (f === 'minor')  return b.tier === 'minor'
      if (f === 'slain')  return slain.value.has(b.id)
      if (f === 'missed') return missed.value.has(b.id)
      if (f === 'alive')  return !slain.value.has(b.id) && !missed.value.has(b.id)
      return true
    })

    if (sortOrder.value === 'date') {
      list = [...list].sort((a, b) => {
        const aDate = details.value[a.id]?.date
        const bDate = details.value[b.id]?.date
        if (aDate && bDate) return aDate.localeCompare(bDate)
        if (aDate) return -1
        if (bDate) return 1
        return 0
      })
    }

    result[act] = list
  }
  return result
})

function handleReset() {
  if (confirm('Reset all progress? (The blood of your enemies will be forgotten)')) {
    resetAll()
  }
}

// ── Image crop ───────────────────────────────────────────
// boss.portrait = { x: 50, y: 20, zoom: 1.3 }
// x/y are object-position percentages, zoom scales the image
function portraitStyle(boss) {
  const p = boss.portrait ?? { x: 50, y: 15, zoom: 1 }
  return {
    objectPosition: `${p.x}% ${p.y}%`,
    transform: `scale(${p.zoom ?? 1})`,
    transformOrigin: `${p.x}% ${p.y}%`,
  }
}

function modalPortraitStyle(boss) {
  const p = boss.portrait ?? { x: 50, y: 15, zoom: 1 }
  // In the modal we use a slightly reduced zoom so more of the image is visible
  const zoom = Math.max(1, (p.zoom ?? 1) * 0.85)
  return {
    objectPosition: `${p.x}% ${p.y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${p.x}% ${p.y}%`,
  }
}

// ── Details helper ───────────────────────────────────────
function bossDetail(id) {
  return details.value[id] ?? {}
}

function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Modal ────────────────────────────────────────────────
const modalBoss   = ref(null)
const modalState  = ref('unmarked')
const modalPlayer = ref('')
const modalDate   = ref('')

function openModal(boss) {
  modalBoss.value   = boss
  modalState.value  = slain.value.has(boss.id) ? 'slain' : missed.value.has(boss.id) ? 'missed' : 'unmarked'
  const d           = bossDetail(boss.id)
  modalPlayer.value = d.player ?? ''
  modalDate.value   = d.date   ?? new Date().toISOString().split('T')[0]
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modalBoss.value = null
  document.body.style.overflow = ''
}

function saveModal() {
  if (!isDev) return
  setState(modalBoss.value.id, modalState.value)
  if (modalState.value !== 'unmarked') {
    setDetails(modalBoss.value.id, {
      player: modalPlayer.value.trim(),
      date:   modalDate.value,
    })
  }
  closeModal()
}

// Close on Escape
function onKeydown(e) {
  if (e.key === 'Escape') closeModal()
}

function selectPlayer(player) {
  if (!isDev) return
  modalPlayer.value = modalPlayer.value === player ? '' : player
}

onMounted(() => {
  loadSave()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ── Variables ─────────────────────────────────────────── */
.bg3-tracker {
  --gold:            #c9a84c;
  --gold-light:      #e8cc7a;
  --gold-dim:        #7a6230;
  --red-bright:      #c0392b;
  --dark:            #0a0806;
  --panel:           #110e09;
  --panel2:          #18130d;
  --border:          #2e2416;
  --border-gold:     #3d2f14;
  --text:            #d4c4a0;
  --text-dim:        #7a6e5a;
  --green-dead:      #2d4a1e;
  --green-dead-text: #5a8a3a;
  --red-missed:      #8b1a1a;
  --red-missed-text: #c05050;

  background: var(--dark);
  color: var(--text);
  font-family: 'IM Fell English', Georgia, serif;
  min-height: 100vh;
  background-image:
    radial-gradient(ellipse at 20% 20%, rgba(100,70,10,0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(80,20,10,0.06) 0%, transparent 60%);
}

/* ── Header ────────────────────────────────────────────── */
.tracker-header {
  text-align: center;
  padding: 3rem 2rem 1.5rem;
  border-bottom: 1px solid var(--border-gold);
}
.header-deco { color: var(--gold-dim); font-size: 0.8rem; letter-spacing: 0.3em; margin: 0.4rem 0; }
h1 {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(1.4rem, 4vw, 2.8rem);
  color: var(--gold);
  text-shadow: 0 0 40px rgba(201,168,76,0.4), 0 2px 4px rgba(0,0,0,0.8);
  letter-spacing: 0.05em;
  margin: 0;
}
.subtitle {
  font-family: 'Cinzel', serif;
  color: var(--gold-dim);
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-top: 0.4rem;
}
.readonly-notice {
  margin-top: 0.5rem;
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: #6080a0;
  text-transform: uppercase;
}

/* ── Stats bar ─────────────────────────────────────────── */
.stats-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(0,0,0,0.2);
}
.stat       { text-align: center; font-family: 'Cinzel', serif; }
.stat-num   { font-size: 1.4rem; color: var(--gold); font-weight: 600; display: block; line-height: 1; }
.missed-num { color: var(--red-missed-text) !important; }
.stat-label { font-size: 0.58rem; color: var(--text-dim); letter-spacing: 0.2em; text-transform: uppercase; }
.progress-bar-wrap { display: flex; align-items: center; gap: 0.75rem; min-width: 180px; max-width: 300px; flex: 1; }
.progress-bar  { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold-dim), var(--gold)); border-radius: 3px; transition: width 0.5s ease; }
.progress-pct  { font-family: 'Cinzel', serif; font-size: 0.7rem; color: var(--gold-dim); min-width: 36px; text-align: right; }

/* ── Controls ──────────────────────────────────────────── */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(0,0,0,0.3);
}
.filter-btn {
  font-family: 'Cinzel', serif;
  font-size: 0.68rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 1px solid var(--border-gold);
  background: var(--panel);
  color: var(--text-dim);
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
}
.filter-btn:hover  { color: var(--gold); border-color: var(--gold-dim); }
.filter-btn.active { background: var(--border-gold); color: var(--gold-light); border-color: var(--gold); }
.separator { color: var(--border-gold); }
.reset-btn {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: 1px solid rgba(139,26,26,0.5);
  background: rgba(139,26,26,0.1);
  color: #a06060;
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
}
.reset-btn:hover { background: rgba(139,26,26,0.25); color: #e08080; border-color: var(--red-bright); }

/* ── Acts ──────────────────────────────────────────────── */
.tracker-main { max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem; }
.act-section  { margin-bottom: 3rem; }
.act-header   { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-gold); }
.act-title    { font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--gold); letter-spacing: 0.2em; text-transform: uppercase; }
.act-count    { margin-left: auto; font-family: 'Cinzel', serif; font-size: 0.65rem; color: var(--text-dim); letter-spacing: 0.15em; }
.act-badge    { font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 0.2em; padding: 0.2rem 0.6rem; border-radius: 2px; text-transform: uppercase; }
.badge-act1   { background: rgba(139,105,20,0.2); color: #c9a84c; border: 1px solid rgba(139,105,20,0.4); }
.badge-act2   { background: rgba(122,42,42,0.2);  color: #c06060; border: 1px solid rgba(122,42,42,0.4); }
.badge-act3   { background: rgba(42,74,122,0.2);  color: #6090c0; border: 1px solid rgba(42,74,122,0.4); }

/* ── Boss grid ─────────────────────────────────────────── */
.boss-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
  align-items: stretch;
}

/* ── Boss card ─────────────────────────────────────────── */
.boss-card {
  background: var(--panel);
  border: 1px solid var(--border-gold);
  border-radius: 4px;
  padding: 1rem 1.1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: default;
  display: flex;
  flex-direction: column;
}
.boss-card.interactive { cursor: pointer; }
.boss-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px; height: 100%;
  background: var(--gold-dim);
  opacity: 0.5;
  transition: background 0.2s;
}
.boss-card:hover { border-color: var(--gold); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
.boss-card.major             { border-color: rgba(139,26,26,0.5); }
.boss-card.major::before     { background: var(--red-bright); }
.boss-card.major .boss-name  { color: #e08080; }
.boss-card.major:hover       { border-color: #c0392b; }
.boss-card.slain             { background: rgba(20,30,15,0.8); border-color: var(--border); opacity: 0.65; }
.boss-card.slain::before     { background: var(--green-dead); opacity: 1; }
.boss-card.slain:hover       { opacity: 0.9; transform: none; }
.boss-card.slain .boss-name  { text-decoration: line-through; color: var(--green-dead-text); }
.boss-card.slain .boss-portrait { filter: grayscale(1); opacity: 0.5; }
.boss-card.missed            { background: rgba(30,10,10,0.8); border-color: rgba(139,26,26,0.3); opacity: 0.65; }
.boss-card.missed::before    { background: var(--red-missed); opacity: 1; }
.boss-card.missed:hover      { opacity: 0.9; transform: none; }
.boss-card.missed .boss-name { text-decoration: line-through; color: var(--red-missed-text); }
.boss-card.missed .boss-portrait { filter: grayscale(1) sepia(0.3); opacity: 0.5; }

.boss-card-inner {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  flex: 1;
}

/* ── Portrait (card) ───────────────────────────────────── */
.boss-portrait-wrap {
  flex-shrink: 0;
  width: 90px;
  aspect-ratio: 3 / 4;
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  overflow: hidden;
  background: var(--panel2);
}
.boss-card.major  .boss-portrait-wrap { border-color: rgba(139,26,26,0.6); }
.boss-card.missed .boss-portrait-wrap { border-color: rgba(139,26,26,0.4); }
.boss-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter 0.3s, opacity 0.3s;
}
.boss-portrait-fallback {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; min-height: 120px;
  color: var(--gold-dim);
}

/* ── Boss content (card) ───────────────────────────────── */
.boss-content  { flex: 1; min-width: 0; }
.boss-meta     { margin-bottom: 0.6rem; }
.boss-name     { font-family: 'Cinzel', serif; font-size: 0.95rem; color: var(--gold-light); font-weight: 600; line-height: 1.2; margin-bottom: 0.2rem; }
.boss-tags     { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.35rem; }
.boss-location { font-size: 0.75rem; color: var(--text-dim); font-style: italic; }
.boss-location::before { content: '📍 '; font-style: normal; font-size: 0.65rem; }
.boss-desc     { font-size: 0.8rem; color: var(--text); line-height: 1.55; margin: 0.5rem 0; opacity: 0.85; }

/* Card detail summary (player / date) */
.card-detail-summary {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: var(--gold-dim);
  margin-bottom: 0.4rem;
}
.detail-player { color: var(--gold); }
.detail-date   { color: var(--text-dim); }

/* ── Tags ──────────────────────────────────────────────── */
.tag          { font-family: 'Cinzel', serif; font-size: 0.55rem; letter-spacing: 0.12em; padding: 0.1rem 0.4rem; border-radius: 2px; text-transform: uppercase; display: inline-block; }
.tag-major    { background: rgba(139,26,26,0.3);  color: #c06060; border: 1px solid rgba(139,26,26,0.4); }
.tag-minor    { background: rgba(40,30,15,0.5);   color: #806040; border: 1px solid rgba(60,40,15,0.4); }
.tag-type     { background: rgba(100,80,30,0.3);  color: #a08040; border: 1px solid rgba(100,80,30,0.3); }
.tag-optional { background: rgba(20,40,80,0.4);   color: #6080a0; border: 1px solid rgba(30,60,100,0.4); }
.tag-story    { background: rgba(60,20,10,0.3);   color: #a07060; border: 1px solid rgba(120,40,20,0.3); }
.tag-slain    { background: rgba(20,50,15,0.5);   color: var(--green-dead-text); border: 1px solid rgba(40,100,20,0.4); }
.tag-missed   { background: rgba(80,10,10,0.5);   color: var(--red-missed-text); border: 1px solid rgba(139,26,26,0.5); }

/* ── Legendary box ─────────────────────────────────────── */
.legendary-box   { margin-top: 0.75rem; background: rgba(139,26,26,0.1); border: 1px solid rgba(139,26,26,0.3); border-radius: 3px; padding: 0.5rem 0.65rem; flex-shrink: 0; }
.legendary-label { font-family: 'Cinzel', serif; font-size: 0.58rem; letter-spacing: 0.2em; color: #c06060; text-transform: uppercase; margin-bottom: 0.25rem; }
.legendary-text  { font-size: 0.75rem; color: #c09080; line-height: 1.5; font-style: italic; }

/* ── Stamps ────────────────────────────────────────────── */
.state-stamp {
  position: absolute;
  top: 50%; right: 1rem;
  transform: translateY(-50%) rotate(-12deg);
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  padding: 0.2rem 0.5rem;
  opacity: 0.8;
  text-transform: uppercase;
  pointer-events: none;
  border-width: 2px;
  border-style: solid;
}
.slain-stamp  { color: var(--green-dead-text); border-color: var(--green-dead-text); }
.missed-stamp { color: var(--red-missed-text); border-color: var(--red-missed-text); }

/* ── Modal backdrop ────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(3px);
}

/* ── Modal panel ───────────────────────────────────────── */
.modal-panel {
  background: var(--panel);
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.1);
}

/* ── Modal portrait ────────────────────────────────────── */
.modal-portrait-wrap {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  border-radius: 6px 6px 0 0;
  flex-shrink: 0;
  background: var(--panel2);
}
.modal-portrait-wrap.major { border-bottom: 2px solid rgba(139,26,26,0.6); }
.modal-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.modal-portrait-fallback {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 5rem;
  color: var(--gold-dim);
}
.modal-portrait-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 30%,
    rgba(5,3,2,0.5) 60%,
    rgba(5,3,2,0.95) 100%
  );
}
.modal-portrait-name {
  position: absolute;
  bottom: 1.25rem;
  left: 1.5rem;
  right: 1.5rem;
}
.modal-boss-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(1.1rem, 3vw, 1.7rem);
  color: var(--gold);
  text-shadow: 0 2px 8px rgba(0,0,0,0.9);
  line-height: 1.2;
}
.modal-boss-type {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  color: var(--text-dim);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

/* ── Modal body ────────────────────────────────────────── */
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; }

.modal-tags     { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.modal-location { font-size: 0.8rem; color: var(--text-dim); font-style: italic; }
.modal-location::before { content: '📍 '; font-style: normal; }

.modal-desc {
  font-size: 0.85rem;
  color: var(--text);
  line-height: 1.65;
  opacity: 0.9;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.modal-legendary { margin-top: 0; }

/* ── Modal sections ────────────────────────────────────── */
.modal-section { display: flex; flex-direction: column; gap: 0.5rem; }
.modal-section-label {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold-dim);
}

/* ── State toggle ──────────────────────────────────────── */
.state-toggle { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.state-btn {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 1px solid var(--border-gold);
  background: var(--panel2);
  color: var(--text-dim);
  padding: 0.45rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
  flex: 1;
}
.state-btn:hover { border-color: var(--gold-dim); color: var(--text); }
.state-btn.active { background: var(--border-gold); color: var(--gold-light); border-color: var(--gold); }
.state-btn--slain.active  { background: rgba(20,50,15,0.6); color: var(--green-dead-text); border-color: var(--green-dead-text); }
.state-btn--missed.active { background: rgba(80,10,10,0.6); color: var(--red-missed-text); border-color: var(--red-missed-text); }

/* ── Player toggle ─────────────────────────────────────── */
.player-toggle { display: flex; gap: 0.5rem; }
.player-btn {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 1px solid var(--border-gold);
  background: var(--panel2);
  color: var(--text-dim);
  padding: 0.45rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
  flex: 1;
}
.player-btn:hover:not(:disabled)  { border-color: var(--gold-dim); color: var(--text); }
.player-btn.active {
  background: var(--border-gold) !important;
  color: var(--gold-light) !important;
  border-color: var(--gold) !important;
}
.player-btn.disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Modal inputs ──────────────────────────────────────── */
.modal-input {
  font-family: 'IM Fell English', Georgia, serif;
  font-size: 0.9rem;
  background: var(--panel2);
  border: 1px solid var(--border-gold);
  color: var(--text);
  padding: 0.5rem 0.75rem;
  border-radius: 3px;
  width: 100%;
  transition: border-color 0.2s;
  outline: none;
}
.modal-input:focus    { border-color: var(--gold); }
.modal-input:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-input[type="date"] { color-scheme: dark; }

/* ── Modal actions ─────────────────────────────────────── */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}
.modal-cancel {
  font-family: 'Cinzel', serif;
  font-size: 0.68rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 1px solid var(--border-gold);
  background: transparent;
  color: var(--text-dim);
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
}
.modal-cancel:hover { color: var(--text); border-color: var(--gold-dim); }
.modal-save {
  font-family: 'Cinzel', serif;
  font-size: 0.68rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 1px solid var(--gold);
  background: var(--border-gold);
  color: var(--gold-light);
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
}
.modal-save:hover { background: #5a4520; color: var(--gold); }

/* ── Modal transition ──────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal-panel, .modal-leave-active .modal-panel { transition: transform 0.25s ease, opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel, .modal-leave-to .modal-panel { transform: translateY(20px) scale(0.97); opacity: 0; }

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 600px) {
  h1                   { font-size: 1.3rem; }
  .controls            { gap: 0.5rem; }
  .tracker-main        { padding: 1.25rem 1rem; }
  .boss-portrait-wrap  { width: 70px; }
  .modal-portrait-wrap { height: 200px; }
  .modal-body          { padding: 1rem; }
  .state-toggle        { flex-direction: column; }
}
</style>