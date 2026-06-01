<template>
  <div class="c-pass container mt-4">
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="mb-0 fs-4">
          <i class="bi bi-controller me-2"></i>Pass and Play:
          <span class="text-white">{{ passData.name }}</span>
        </h2>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <div class="col-md-6 border-end border-secondary">
            <h5 class="text-uppercase text-muted small letter-spacing-1">Current Player</h5>
            <p class="display-6 fw-bold text-primary">{{ passData.currentPlayer }}</p>
          </div>
          <div class="col-md-6 ps-md-4">
            <h5 class="text-uppercase text-muted small letter-spacing-1">Next Player</h5>
            <p class="display-6 text-secondary">{{ passData.nextPlayer }}</p>
          </div>
        </div>

        <hr class="border-secondary my-4" />

        <div class="mb-4 text-center">
          <h5 class="text-uppercase text-muted small mb-2">Last Session</h5>
          <h4 class="text-light">{{ passData.lastSessionName }}</h4>
        </div>

        <!-- Recent kills dashboard -->
        <hr class="border-secondary my-4" />

        <div class="recent-kills">
          <h5 class="text-uppercase text-muted small mb-3">
            <RouterLink to="/boss-tracker" class="recent-kills-link">
              <i class="bi bi-skull me-2"></i>Recent Kills
            </RouterLink>
          </h5>

          <!-- Loading state -->
          <div v-if="loading" class="text-center text-muted py-3">
            <small>Loading...</small>
          </div>

          <!-- No kills yet -->
          <div v-else-if="recentKills.length === 0" class="text-center text-muted py-3">
            <small>No kills recorded yet. Get slaying!</small>
          </div>

          <!-- Kill cards -->
          <div v-else class="kills-grid">
            <div
              v-for="kill in recentKills"
              :key="kill.id"
              class="kill-card"
            >
              <div class="kill-portrait-wrap">
                <img
                  v-if="!failedImages.has(kill.id)"
                  :src="`/images/bosses/${kill.id}.png`"
                  :alt="kill.name"
                  class="kill-portrait"
                  :style="killPortraitStyle(kill.portrait)"
                  @error="failedImages.add(kill.id); failedImages = new Set(failedImages)"
                />
                <div v-else class="kill-portrait-fallback">{{ kill.icon }}</div>
              </div>
              <div class="kill-info">
                <div class="kill-name">{{ kill.name }}</div>
                <div class="kill-player" v-if="kill.player">
                  <i class="bi bi-sword me-1"></i>{{ kill.player }}
                </div>
                <div class="kill-date" v-if="kill.date">{{ formatDate(kill.date) }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import passData from '@/assets/pass.json'
import { BOSSES } from '@/data/bg3Bosses.js'

export default {
  name: 'cPass',
  data() {
    return {
      passData,
      loading: true,
      slain: [],
      details: {},
      failedImages: new Set(),
    }
  },
  computed: {
    recentKills() {
      // Build list of slain bosses with their details
      const kills = this.slain
        .map(id => {
          const boss = BOSSES.find(b => b.id === id)
          if (!boss) return null
          const detail = this.details[id] ?? {}
            return {
              id:      boss.id,
              name:    boss.name,
              icon:    boss.icon,
              portrait: boss.portrait ?? { x: 50, y: 15, zoom: 1 },
              player:  detail.player ?? '',
              date:    detail.date   ?? '',
            }
        })
        .filter(Boolean)

      // Sort by date descending (most recent first), undated go last
      kills.sort((a, b) => {
        if (a.date && b.date) return b.date.localeCompare(a.date)
        if (a.date) return -1
        if (b.date) return 1
        return 0
      })

      // Return top 3
      return kills.slice(0, 6)
    }
  },
  methods: {
    killPortraitStyle(portrait) {
      const p = portrait ?? { x: 50, y: 15, zoom: 1 }
      return {
        objectPosition: `${p.x}% ${p.y}%`,
        transform: `scale(${p.zoom ?? 1})`,
        transformOrigin: `${p.x}% ${p.y}%`,
      }
    },
    async loadSave() {
      try {
        const res = await fetch(`/bg3-save.json?t=${Date.now()}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.slain   = data.slain   ?? []
        this.details = data.details ?? {}
      } catch (e) {
        console.warn('cPass: could not load BG3 save file', e)
      } finally {
        this.loading = false
      }
    },
    formatDate(iso) {
      if (!iso) return ''
      const [y, m, d] = iso.split('-')
      return `${d}/${m}/${y}`
    }
  },
  mounted() {
    this.loadSave()
  }
}
</script>

<style scoped>
/* ── Recent kills ──────────────────────────────────────── */
.kills-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.kill-card {
  flex: 1;
  min-width: 140px;
  max-width: calc(33% - 0.75rem);
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
}

.kill-portrait-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
}

.kill-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

.kill-portrait-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.kill-info {
  flex: 1;
  min-width: 0;
}

.kill-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e8cc7a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  margin-bottom: 0.2rem;
}

.kill-player {
  font-size: 0.7rem;
  color: #adb5bd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kill-date {
  font-size: 0.65rem;
  color: #6c757d;
  margin-top: 0.1rem;
}

.recent-kills-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.recent-kills-link:hover {
  color: #e8cc7a;
}

@media (max-width: 576px) {
  .kills-grid    { flex-direction: column; }
  .kill-card     { max-width: 100%; }
}
</style>