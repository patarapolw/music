const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const dree = require('dree')
const { Type } = require('dree')

const fileTree = dree.scan('./_docs', {
  extensions: ['md'],
  exclude: [/README\.md$/, /\.vuepress/]
})

module.exports = {
  title: 'Music Browser, by polv',
  description: 'Browse music sheets and audios',
  themeConfig: {
    sidebar: ['/', ...recurseParseFileTree(fileTree.children)]
  }
}

console.log(recurseParseFileTree(fileTree.children))

/**
 * @typedef {{title?: string; path: string; collapsable: false; children?: Sidebar[]}} Sidebar
 */

/**
 *
 * @param {import('dree').Dree[]} ps
 * @returns {Sidebar[]}
 */
function recurseParseFileTree(ps) {
  return ps.map((ft) => {
    if (ft.type === Type.DIRECTORY) {
      const children = ft.children ? recurseParseFileTree(ft.children) : null

      if (children) {
        let title = ''
        let isLinked = false

        try {
          const { data, content } = matter(
            fs.readFileSync(path.join(ft.path, 'README.md'), 'utf8')
          )
          title = data.title

          if (content.trim()) {
            isLinked = true
          }
        } catch (_) {}

        return {
          title: title || ft.name,
          path: isLinked ? '/' + ft.relativePath : undefined,
          collapsable: false,
          children
        }
      } else {
        return '/' + ft.relativePath
      }
    }

    return '/' + ft.relativePath.replace(/\.md$/, '')
  })
}
