const got = require('got')

const client = got.extend({
  baseUrl: 'https://api.github.com',
  json: true,
  headers: {
    Authorization: `token ${process.env.AUTH_TOKEN}`
  }
})

exports.handbookSync = async (req, res) => {
  try {
    const {
      commit: { sha: parentSha }
    } = (await client.get('/repos/suncoast-devs/web/branches/master')).body

    console.log(parentSha)

    const {
      commit: { sha: targetSha }
    } = (await client.get('/repos/suncoast-devs/handbook/branches/master')).body

    console.log(targetSha)

    const res = await client.post('/repos/suncoast-devs/web/git/trees', {
      body: {
        base_tree: parentSha,
        tree: [
          {
            path: 'data/handbook',
            mode: '160000',
            type: 'commit',
            sha: targetSha
          }
        ]
      }
    })

    const { sha: treeSha } = res.body

    console.log(treeSha)

    const { sha: commitSha } = (await client.post('/repos/suncoast-devs/web/git/commits', {
      body: {
        message: 'Synchronize Handbook',
        tree: treeSha,
        parents: [parentSha]
      }
    })).body

    console.log(commitSha)

    await client.patch('/repos/suncoast-devs/web/git/refs/heads/master', {
      body: {
        sha: commitSha
      }
    })

    console.log('OK')
  } catch (err) {
    console.error(err)
  }
}

exports.handbookSync()
