import ChordSheetJS from 'chordsheetjs'
import showdown from 'showdown'

const parser = new ChordSheetJS.ChordProParser()
const formatter = new ChordSheetJS.HtmlTableFormatter()

const mdConverter = new showdown.Converter({
  metadata: true,
  emoji: true
})
mdConverter.addExtension(
  {
    type: 'lang',
    filter: (txt) => {
      return txt.replace(
        /(?:^|\n)```chordsheet\n(.+)\n```/gs,
        (_: unknown, p1: string) => {
          const html = formatter.format(parser.parse(p1))
          const body = document.createElement('body')
          body.innerHTML = html
          body.querySelectorAll('.lyrics').forEach((el) => {
            el.innerHTML = el.textContent || ''
          })

          return body.innerHTML
        }
      )
    }
  },
  'chordsheet'
)

document.getElementById('app')!.innerHTML = mdConverter.makeHtml(
  require('fs').readFileSync(
    '/home/patarapolw/projects/music-browser/_data/custom/test.md',
    'utf8'
  )
)
