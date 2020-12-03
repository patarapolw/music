import axios from 'axios'

axios
  .get('http://localhost:3000/api/q', {
    params: {
      q: 'chopin no10',
    },
  })
  .then((r) => console.log(r.data))
