import Game from '@/js/components/Game'
;(() => {
  // component
  const el = document.querySelector('[data-game]')
  new Game(el)

  // prevent double tap zoom
  document.querySelectorAll('*').forEach((e) => {
    e.style['touch-action'] = 'manipulation'
  }),
    new MutationObserver((e) => {
      e.forEach(function (e) {
        for (let o = 0; o < e.addedNodes.length; o++) e.addedNodes[o].style['touch-action'] = 'manipulation'
      })
    }).observe(document.body, { childList: !0, subtree: !0 })
})()
