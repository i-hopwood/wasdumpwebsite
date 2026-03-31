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
              <i class="bi bi-trophy-fill me-1"></i> Winner: {{ year.yearWinner }}
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
                  v-for="consoleItem in year.consolesPlayed"
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

                    <ul class="list-unstyled mb-0 small mt-auto">
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
                      <li v-if="!consoleItem.playerWins.length" class="text-muted italic">
                        No Data
                      </li>
                    </ul>
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
import { computed } from 'vue'

const pastYearModules = import.meta.glob('../assets/endofyear*.json', { eager: true })

export default {
  name: 'cRetroYears',
  setup() {
    // Dynamic column sizing logic
    const winnerColClass = (num) => {
      if (num === 1) return 'col-12'
      if (num === 2) return 'col-md-6'
      if (num === 3) return 'col-md-4'
      return 'col-md-3 col-sm-6'
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
          gamesPlayedCount: c.GamesPlayedCount ?? c.gamesPlayedCount ?? 0,
          playerWins: (c.PlayerWins || c.playerWins || [])
            .map((pw) => ({
              player: (pw.Player || pw.player || '').trim(),
              wins: pw.Wins ?? pw.wins ?? 0,
            }))
            .sort((a, b) => b.wins - a.wins),
        }))
        .sort((a, b) => a.consoleName.localeCompare(b.consoleName))

      return {
        yearWinner: finalStandings[0]?.player || 'Unknown',
        finalStandings,
        consolesPlayed,
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

    return { pastYears, winnerColClass }
  },
}
</script>
<style scoped>
/* Mobile-friendly adjustments for cRetroYears */
.c-retro-years {
  padding: 1rem;
}

/* Accordion and table tweaks */
.accordion-body {
  padding: 1rem;
}

@media (max-width: 767.98px) {
  .c-retro-years {
    padding: 0.5rem 0.25rem;
  }
  .accordion-body {
    padding: 0.5rem 0.25rem;
  }
  .accordion-button {
    font-size: 1.1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
  }
  .retro-year-title {
    font-size: 1.2rem !important;
  }
  .badge {
    font-size: 1rem !important;
    padding: 0.5em 1em !important;
  }
  .table-responsive {
    overflow-x: auto;
  }
  .table th,
  .table td {
    padding: 0.4rem 0.3rem !important;
    font-size: 0.95rem;
  }
  .row.g-3 {
    --bs-gutter-x: 0.5rem;
    --bs-gutter-y: 0.5rem;
  }
  .p-3 {
    padding: 0.75rem !important;
  }
}

/* Make table scrollable on small screens */
.table-responsive {
  overflow-x: auto;
}

/* Winner by Console cards: stack vertically on mobile */
@media (max-width: 575.98px) {
  .col-md-6,
  .col-md-4,
  .col-md-3,
  .col-sm-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* Prevent horizontal overflow */
.c-retro-years {
  overflow-x: hidden;
}
</style>
