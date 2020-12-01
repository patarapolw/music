<template>
  <section class="section">
    <b-menu v-if="!$fetchState.pending">
      <b-menu-list v-if="$route.query.q" label="Search Result">
        <b-menu-item
          v-for="f in result"
          :key="f.fileId"
          :label="f.title"
          @click="goto(f.fileId)"
        ></b-menu-item>
      </b-menu-list>

      <b-menu-list label="Recent">
        <b-menu-item
          v-for="f in recent"
          :key="f.fileId"
          :label="f.title"
          @click="goto(f.fileId)"
        ></b-menu-item>
      </b-menu-list>

      <b-menu-list label="Favorite">
        <b-menu-item
          v-for="f in favorite"
          :key="f.fileId"
          :label="f.title"
          @click="goto(f.fileId)"
        ></b-menu-item>
      </b-menu-list>
    </b-menu>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  async fetch() {
    if (this.$route.query.q) {
      const q = this.$route.query.q as string

      this.result = [
        {
          title: 'File 1',
          fileId: 'file1',
        },
        {
          title: 'File 2',
          fileId: 'file2',
        },
      ].filter(({ title, fileId }) => title.includes(q) || fileId.includes(q))
    }
  },
  data() {
    return {
      result: [] as {
        title: string
        fileId: string
      }[],
      recent: [
        {
          title: 'File 2',
          fileId: 'file2',
        },
        {
          title: 'File 1',
          fileId: 'file1',
        },
      ],
      favorite: [
        {
          title: 'File 3',
          fileId: 'file3',
        },
      ],
    }
  },
  watch: {
    '$route.query.q': '$fetch',
  },
  methods: {
    goto(fileId: string) {
      this.$router.push(`/item/${fileId}`)
    },
  },
})
</script>
