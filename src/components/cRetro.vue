<template>
  <div class="c-retro container mt-5 mb-5">
    <h2 class="mb-4 text-center text-primary"><i class="bi bi-joystick me-2"></i>Retro Races</h2>

    <div v-if="localResults" class="animate-fade-in">
      <div class="current-year-section mb-5">
        <h3 class="mb-4 text-secondary border-bottom border-secondary pb-2">
          <i class="bi bi-calendar-event me-2"></i>Current Year
        </h3>

        <div class="row g-4 mb-4">
          <div class="col-lg-8">
            <div class="card h-100 shadow-sm border-primary border-opacity-25">
              <div class="card-header bg-dark">
                <h4 class="mb-0">
                  <i class="bi bi-trophy me-2 text-warning"></i>Current Standings
                </h4>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th class="ps-4">Rank</th>
                        <th>Player</th>
                        <th class="text-center">Points</th>
                        <th class="text-center">Wins</th>
                        <th class="text-center pe-4">Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="standing in localResults.finalStandings ||
                        localResults.finalstandings"
                        :key="standing.player"
                      >
                        <td class="ps-4 fw-bold text-secondary">
                          #{{ standing.rank || standing.Rank }}
                        </td>
                        <td class="fw-bold">{{ standing.player || standing.Player }}</td>
                        <td class="text-center fw-bold text-primary">
                          {{ standing.totalPoints ?? standing.totalpoints }}
                        </td>
                        <td class="text-center">{{ standing.totalWins ?? standing.totalwins }}</td>
                        <td class="text-center pe-4">
                          {{ standing.bonusCount ?? standing.bonuscount }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4" v-if="currentCompetition">
            <div class="card shadow-sm border-secondary h-100">
              <div class="card-header bg-transparent border-bottom border-secondary">
                <h4 class="mb-0 text-secondary"><i class="bi bi-flag me-2"></i>Current Race</h4>
              </div>
              <div class="card-body d-flex flex-column justify-content-center text-center">
                <h5 class="display-6 text-white mb-2">{{ currentCompetition.GameName }}</h5>
                <h6 class="card-subtitle mb-4 text-muted text-uppercase letter-spacing-2">
                  {{ currentCompetition.System }}
                </h6>

                <div
                  class="p-3 bg-black bg-opacity-25 rounded mb-3 border border-secondary border-opacity-25"
                >
                  <p class="card-text fst-italic text-light mb-0">
                    "{{ currentCompetition.Goal }}"
                  </p>
                </div>

                <p class="card-text mt-auto">
                  <small class="text-muted"
                    ><i class="bi bi-calendar3 me-1"></i>Date:
                    {{ currentCompetition.CompetionDateString }}</small
                  >
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="row mt-4"
          v-if="localResults.consolesPlayed && localResults.consolesPlayed.length"
        >
          <div class="col-12">
            <div class="card border-secondary">
              <div
                class="card-header cursor-pointer d-flex justify-content-between align-items-center bg-dark"
                @click="showConsoles = !showConsoles"
                role="button"
              >
                <h5 class="mb-0 text-white">
                  <i class="bi bi-hdd-network me-2"></i>Console Standings
                </h5>
                <i class="bi" :class="showConsoles ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div class="card-body bg-darker" v-if="showConsoles">
                <div class="row g-3">
                  <template
                    v-for="(console, idx) in localResults.consolesPlayed"
                    :key="console.consoleName"
                  >
                    <div
                      :class="`col-md-${Math.max(6, 12 / numConsoleCols)} col-lg-${12 / numConsoleCols}`"
                    >
                      <div
                        class="p-3 border border-secondary rounded h-100 bg-secondary bg-opacity-10"
                      >
                        <strong
                          class="d-block text-secondary mb-2 border-bottom border-secondary pb-1"
                          >{{ console.consoleName }}
                          <span class="badge bg-secondary text-dark float-end"
                            >{{ console.gamesPlayedCount }} games</span
                          ></strong
                        >
                        <ul class="list-unstyled mb-0 small">
                          <li
                            v-for="win in console.playerWins"
                            :key="win.player"
                            class="d-flex justify-content-between mb-1"
                          >
                            <span class="console-player-name text-truncate">{{ win.player }}</span>
                            <span class="text-white">{{ win.wins }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-4" v-if="localResults.gamesPlayed && localResults.gamesPlayed.length">
          <div class="col-12">
            <div class="card border-secondary">
              <div
                class="card-header cursor-pointer d-flex justify-content-between align-items-center bg-dark"
                @click="showGames = !showGames"
                role="button"
              >
                <h5 class="mb-0 text-white">
                  <i class="bi bi-collection-play me-2"></i>Games History
                </h5>
                <i class="bi" :class="showGames ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div class="card-body p-0" v-if="showGames">
                <div class="table-responsive" style="max-height: 500px; overflow-y: auto">
                  <table class="table table-hover table-sm mb-0">
                    <thead class="table-dark sticky-top">
                      <tr>
                        <th class="ps-3">Game</th>
                        <th>Console</th>
                        <th>Date</th>
                        <th>Winner</th>
                        <th class="pe-3">Scores</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="game in localResults.gamesPlayed"
                        :key="game.gameName + game.competionDate"
                      >
                        <td class="ps-3 fw-medium text-light">{{ game.gameName }}</td>
                        <td>
                          <span class="badge bg-secondary text-dark bg-opacity-75">{{
                            game.console
                          }}</span>
                        </td>
                        <td class="small text-muted">{{ game.competionDate }}</td>
                        <td class="text-primary">{{ game.winner }}</td>
                        <td class="pe-3">
                          <ul class="list-inline mb-0 small">
                            <li
                              class="list-inline-item text-nowrap"
                              v-for="score in game.scores"
                              :key="score.player + score.points"
                            >
                              <span class="text-muted">{{ score.player }}:</span>
                              <span class="text-white">{{ score.points }}</span>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card border-secondary shadow-sm">
        <div
          class="card-header cursor-pointer d-flex justify-content-between align-items-center bg-dark"
          @click="showPastYears = !showPastYears"
          role="button"
        >
          <h3 class="mb-0 text-white"><i class="bi bi-archive me-2"></i>Previous Years</h3>
          <i
            class="bi fs-4 text-white"
            :class="showPastYears ? 'bi-chevron-up' : 'bi-chevron-down'"
          ></i>
        </div>
        <div class="card-body bg-darker" v-if="showPastYears">
          <cRetroYears />
        </div>
      </div>
    </div>
    <div v-else class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading standings data...</p>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import standingsData from '../assets/standings.json'
import currentData from '../assets/current.json'
import cRetroYears from './cRetroYears.vue' // Import new component

export default {
  name: 'cRetro',
  components: {
    cRetroYears,
  },
  setup() {
    const showConsoles = ref(false)
    const showGames = ref(false)
    const showPastYears = ref(false) // Toggle state for previous years

    const currentCompetition = currentData.Competition

    const localResults = computed(() => {
      const data = standingsData
      if (!data) return null

      const rawResults = data.Results || []
      const rawStandings = data.Standings || []

      // Helper to find scores/winners for a game
      const getGameDetails = (game) => {
        let maxPoints = -1
        let winners = []

        const scores = (game.Scores || [])
          .map((s) => {
            const p = s.Player ? s.Player.trim() : 'Unknown'
            const points = s.Points !== undefined ? s.Points : 0
            return { player: p, points: points, gotBonus: s.GotBonus }
          })
          .sort((a, b) => b.points - a.points)

        scores.forEach((s) => {
          if (s.points > maxPoints) {
            maxPoints = s.points
            winners = [s.player]
          } else if (s.points === maxPoints) {
            winners.push(s.player)
          }
        })

        return { scores, winners }
      }

      // 1. Calculate aggregated stats from Results (Wins, Bonuses)
      const playerStats = {}
      rawResults.forEach((game) => {
        const { scores, winners } = getGameDetails(game)

        scores.forEach((s) => {
          if (!playerStats[s.player]) playerStats[s.player] = { wins: 0, bonuses: 0 }
          if (s.gotBonus) playerStats[s.player].bonuses++
        })

        winners.forEach((w) => {
          if (!playerStats[w]) playerStats[w] = { wins: 0, bonuses: 0 }
          playerStats[w].wins++
        })
      })

      // 2. Final Standings
      let finalStandings = rawStandings.map((s) => {
        const p = s.Player ? s.Player.trim() : ''
        return {
          player: p,
          totalPoints: s.Points,
          totalWins: playerStats[p]?.wins || 0,
          bonusCount: playerStats[p]?.bonuses || 0,
        }
      })

      // Sort by points desc
      finalStandings.sort((a, b) => b.totalPoints - a.totalPoints)
      // Assign rank
      finalStandings = finalStandings.map((s, i) => ({ ...s, rank: i + 1 }))

      const yearWinner = finalStandings.length > 0 ? finalStandings[0].player : null

      // 3. Games Played
      const gamesPlayed = rawResults.map((game) => {
        const { scores, winners } = getGameDetails(game)
        return {
          gameName: game.GameName,
          console: game.System,
          competionDate: game.CompetionDate,
          winner: winners.join(', '),
          scores: scores,
        }
      })

      // 4. Consoles Played
      const consolesMap = {}
      rawResults.forEach((game) => {
        const sys = game.System
        if (!sys) return

        if (!consolesMap[sys]) {
          consolesMap[sys] = {
            consoleName: sys,
            gamesPlayedCount: 0,
            playerWinsMap: {},
          }
        }
        consolesMap[sys].gamesPlayedCount++

        const { winners } = getGameDetails(game)
        winners.forEach((w) => {
          if (!consolesMap[sys].playerWinsMap[w]) consolesMap[sys].playerWinsMap[w] = 0
          consolesMap[sys].playerWinsMap[w]++
        })
      })

      const consolesPlayed = Object.values(consolesMap).map((c) => ({
        consoleName: c.consoleName,
        gamesPlayedCount: c.gamesPlayedCount,
        playerWins: Object.entries(c.playerWinsMap)
          .map(([player, wins]) => ({ player, wins }))
          .sort((a, b) => b.wins - a.wins),
      }))

      // 5. Games Played By Console (grouped/sorted)
      const gamesplayedbyconsole = [...gamesPlayed].sort((a, b) => {
        const cA = a.console || ''
        const cB = b.console || ''
        return cA.localeCompare(cB)
      })

      return {
        yearWinner,
        finalStandings,
        consolesPlayed,
        gamesPlayed,
        gamesplayedbyconsole,
      }
    })

    // Calculate number of columns for consoles played (max 4 cols)
    const numConsoleCols = computed(() => {
      const consoles = localResults.value?.consolesPlayed || []
      return Math.max(1, Math.min(consoles.length, 4))
    })

    return {
      localResults,
      numConsoleCols,
      showConsoles,
      showGames,
      showPastYears,
      currentCompetition,
    }
  },
}
</script>

<style scoped>
/* Truncate long player names in consoles bar */
.console-player-name {
  max-width: 90px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
@media (max-width: 576px) {
  .console-player-name {
    max-width: 60px;
    font-size: 0.95em;
  }
}
</style>
