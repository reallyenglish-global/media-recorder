const eventToCallback = (event) => {
  var parts = event.split(/[:|-]/)
  return parts.reduce((callback, part) => {
    const cap = part.charAt(0).toUpperCase()
    const rest = part.substring(1).toLowerCase()
    return `${callback}${cap}${rest}`
  }, 'on')
}

export { eventToCallback }
