/*
 * Same three themes as the apps' TopBar (light -> dark -> dark-blue),
 * persisted per browser on the auth domain. Runs in <head> so the theme is
 * applied before the first paint; the toggle is added once the DOM exists.
 */
(function () {
  var THEMES = ['light', 'dark', 'dark-blue']
  var LABELS = { light: 'Light', dark: 'Dark', 'dark-blue': 'Dark Blue' }
  var STORAGE_KEY = 'teaz-theme'
  // PatternFly's own dark variant; our tokens still win over its colors.
  var PF_DARK_CLASS = 'pf-v5-theme-dark'
  // Lucide "sun-moon", same icon as the TopBar's theme item.
  var ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 2v2"/>' +
    '<path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/>' +
    '<path d="M16 12a4 4 0 0 0-4-4"/><path d="m19 5-1.256 1.256"/><path d="M20 12h2"/></svg>'

  function readStored() {
    try {
      var value = localStorage.getItem(STORAGE_KEY)
      return THEMES.indexOf(value) >= 0 ? value : null
    } catch (e) {
      return null
    }
  }

  function initialTheme() {
    var stored = readStored()
    if (stored) return stored
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  var theme = initialTheme()
  var label = null

  function apply(next) {
    theme = next
    var root = document.documentElement
    root.setAttribute('data-theme', next)
    root.classList.toggle(PF_DARK_CLASS, next !== 'light')
    if (label) label.textContent = 'Theme: ' + LABELS[next]
  }

  function cycle() {
    var next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch (e) {
      // Storage blocked: the theme still applies for this page.
    }
  }

  apply(theme)

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.createElement('button')
    button.type = 'button'
    button.className = 'teaz-theme-toggle'
    button.innerHTML = ICON
    label = document.createElement('span')
    button.appendChild(label)
    button.addEventListener('click', cycle)
    document.body.appendChild(button)
    apply(theme)
  })
})()
