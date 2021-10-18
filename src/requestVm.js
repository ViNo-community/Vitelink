const https = require('https')

function request (address) {
  return new Promise(resolve => {
    try {
      const addr = new URL(address)

      const req = https.request({
        hostname: addr.hostname,
        port: 443,
        path: addr.pathname,
        method: 'GET'
      }, res => {
        if (res.statusCode !== 200) return resolve(`code_${res.statusCode}`)

        let data = ''

        res.on('data', (d) => {
          data += d
        })

        res.on('end', () => {
          resolve(`${data}`)
        })
      })

      req.on('error', (err) => {
        resolve(`err_${err.stack}`)
      })

      req.end()
    } catch (err) {
      resolve(`err_${err.stack}`)
    }
  })
}

module.exports = { request }
