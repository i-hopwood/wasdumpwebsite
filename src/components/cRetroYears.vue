<template>
  <div class="c-retro-years">
    <div v-if="pastYears.length === 0" class="text-center text-muted fst-italic py-5">
      <i class="bi bi-archive fs-1 d-block mb-2"></i>
      No previous years found.
    </div>

    <div class="accordion shadow-sm" id="pastYearsAccordion" v-else>
      <div
        class="accordion-item bg-dark border-secondary year-highlight mb-3"
        v-for="year in pastYears"
        :key="year.yearNumber"
      >
        <h2 class="accordion-header" :id="'headingYear' + year.yearNumber">
          <button
            class="accordion-button collapsed bg-gradient-year text-white border-bottom border-secondary shadow-lg"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapseYear' + year.yearNumber"
            aria-expanded="false"
            :aria-controls="'collapseYear' + year.yearNumber"
          >
            <span class="fs-2 me-auto retro-year-title">
              <i class="bi bi-calendar3 me-2"></i>Year {{ year.yearNumber }}
            </span>
            <span class="badge bg-warning text-dark ms-3 fs-5 px-4 py-2 rounded-pill shadow">
              <i class="bi bi-trophy-fill me-1"></i>
              <template v-if="Array.isArray(year.yearWinner) && year.yearWinner.length > 1">
                Winners: {{ year.yearWinner.join(', ') }}
              </template>
              <template v-else>
                Winner: {{ Array.isArray(year.yearWinner) ? year.yearWinner[0] : year.yearWinner }}
              </template>
            </span>
          </button>
        </h2>

        <div
          :id="'collapseYear' + year.yearNumber"
          class="accordion-collapse collapse"
          :aria-labelledby="'headingYear' + year.yearNumber"
          data-bs-parent="#pastYearsAccordion"
        >
          <div class="accordion-body p-4 bg-darker">
            <div class="mb-5">
              <h5 class="text-secondary border-bottom border-secondary pb-2 mb-3">
                <i class="bi bi-list-ol me-2"></i>Final Standings
              </h5>
              <div class="table-responsive bg-dark rounded border border-secondary shadow mb-4">
                <table class="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th class="ps-4">Rank</th>
                      <th>Player</th>
                      <th class="text-center">Points</th>
                      <th class="text-center">Wins</th>
                      <th class="text-center pe-4">Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="standing in year.finalStandings" :key="standing.player">
                      <td
                        class="ps-4 fw-bold"
                        :class="standing.rank === 1 ? 'text-warning' : 'text-secondary'"
                      >
                        #{{ standing.rank }}
                        <i
                          v-if="standing.rank === 1"
                          class="bi bi-star-fill text-warning ms-1 small"
                        ></i>
                      </td>
                      <td
                        class="fw-bold"
                        :class="standing.rank === 1 ? 'text-warning' : 'text-light'"
                      >
                        {{ standing.player }}
                      </td>
                      <td class="text-center fw-bold text-primary">{{ standing.totalPoints }}</td>
                      <td class="text-center text-success">{{ standing.totalWins }}</td>
                      <td class="text-center pe-4 text-info">{{ standing.bonusCount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mb-2">
              <h5 class="text-secondary border-bottom border-secondary pb-2 mb-3">
                <i class="bi bi-controller me-2"></i>Winner by Console
              </h5>
              <div class="row g-3">
                <div
                  v-for="(consoleItem, cIdx) in year.consolesPlayed"
                  :key="consoleItem.consoleName"
                  :class="winnerColClass(year.consolesPlayed.length)"
                >
                  <div
                    class="p-3 border border-secondary rounded bg-console-card h-100 d-flex flex-column"
                  >
                    <div class="mb-2">
                      <span class="d-block text-muted small text-uppercase mb-1 fw-bold">
                        {{ consoleItem.consoleName }}
                      </span>
                      <span v-if="consoleItem.playerWins.length" class="badge bg-warning text-dark">
                        <i class="bi bi-trophy-fill me-1"></i>
                        Winner: {{ consoleItem.playerWins[0].player }}
                      </span>
                    </div>

                    <ul class="list-unstyled mb-0 small">
                      <li
                        v-for="win in consoleItem.playerWins"
                        :key="win.player"
                        class="d-flex justify-content-between mb-1"
                      >
                        <span
                          :class="
                            win.player === consoleItem.playerWins[0].player
                              ? 'fw-bold text-light'
                              : 'text-muted'
                          "
                        >
                          {{ win.player }}
                        </span>
                        <span
                          :class="
                            win.player === consoleItem.playerWins[0].player
                              ? 'fw-bold text-light'
                              : 'text-muted'
                          "
                        >
                          {{ win.wins }}
                        </span>
                      </li>
                    </ul>

                    <div class="mt-3">
                      <button
                        class="btn btn-sm btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center"
                        @click="toggleGames(year.yearNumber, consoleItem.consoleName)"
                        type="button"
                      >
                        <span><i class="bi bi-collection-play me-2"></i>Game List</span>
                        <i
                          class="bi"
                          :class="
                            isGamesOpen(year.yearNumber, consoleItem.consoleName)
                              ? 'bi-chevron-up'
                              : 'bi-chevron-down'
                          "
                        ></i>
                      </button>

                      <div
                        class="games-list-dropdown mt-2"
                        v-if="isGamesOpen(year.yearNumber, consoleItem.consoleName)"
                      >
                        <div class="table-responsive">
                          <table
                            class="table table-sm table-dark table-hover mb-0"
                            style="font-size: 0.8rem"
                          >
                            <thead>
                              <tr>
                                <th>Game</th>
                                <th>Winner</th>
                                <th>Scores</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="game in getGamesByConsole(
                                  year.yearNumber,
                                  consoleItem.consoleName,
                                )"
                                :key="game.gameName"
                              >
                                <td>{{ game.gameName }}</td>
                                <td class="text-primary">{{ game.winner }}</td>
                                <td>
                                  <div
                                    v-for="score in game.scores"
                                    :key="score.player"
                                    class="x-small"
                                  >
                                    {{ score.player }}: {{ score.points }}
                                  </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

const pastYearModules = import.meta.glob('../assets/endofyear*.json', { eager: true })

export default {
  name: 'cRetroYears',
  setup() {
    const openGames = ref({}) // Tracks toggled state: { "2024-NES": true }

    const winnerColClass = (num) => {
      if (num === 1) return 'col-12'
      if (num === 2) return 'col-md-6'
      if (num === 3) return 'col-md-4'
      return 'col-md-3 col-sm-6'
    }

    const toggleGames = (year, consoleName) => {
      const key = `${year}-${consoleName}`
      openGames.value[key] = !openGames.value[key]
    }

    const isGamesOpen = (year, consoleName) => {
      return !!openGames.value[`${year}-${consoleName}`]
    }

    const processStandingsData = (data) => {
      if (!data) return null
      const root = data.EndOfYearResults || data
      const rawResults = root.GamesPlayed || root.Results || root.results || []
      const rawStandings = root.FinalStandings || root.Standings || root.standings || []
      const consolesPlayedRaw = root.ConsolesPlayed || root.consolesPlayed || []

      const getGameDetails = (game) => {
        let maxPoints = -1
        let winners = []
        const scores = (game.Scores || game.scores || [])
          .map((s) => ({
            player: (s.Player || s.player || 'Unknown').trim(),
            points: s.Points ?? s.points ?? 0,
            gotBonus: s.GotBonus ?? s.gotBonus ?? false,
          }))
          .sort((a, b) => b.points - a.points)

        scores.forEach((s) => {
          if (s.points > maxPoints) {
            maxPoints = s.points
            winners = [s.player]
          } else if (s.points === maxPoints && maxPoints !== -1) {
            winners.push(s.player)
          }
        })
        return { scores, winners }
      }

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

      let finalStandings = rawStandings.map((s) => {
        const p = (s.Player || s.player || '').trim()
        return {
          player: p,
          totalPoints: s.Points ?? s.points ?? s.TotalPoints ?? s.totalPoints ?? 0,
          totalWins: s.TotalWins ?? s.totalWins ?? playerStats[p]?.wins ?? 0,
          bonusCount: s.BonusCount ?? s.bonusCount ?? playerStats[p]?.bonuses ?? 0,
        }
      })

      finalStandings.sort((a, b) => b.totalPoints - a.totalPoints)
      finalStandings = finalStandings.map((s, i) => ({ ...s, rank: i + 1 }))

      const consolesPlayed = consolesPlayedRaw
        .map((c) => ({
          consoleName: c.ConsoleName || c.consoleName,
          playerWins: (c.PlayerWins || c.playerWins || [])
            .map((pw) => ({
              player: (pw.Player || pw.player || '').trim(),
              wins: pw.Wins ?? pw.wins ?? 0,
            }))
            .sort((a, b) => b.wins - a.wins),
        }))
        .sort((a, b) => a.consoleName.localeCompare(b.consoleName))

      // Find all players tied for first place
      let yearWinner = 'Unknown'
      if (finalStandings.length > 0) {
        const topPoints = finalStandings[0].totalPoints
        const winners = finalStandings
          .filter((s) => s.totalPoints === topPoints)
          .map((s) => s.player)
        yearWinner = winners.length > 1 ? winners : winners[0]
      }
      return {
        yearWinner,
        finalStandings,
        consolesPlayed,
        rawResults, // Kept for the getGamesByConsole helper
      }
    }

    const pastYears = computed(() => {
      const years = []
      for (const path in pastYearModules) {
        const data = pastYearModules[path].default || pastYearModules[path]
        const match = path.match(/endofyear(\d+)\.json/i)
        const yearNum = match ? parseInt(match[1]) : years.length + 1
        if (data) {
          const processed = processStandingsData(data)
          if (processed && processed.finalStandings.length > 0) {
            years.push({ yearNumber: yearNum, ...processed })
          }
        }
      }
      return years.sort((a, b) => b.yearNumber - a.yearNumber)
    })

    const getGamesByConsole = (yearNum, consoleName) => {
      const yearData = pastYears.value.find((y) => y.yearNumber === yearNum)
      if (!yearData) return []
      return yearData.rawResults
        .filter((g) => (g.Console || g.console) === consoleName)
        .map((g) => {
          const scores = g.Scores || g.scores || []
          const max = Math.max(...scores.map((s) => s.Points ?? s.points ?? 0))
          const winner = scores.find((s) => (s.Points ?? s.points) === max)
          return {
            gameName: g.GameName || g.gameName,
            winner: winner ? winner.Player || winner.player : 'N/A',
            scores: scores.map((s) => ({
              player: s.Player || s.player,
              points: s.Points ?? s.points,
            })),
          }
        })
    }

    return {
      pastYears,
      winnerColClass,
      toggleGames,
      isGamesOpen,
      getGamesByConsole,
    }
  },
}
</script>

<style scoped>
.c-retro-years {
  padding: 1rem;
  overflow-x: hidden;
}
.bg-darker {
  background-color: #121212;
}
.bg-console-card {
  background-color: #1e1e1e;
}
.x-small {
  font-size: 0.75rem;
}

@media (max-width: 767.98px) {
  .accordion-button {
    flex-direction: column;
    align-items: flex-start;
  }
  .badge {
    margin-top: 0.5rem;
    margin-left: 0 !important;
  }
}
</style>
