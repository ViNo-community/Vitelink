function isLegitUrl(url) {
  const link = new URL(url)
  if(!link.protocol === 'https:') return false

  return true
}

module.exports = { isLegitUrl }