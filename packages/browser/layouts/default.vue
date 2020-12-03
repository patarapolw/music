<template>
  <section class="main-content columns">
    <b-sidebar fullheight reduce expand-on-hover open>
      <div class="p-2">
        <form class="mb-4" @submit.prevent="doSearch">
          <b-field label="Search">
            <b-input v-model="q"></b-input>
          </b-field>
        </form>
        <b-menu class="is-custom-mobile" :accordion="false" :activable="false">
          <b-menu-list label="Links">
            <b-menu-item label="Home" tag="router-link" to="/"></b-menu-item>
          </b-menu-list>

          <b-menu-list label="By artists">
            <b-menu-item
              v-for="(it, i) in sidebarItems"
              :key="i"
              :label="it.title"
              expanded
              :tag="it.id ? 'router-link' : 'a'"
              :to="it.id ? `/item/${it.id}` : null"
            >
              <template slot="label">
                <nuxt-link></nuxt-link>
              </template>
              <b-menu-item
                v-for="(el, j) in it.children || []"
                :key="j"
                :label="el.title"
                tag="router-link"
                :to="`/item/${el.id}`"
              ></b-menu-item>
            </b-menu-item>
          </b-menu-list>
        </b-menu>
      </div>
    </b-sidebar>

    <div class="container column is-offset-1">
      <nuxt />
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import axios from 'axios'

import { IDbEntry } from '~/server/db'

@Component<DefaultLayout>({
  async fetch() {
    const {
      data: { result },
    } = await axios.get<{
      result: IDbEntry[]
    }>('/api/all')

    const authorMap = new Map<string | symbol, IDbEntry[]>()
    const noAuthor = Symbol('noAuthor')
    result.map((f) => {
      const m = authorMap.get(f.author || noAuthor) || []
      m.push(f)
      authorMap.set(f.author || noAuthor, m)
    })

    this.sidebarItems = Array.from(authorMap)
      .filter(([k]) => typeof k === 'string')
      .sort(([k1], [k2]) => (k1 as string).localeCompare(k2 as string))
      .map(([k, m]) => {
        return {
          title: k as string,
          children: m.sort(({ title: i1 }, { title: i2 }) =>
            i1.localeCompare(i2)
          ),
        }
      })

    if (authorMap.has(noAuthor)) {
      this.sidebarItems = [
        ...this.sidebarItems,
        ...authorMap
          .get(noAuthor)!
          .sort(({ title: i1 }, { title: i2 }) => i1.localeCompare(i2)),
      ]
    }
  },
})
export default class DefaultLayout extends Vue {
  isDrawer = false
  q = (this.$route.query.q as string) || ''

  sidebarItems: {
    title: string
    id?: string
    children?: {
      title: string
      id?: string
    }[]
  }[] = []

  doSearch() {
    this.$router.push({
      path: '/',
      query: {
        q: this.q,
      },
    })
  }
}
</script>

<style lang="scss">
.unset {
  all: unset;
}
</style>

<style lang="scss" scoped>
.menu {
  ::v-deep {
    a:hover {
      background-color: rgba(0, 153, 255, 0.5);
    }
  }

  &:not(:hover) ::v-deep {
    p,
    span {
      white-space: nowrap;
      overflow: hidden;
    }
  }
}
</style>
