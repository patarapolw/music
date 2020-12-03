<template>
  <section class="section column is-offset-2-desktop is-8-desktop">
    <form class="rating" @submit.prevent="doRate">
      <b-rate v-model="rating" @change="doRate"></b-rate>
      <input v-model="rating" type="text" pattern="\\d+" />
    </form>

    <div class="content" v-html="html"></div>
  </section>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'

@Component<ItemPage>({
  async fetch() {
    const [r1, r2] = await Promise.all([
      axios
        .get('/api', {
          params: { id: this.$route.params.fileId },
          transformResponse: (r) => r,
        })
        .then(({ data }) => data),
      axios
        .get<{
          result: number
        }>('/api/rate', {
          params: { id: this.$route.params.fileId },
        })
        .then(({ data }) => data),
    ])

    this.html = r1

    const r = r2.result

    this.rating = (r || '').toString()
  },
})
export default class ItemPage extends Vue {
  html = ''
  rating = ''

  async doRate(v: number) {
    this.rating = typeof v === 'number' ? v.toString() : this.rating

    await axios.patch('/api/rate', undefined, {
      params: {
        id: this.$route.params.fileId,
        rating: parseInt(this.rating) || 0,
      },
    })
  }
}
</script>

<style lang="scss" scoped>
.rating {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.75rem;

  .rate {
    margin-bottom: 0;
  }

  input {
    all: unset;
    width: 2em;
    text-align: center;
  }
}
</style>
