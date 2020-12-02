<template>
  <div
    class="content mt-4 column is-offset-2-desktop is-8-desktop"
    v-html="html"
  ></div>
</template>

<script lang="ts">
import Vue from 'vue'
import ky from 'ky'

export default Vue.extend({
  async fetch() {
    this.html = await ky
      .get('/api', {
        searchParams: { id: this.$route.params.fileId },
      })
      .text()
  },
  data() {
    return {
      html: `<h2>Loading</h2>`,
    }
  },
})
</script>
