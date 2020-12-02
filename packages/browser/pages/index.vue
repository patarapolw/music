<template>
  <section class="section">
    <b-menu v-if="!$fetchState.pending">
      <b-menu-list v-if="$route.query.q" label="Search Result">
        <b-menu-item
          v-for="f in result"
          :key="f.id"
          :label="format(f)"
          tag="router-link"
          :to="`/item/${f.id}`"
        ></b-menu-item>
      </b-menu-list>

      <b-menu-list label="Recent">
        <b-menu-item
          v-for="f in recent"
          :key="f.id"
          :label="format(f)"
          tag="router-link"
          :to="`/item/${f.id}`"
        ></b-menu-item>
      </b-menu-list>

      <b-menu-list label="Favorite">
        <b-menu-item
          v-for="f in favorite"
          :key="f.id"
          :label="format(f)"
          tag="router-link"
          :to="`/item/${f.id}`"
        ></b-menu-item>
      </b-menu-list>
    </b-menu>
  </section>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ky from 'ky'

import { IDbEntry } from '~/server/db'

@Component<IndexPage>({
  watch: {
    '$route.query.q': '$fetch',
  },
  async fetch() {
    const [r1, r2] = (await Promise.all([
      ky.get('/api/recent').json(),
      ky.get('/api/favorite').json(),
      (async () => {
        if (this.$route.query.q) {
          const q = this.$route.query.q as string

          const { result } = (await ky
            .get('/api/q', {
              searchParams: { q },
            })
            .json()) as {
            result: IDbEntry[]
          }

          this.result = result
        }
      })(),
    ])) as {
      result: IDbEntry[]
    }[]

    this.recent = r1.result
    this.favorite = r2.result
  },
})
export default class IndexPage extends Vue {
  result: IDbEntry[] = []
  recent: IDbEntry[] = []
  favorite: IDbEntry[] = []

  format(it: IDbEntry) {
    const author = it.author ? `[${it.author}] ` : ''
    return author + it.title
  }
}
</script>
