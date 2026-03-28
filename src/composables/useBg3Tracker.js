import { ref, computed } from 'vue'
import { BOSSES } from '@/data/bg3Bosses.js'

const slain   = ref(new Set())
const missed  = ref(new Set())
const details = ref({}) // { [bossId]: { player, date } }
const loaded  = ref(false)

export function useBg3Tracker() {
  const isDev = import.meta.env.DEV

  async function loadSave() {
    if (loaded.value) return
    try {
      const url = isDev ? `/bg3-save.json?t=${Date.now()}` : '/bg3-save.json'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      slain.value   = new Set(data.slain   ?? [])
      missed.value  = new Set(data.missed  ?? [])
      details.value = data.details ?? {}
    } catch (e) {
      console.warn('BG3 Tracker: could not load save file', e)
      slain.value   = new Set()
      missed.value  = new Set()
      details.value = {}
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
          slain:   [...slain.value],
          missed:  [...missed.value],
          details: details.value,
        })
      })
    } catch (e) {
      console.error('BG3 Tracker: save failed', e)
    }
  }

  // Set state from modal — 'slain' | 'missed' | 'unmarked'
  function setState(id, state) {
    if (!isDev) return
    const nextSlain  = new Set(slain.value)
    const nextMissed = new Set(missed.value)
    nextSlain.delete(id)
    nextMissed.delete(id)
    if (state === 'slain')  nextSlain.add(id)
    if (state === 'missed') nextMissed.add(id)
    slain.value  = nextSlain
    missed.value = nextMissed

    // Clear details when unmarking
    if (state === 'unmarked') {
      const next = { ...details.value }
      delete next[id]
      details.value = next
    }

    persistSave()
  }

  // Set player/date details for a boss
  function setDetails(id, { player, date }) {
    if (!isDev) return
    const next = { ...details.value }
    if (player || date) {
      next[id] = { player, date }
    } else {
      delete next[id]
    }
    details.value = next
    persistSave()
  }

  function resetAll() {
    if (!isDev) return
    slain.value   = new Set()
    missed.value  = new Set()
    details.value = {}
    persistSave()
  }

  const stats = computed(() => {
    const total      = BOSSES.length
    const slainCount = slain.value.size
    const missedCount = missed.value.size
    return {
      total,
      slainCount,
      missedCount,
      remaining: total - slainCount - missedCount,
      majorLeft: BOSSES.filter(b =>
        b.tier === 'major' && !slain.value.has(b.id) && !missed.value.has(b.id)
      ).length,
      pct: Math.round((slainCount / total) * 100)
    }
  })

  const bossesByAct = computed(() =>
    [1, 2, 3].map(act => ({
      act,
      bosses: BOSSES.filter(b => b.act === act)
    }))
  )

  return {
    slain, missed, details, loaded, isDev,
    loadSave, setState, setDetails, resetAll,
    stats, bossesByAct
  }
}