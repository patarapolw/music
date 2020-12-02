<template>
  <section class="section column is-offset-2-desktop is-8-desktop">
    <b-rate v-model="rating" @change="doRate"></b-rate>
    <div class="content" v-html="html"></div>
  </section>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ky from 'ky'

@Component<ItemPage>({
  async fetch() {
    const [r1, r2] = await Promise.all([
      ky
        .get('/api', {
          searchParams: { id: this.$route.params.fileId },
        })
        .text(),
      ky
        .get('/api/rate', {
          searchParams: { id: this.$route.params.fileId },
        })
        .json(),
    ])

    this.html = r1
    this.rating = (r2 as {
      result: number
    }).result
  },
})
export default class ItemPage extends Vue {
  html = ''
  rating = 0

  async doRate(v: number) {
    this.rating = v

    await ky
      .patch('/api/rate', {
        searchParams: {
          id: this.$route.params.fileId,
          rating: this.rating,
        },
      })
      .json()
  }
}
</script>
