<template>
  <div class="d-flex flex-column min-vh-100">
    <cHeader />
    <main class="flex-grow-1 mt-5 pt-4">
      <RouterView />
    </main>
    <cFooter />
  </div>
</template>

<script>
import cHeader from '@/components/cHeader.vue';
import cFooter from '@/components/cFooter.vue';

export default {
  name: 'vPage',
  components: {
    cHeader,
    cFooter
  },
  setup() {
    return {}
  }
}
</script>

<style scoped>
</style>