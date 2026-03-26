import { ref, computed } from 'vue'
import { BOSSES } from '@/data/bg3Bosses.js'

const slain = ref(new Set())
const missed = ref(new Set())
const loaded = ref(false)

export function useBg3Tracker() {
  const isDev = import.meta.env.DEV

  async function loadSave() {
    if (loaded.value) return
    try {
      const url = isDev ? `/bg3-save.json?t=${Date.now()}` : '/bg3-save.json'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      slain.value = new Set(data.slain ?? [])
      missed.value = new Set(data.missed ?? [])
    } catch (e) {
      console.warn('BG3 Tracker: could not load save file', e)
      slain.value = new Set()
      missed.value = new Set()
    }
    loaded.value = true
  }

  async function persistSave() {
    if (!isDev) return
    try {
      await fetch('/api/bg3-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slain: [...slain.value],
          missed: [...missed.value]
        })
      })
    } catch (e) {
      console.error('BG3 Tracker: save failed', e)
    }
  }

  // Cycles: unmarked → slain → missed → unmarked
  function cycleState(id) {
    if (!isDev) return
    if (slain.value.has(id)) {
      // slain → missed
      const nextSlain = new Set(slain.value)
      nextSlain.delete(id)
      slain.value = nextSlain
      const nextMissed = new Set(missed.value)
      nextMissed.add(id)
      missed.value = nextMissed
    } else if (missed.value.has(id)) {
      // missed → unmarked
      const nextMissed = new Set(missed.value)
      nextMissed.delete(id)
      missed.value = nextMissed
    } else {
      // unmarked → slain
      const nextSlain = new Set(slain.value)
      nextSlain.add(id)
      slain.value = nextSlain
    }
    persistSave()
  }

  function resetAll() {
    if (!isDev) return
    slain.value = new Set()
    missed.value = new Set()
    persistSave()
  }

  const stats = computed(() => {
    const total = BOSSES.length
    const slainCount = slain.value.size
    const missedCount = missed.value.size
    return {
      total,
      slainCount,
      missedCount,
      remaining: total - slainCount - missedCount,
      majorLeft: BOSSES.filter(b => b.tier === 'major' && !slain.value.has(b.id) && !missed.value.has(b.id)).length,
      pct: Math.round((slainCount / total) * 100)
    }
  })

  const bossesByAct = computed(() =>
    [1, 2, 3].map(act => ({
      act,
      bosses: BOSSES.filter(b => b.act === act)
    }))
  )

  return { slain, missed, loaded, isDev, loadSave, cycleState, resetAll, stats, bossesByAct }
}