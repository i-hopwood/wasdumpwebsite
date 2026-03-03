<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
    <div class="container">
      <a class="navbar-brand py-0" href="#">
      
        <span class="text-white">WAS</span><span class="text-warning">DUMP</span>
      
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="#About">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#Schedule">Schedule</a>
          </li>
            <li class="nav-item">
            <a class="nav-link" href="#RecentVideos">Recent Videos</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#PassAndPlay">Pass and Play</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#RetroRaces">Retro Races</a>
          </li>
        
        </ul>
        <div class="d-flex align-items-center">
          <a href="https://www.youtube.com/@WASDump" target="_blank" class="nav-link text-danger fs-4 me-3" title="YouTube">
            <i class="bi bi-youtube"></i>
          </a>
          <a href="https://www.twitch.tv/wasdump" target="_blank" class="nav-link text-primary fs-4" title="Twitch">
            <i class="bi bi-twitch"></i>
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'cHeader'
}
</script>

<style scoped>
</style>