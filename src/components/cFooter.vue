<template>
  <footer class="footer mt-auto py-3 bg-dark text-white border-top border-secondary">
    <div class="container text-center">
      <div class="row align-items-center">
        <div class="col-md-4 text-md-start mb-3 mb-md-0">
          <span class="text-muted">© 2026 WASDump</span>
        </div>
        <div class="col-md-4 mb-3 mb-md-0">
          <a href="mailto:wasdumpgames@gmail.com" class="text-decoration-none text-light d-flex align-items-center justify-content-center">
            <i class="bi bi-envelope-fill me-2 text-primary"></i>
            wasdumpgames@gmail.com
          </a>
        </div>
        <div class="col-md-4 text-md-end">
          <a href="https://www.youtube.com/@WASDump" target="_blank" class="text-danger me-3 fs-5"><i class="bi bi-youtube"></i></a>
          <a href="https://www.twitch.tv/wasdump" target="_blank" class="text-primary fs-5"><i class="bi bi-twitch"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'cFooter'
}
</script>

<style scoped>
.footer {
  background-color: var(--was-bg-card) !important;
}
</style>