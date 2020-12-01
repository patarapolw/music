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
          <b-menu-list label="Menu">
            <b-menu-item
              v-for="(it, i) in sidebarItems"
              :key="i"
              :label="it.title"
              expanded
              @click="it.fileId ? goto(it.fileId) : null"
            >
              <b-menu-item
                v-for="(el, j) in it.children || []"
                :key="j"
                :label="el.title"
                @click="el.fileId ? goto(el.fileId) : null"
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

@Component
export default class DefaultLayout extends Vue {
  isDrawer = false
  q = this.$route.query.q as string

  readonly sidebarItems = [
    {
      title: 'Home',
      children: [
        {
          title: 'File 1',
          fileId: 'file1',
        },
      ],
    },
    {
      title: 'Inspire',
      children: [
        {
          title: 'File 2',
          fileId: 'file2',
        },
      ],
    },
    {
      title: 'File 3',
      fileId: 'file3',
    },
  ]

  goto(fileId: string) {
    this.$router.push(`/item/${fileId}`)
  }

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

  &:not(:hover) ::v-deep span {
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
