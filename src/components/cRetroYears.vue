<template>
  <div class="c-retro-years">
    <div v-if="pastYears.length === 0" class="text-center text-muted fst-italic py-3">
      No previous years found.
    </div>
    
    <div class="accordion shadow-sm" id="pastYearsAccordion" v-else>
      <div class="accordion-item bg-dark border-secondary" v-for="year in pastYears" :key="year.yearNumber">
        <h2 class="accordion-header" :id="'headingYear' + year.yearNumber">
          <button class="accordion-button collapsed bg-dark text-white border-bottom border-secondary" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapseYear' + year.yearNumber" aria-expanded="false" :aria-controls="'collapseYear' + year.yearNumber">
            <span class="fs-5 me-auto">Year {{ year.yearNumber }}</span>
            <span class="badge bg-warning text-dark ms-3 fs-6 px-3 py-2 rounded-pill">
              <i class="bi bi-trophy-fill me-1"></i> Winner: {{ year.yearWinner }}
            </span>
          </button>
        </h2>
        <div :id="'collapseYear' + year.yearNumber" class="accordion-collapse collapse" :aria-labelledby="'headingYear' + year.yearNumber" data-bs-parent="#pastYearsAccordion">
          <div class="accordion-body p-4 bg-darker">
            
            <div class="mb-4">
              <h5 class="text-secondary border-bottom border-secondary pb-2 mb-3">
                <i class="bi bi-controller me-2"></i>Winner by Console
              </h5>
              <div class="row g-3">
                <div class="col-md-3 col-sm-4 col-6" v-for="console in year.consolesPlayed" :key="console.consoleName">
                  <div class="p-3 border border-secondary rounded bg-secondary bg-opacity-10 text-center h-100 d-flex flex-column justify-content-center">
                    <span class="d-block text-muted small text-uppercase mb-1">{{ console.consoleName }}</span>
                    <strong class="text-light fs-5">{{ console.playerWins.length ? console.playerWins[0].player : 'N/A' }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <h5 class="text-secondary border-bottom border-secondary pb-2 mb-3">
              <i class="bi bi-list-ol me-2"></i>Final Standings
            </h5>
            <div class="table-responsive bg-dark rounded border border-secondary">
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
                  <tr v-for="standing in year.finalStandings" :key="standing.player">
                    <td class="ps-4 fw-bold" :class="standing.rank === 1 ? 'text-warning' : 'text-secondary'">
                      #{{ standing.rank }} <i v-if="standing.rank === 1" class="bi bi-star-fill text-warning ms-1 small"></i>
                    </td>
                    <td class="fw-bold" :class="standing.rank === 1 ? 'text-warning' : ''">{{ standing.player }}</td>
                    <td class="text-center fw-bold text-primary">{{ standing.totalPoints }}</td>
                    <td class="text-center">{{ standing.totalWins }}</td>
                    <td class="text-center pe-4">{{ standing.bonusCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

// Dynamically import any JSON starting with 'endofyear' in assets
const pastYearModules = import.meta.glob('../assets/endofyear*.json', { eager: true });

export default {
  name: "cRetroYears",
  setup() {
    const processStandingsData = (data) => {
      if (!data) return null;

      const rawResults = data.Results || data.results || [];
      const rawStandings = data.Standings || data.standings || [];

      // Helper to map and sort scores
      const getGameDetails = (game) => {
        let maxPoints = -1;
        let winners = [];
        
        const scores = (game.Scores || game.scores || []).map(s => {
          const p = s.Player || s.player ? (s.Player || s.player).trim() : "Unknown";
          const points = s.Points !== undefined ? s.Points : (s.points !== undefined ? s.points : 0);
          const gotBonus = s.GotBonus !== undefined ? s.GotBonus : (s.gotBonus !== undefined ? s.gotBonus : false);
          return { player: p, points, gotBonus };
        }).sort((a, b) => b.points - a.points);

        scores.forEach(s => {
          if (s.points > maxPoints) {
            maxPoints = s.points;
            winners = [s.player];
          } else if (s.points === maxPoints) {
            winners.push(s.player);
          }
        });

        return { scores, winners };
      };

      // Tally wins & bonuses
      const playerStats = {};
      rawResults.forEach(game => {
        const { scores, winners } = getGameDetails(game);

        scores.forEach(s => {
          if (!playerStats[s.player]) playerStats[s.player] = { wins: 0, bonuses: 0 };
          if (s.gotBonus) playerStats[s.player].bonuses++;
        });

        winners.forEach(w => {
          if (!playerStats[w]) playerStats[w] = { wins: 0, bonuses: 0 };
          playerStats[w].wins++;
        });
      });

      // Build overall standings
      let finalStandings = rawStandings.map(s => {
        const p = s.Player || s.player ? (s.Player || s.player).trim() : "";
        const pts = s.Points !== undefined ? s.Points : (s.points !== undefined ? s.points : 0);
        return {
          player: p,
          totalPoints: pts,
          totalWins: playerStats[p]?.wins || 0,
          bonusCount: playerStats[p]?.bonuses || 0
        };
      });

      finalStandings.sort((a, b) => b.totalPoints - a.totalPoints);
      finalStandings = finalStandings.map((s, i) => ({ ...s, rank: i + 1 }));

      const yearWinner = finalStandings.length > 0 ? finalStandings[0].player : 'Unknown';

      // Group by Console
      const consolesMap = {};
      rawResults.forEach(game => {
        const sys = game.System || game.system;
        if (!sys) return;

        if (!consolesMap[sys]) {
          consolesMap[sys] = { consoleName: sys, gamesPlayedCount: 0, playerWinsMap: {} };
        }
        consolesMap[sys].gamesPlayedCount++;

        const { winners } = getGameDetails(game);
        winners.forEach(w => {
          if (!consolesMap[sys].playerWinsMap[w]) consolesMap[sys].playerWinsMap[w] = 0;
          consolesMap[sys].playerWinsMap[w]++;
        });
      });

      const consolesPlayed = Object.values(consolesMap).map(c => ({
        consoleName: c.consoleName,
        gamesPlayedCount: c.gamesPlayedCount,
        playerWins: Object.entries(c.playerWinsMap)
          .map(([player, wins]) => ({ player, wins }))
          .sort((a, b) => b.wins - a.wins)
      })).sort((a, b) => a.consoleName.localeCompare(b.consoleName));

      return { yearWinner, finalStandings, consolesPlayed };
    };

    const pastYears = computed(() => {
      const years = [];
      for (const path in pastYearModules) {
        const data = pastYearModules[path].default || pastYearModules[path];
        // Regex to parse "1" from "../assets/endofyear1.json"
        const match = path.match(/endofyear(\d+)\.json/i);
        const yearNum = match ? parseInt(match[1]) : years.length + 1;

        if (data) {
          const processed = processStandingsData(data);
          if (processed && processed.finalStandings.length > 0) {
            years.push({
              yearNumber: yearNum,
              yearWinner: processed.yearWinner,
              finalStandings: processed.finalStandings,
              consolesPlayed: processed.consolesPlayed
            });
          }
        }
      }
      return years.sort((a, b) => b.yearNumber - a.yearNumber); // Descending order
    });

    return { pastYears };
  }
};
</script>