styledLog = message => {
  const date = new Date()
  const today = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).split(' ').join('-')
  const timeString = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
  console.log(`\x1b[33m${today} ${timeString}\x1b[0m [\x1b[32mLOG\x1b[0m]: ${message}`)
}

module.exports = { styledLog }