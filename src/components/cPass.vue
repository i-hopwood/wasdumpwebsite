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

        <div class="card bg-black bg-opacity-25 border-secondary">
          <div class="card-body position-relative">
            <i
              class="bi bi-quote position-absolute top-0 start-0 ms-2 mt-1 fs-1 text-muted opacity-25"
            ></i>
            <h5 class="card-title h6 text-uppercase text-warning mb-3 ms-4">Handoff Report</h5>
            <p class="card-text fst-italic ms-4 lead">{{ passData.lastHandOffReport }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import passData from '@/assets/pass.json'

export default {
  name: 'cPass',
  data() {
    return {
      passData,
    }
  },
}
</script>

<style scoped>
/* No component-specific styles needed, relying on global theme */
</style>
