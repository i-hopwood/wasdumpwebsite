<template>
  <div class="c-vods container mt-4">
    <h2 class="mb-4 text-center text-primary"><i class="bi bi-youtube me-2"></i>Recent Videos</h2>
    <div class="row">
      <div v-for="video in videos" :key="video.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm border-secondary video-card">
          <div class="ratio ratio-16x9">
            <template v-if="activeVideoId === video.id">
              <iframe 
                :src="`https://www.youtube.com/embed/${video.id}?autoplay=1`" 
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </template>
            <template v-else>
              <img 
                :src="video.thumbnail" 
                class="card-img-top" 
                :alt="video.title"
                style="cursor: pointer;"
                @click="activeVideoId = video.id"
              >
              <div 
                class="play-button-overlay position-absolute top-50 start-50 translate-middle"
                @click="activeVideoId = video.id"
                style="cursor: pointer;"
              >
                <i class="bi bi-play-circle-fill text-white display-4" style="opacity: 0.8; text-shadow: 0 0 10px rgba(0,0,0,0.5);"></i>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import videosData from '../assets/videos.json';

export default {
  name: 'cVods',
  data() {
    return {
      activeVideoId: null
    }
  },
  computed: {
    videos() {
      return videosData.map((video, index) => {
        const id = this.getVideoId(video.url);
        return {
          id: id || `vid-${index}`,
          url: video.url,
          title: video.title || (id ? 'Watch Video' : 'Invalid Video URL'),
          date: video.date || null,
          thumbnail: video.thumbnail || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '')
        };
      });
    }
  },
  methods: {
    getVideoId(url) {
      if (!url) return null;
      // standard youtube & short url regex
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
.card-img-top {
  height: 100%;
  object-fit: cover;
}
</style>