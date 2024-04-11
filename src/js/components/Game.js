import GUI from 'lil-gui'
import { lerp, distance } from '@/js/utils/Math'
import gsap from 'gsap'
import DATA from '../../data/timestamps_2.json'
import { getRandomInt, roundTo } from '../utils/Math'
import { Howl, Howler } from 'howler'
import { isTouch } from '../utils/isTouch'

export default class Game {
  el
  guiObj = {
    marginError: 0.15,
  }
  mouse = {
    x: 0,
    y: 0,
  }
  mouseTarget = {
    x: 0,
    y: 0,
  }
  startOffset = 1
  spacingCoef = 500
  score = 0
  deltaInput = 0
  cumulate = false
  cumul = 0
  isTouch = isTouch()
  isMobile = window.innerWidth < window.innerHeight
  maxBonus = 1
  maxCumul = 0
  count = 0

  constructor(el) {
    this.el = el
    this.videoEl = document.querySelector('[data-game-video]')
    this.arrowRefEl = document.querySelector('[data-arrow-svg]')
    this.introEl = document.querySelector('[data-intro]')
    this.enterEl = document.querySelector('[data-intro-enter]')
    this.loaderEl = document.querySelector('[data-loader]')
    this.arrows = this.el.querySelector('[data-game-arrows]')
    this.timeEl = document.querySelector('[data-game-time]')
    this.timeInputEl = document.querySelector('[data-game-time-input]')
    this.scoreEl = document.querySelector('[data-game-score]')
    this.scoreMessageEl = document.querySelector('[data-game-score-message]')
    this.startEl = document.querySelector('[data-intro-start]')
    this.restartEl = document.querySelector('[data-game-replay]')
    this.controlsEl = document.querySelectorAll('[data-game-control]')

    if (this.isMobile) {
      document.body.classList.add('is-mobile')

      this.spacingCoef = 300
    }

    if (this.isTouch) {
      document.body.classList.add('is-touch')
    }
    this.handleResize()
    // this.setGUI()
    this.events()
    this.setArrows()
  }

  setGUI() {
    const gui = new GUI()
    gui.add(this.guiObj, 'marginError', 0, 0.2)
  }

  events() {
    this.enterEl.addEventListener('click', this.initSound)

    this.startEl.addEventListener('click', this.startGame)
    this.restartEl.addEventListener('click', this.startGame)
    window.addEventListener('resize', this.handleResize, false)

    if (this.isTouch) {
      this.controlsEl.forEach((el) => {
        el.addEventListener('touchstart', this.handleControlStart)
        el.addEventListener('touchend', this.handleControlEnd)
      })

      // prevent double tap zoom on Safari iOS
      this.controlsEl[0].parentNode.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
      })
    } else {
      window.addEventListener('keydown', this.handleKeydown)
      window.addEventListener('keyup', this.handleKeyup)
    }
  }

  setArrows() {
    this.dataDir = []
    DATA.forEach((value, i) => {
      const time = value[0]
      const dir = value[1]
      let dirNb
      const div = document.createElement('div')
      div.classList.add('game__arrow')
      const inner = this.arrowRefEl.cloneNode(true)
      inner.classList.add('game__arrow-inner')
      div.appendChild(inner)

      switch (dir) {
        case 'u':
          dirNb = 0
          if (this.isMobile) {
            div.style.transform = `translate(0%, 0%) translateY(-${time * this.spacingCoef}px) rotate(90deg)`
          } else {
            div.style.transform = `translate(-50%, -50%) translateX(${time * this.spacingCoef}px) rotate(90deg)`
          }
          div.classList.add('up')
          break
        case 'r':
          dirNb = 1
          if (this.isMobile) {
            div.style.transform = `translate(0%, 0%) translateY(-${time * this.spacingCoef}px) rotate(180deg)`
          } else {
            div.style.transform = `translate(-50%, -50%) translateX(${time * this.spacingCoef}px) rotate(180deg)`
          }
          div.classList.add('right')

          break
        case 'd':
          dirNb = 2
          if (this.isMobile) {
            div.style.transform = `translate(0%, 0%) translateY(-${time * this.spacingCoef}px) rotate(270deg)`
          } else {
            div.style.transform = `translate(-50%, -50%) translateX(${time * this.spacingCoef}px) rotate(270deg)`
          }
          div.classList.add('down')
          break
        case 'l':
          dirNb = 3
          if (this.isMobile) {
            div.style.transform = `translate(0%, 0%) translateY(-${time * this.spacingCoef}px)`
          } else {
            div.style.transform = `translate(-50%, -50%) translateX(${time * this.spacingCoef}px)`
          }
          div.classList.add('left')
          break
      }

      this.dataDir.push({ time, dir: dirNb, found: false, div })

      this.arrows.appendChild(div)
    })

    this.arrowRefEl.style.display = 'none'
  }

  initSound = () => {
    if (this.init) return
    this.init = true
    this.loaderEl.classList.add('visible')
    this.introEl.classList.remove('visible')

    this.howlPlayer = new Howl({
      src: ['./backtrack.mp3'],
      loop: false,
      // volume: initVolume,
      onload: () => {
        setTimeout(() => {
          this.el.classList.add('visible')
          this.loaderEl.classList.remove('visible')
        }, 1200)
      },
      onend: this.endGame,
    })
  }

  handleResize = () => {}

  handleControlStart = (e) => {
    const key = parseInt(e.target.dataset.gameControl)
    this.input = key
    this.deltaInput = this.delta
    this.checkValues()
  }

  handleControlEnd = (e) => {
    this.input = ''
    // this.scoreMessageEl.innerHTML = ''
  }

  handleKeydown = (e) => {
    switch (e.keyCode) {
      case 37:
      case 65: // a
      case 81: // q
        // left
        this.input = 3
        this.deltaInput = this.delta
        break
      case 38:
      case 87: // w
      case 90: // z
        // up
        this.input = 0
        this.deltaInput = this.delta
        break
      case 39:
      case 68: // d
        // right
        this.input = 1
        this.deltaInput = this.delta
        break
      case 40:
      case 83: // s
        // down
        this.input = 2
        this.deltaInput = this.delta
        break
    }

    this.checkValues()
  }

  handleKeyup = (e) => {
    switch (e.keyCode) {
      case 37:
      case 65:
      case 81:
      case 39:
      case 68:
        // left
        this.input = ''
        break
      case 38:
      case 87:
      case 90:
      case 40:
        // up
        this.input = ''
        break
    }

    // this.scoreMessageEl.innerHTML = ''
  }

  startGame = () => {
    if (!this.init) return
    this.scoreMessageEl.innerHTML = ''
    this.scoreMessageEl.classList.remove('fugaz')
    this.videoEl.play()
    this.el.classList.remove('end')
    this.el.classList.add('start')
    // this.timeStart = Date.now()
    this.dataDir.forEach((el) => {
      el.found = false
      el.div.classList.remove('missed')
      el.div.classList.remove('passed')
    })
    this.score = 0
    this.count = 0
    this.scoreEl.innerHTML = this.score
    this.timeStart = null
    this.arrows.style.transform = `translateX(50vw)`
    this.delta = this.deltaTime = 0
    gsap.ticker.add(this.handleRAF)
    this.howlPlayer.pause()
    this.howlPlayer.seek(0)
    this.howlPlayer.play()

    //
  }

  endGame = () => {
    this.scoreMessageEl.classList.add('visible')
    this.scoreMessageEl.classList.add('fugaz')
    this.scoreMessageEl.classList.remove('lose')
    this.scoreMessageEl.classList.remove('win')
    this.scoreMessageEl.classList.remove('combo')
    this.scoreMessageEl.innerHTML = `Bravo! ${this.maxCumul} de suite <br /> ${(this.count / DATA.length * 100).toFixed(2)}%`
    this.el.classList.remove('start')
    this.el.classList.add('end')
    this.startEl.innerHTML = 'Rejouer'
  }

  handleRAF = (time, o) => {
    if (!this.timeStart) this.timeStart = time

    const delta = time - this.timeStart
    this.delta = delta
    if (this.isMobile) {
      this.arrows.style.transform = `translateY(${delta * this.spacingCoef}px)`
    } else {
      this.arrows.style.transform = `translateX(-${delta * this.spacingCoef}px)`
    }

    this.timeEl.innerHTML = roundTo(this.delta, 10)
    this.timeInputEl.innerHTML = roundTo(this.deltaInput, 10)
    const margin = this.guiObj.marginError
    for (let i = 0; i < this.dataDir.length; i++) {
      const { time, div } = this.dataDir[i]

      if (time + margin <= this.delta) {
        div.classList.add('missed')
      }
    }
  }

  checkValues() {
    const margin = this.guiObj.marginError
    clearTimeout(this.timeoutMsg)
    // for each arrows, check if input values are good
    for (let i = 0; i < this.dataDir.length; i++) {
      const { time, dir, found, div } = this.dataDir[i]

      if (time + margin > this.delta) {
        // arrow not played yet
        if (time + margin > this.deltaInput && time - margin <= this.deltaInput && !found && this.input === dir) {
          // deltaInput is inside this period
          // console.log('good!')
          this.scoreMessageEl.innerHTML = 'Good!'
          this.count++
          this.cumulate = true

          this.cumul += 1
          if (this.maxCumul < this.cumul) {
            this.maxCumul = this.cumul
          }

          let points = 100

          let isCombo = false

          if (this.cumul >= 20) {
            points *= 5
            this.scoreMessageEl.innerHTML = 'x5!'
            if (this.maxBonus < 5) {
              this.maxBonus = 5
            }
            isCombo = true
          } else if (this.cumul >= 15) {
            points *= 4
            this.scoreMessageEl.innerHTML = 'x4!'
            if (this.maxBonus < 4) {
              this.maxBonus = 4
            }
            isCombo = true
          } else if (this.cumul >= 10) {
            points *= 3
            this.scoreMessageEl.innerHTML = 'x3!'
            if (this.maxBonus < 3) {
              this.maxBonus = 3
            }
            isCombo = true
          } else if (this.cumul >= 5) {
            points *= 2
            this.scoreMessageEl.innerHTML = 'x2!'
            if (this.maxBonus < 2) {
              this.maxBonus = 2
            }
            isCombo = true
          }

          if (isCombo) {
            this.scoreMessageEl.classList.remove('win')
            this.scoreMessageEl.classList.add('combo')
          } else {
            this.scoreMessageEl.classList.add('win')
            this.scoreMessageEl.classList.remove('combo')
          }

          this.scoreMessageEl.classList.remove('lose')

          this.scoreMessageEl.classList.remove('visible')
          setTimeout(() => {
            this.scoreMessageEl.classList.add('visible')
          }, 50)

          this.timeoutMsg = setTimeout(() => {
            this.scoreMessageEl.classList.remove('visible')
          }, 300)

          this.score += points

          this.scoreEl.innerHTML = this.score
          this.dataDir[i].found = true
          div.classList.add('passed')
        } else {
          this.cumul = 0
          this.cumulate = false
          this.scoreMessageEl.innerHTML = 'Bad!'

          this.scoreMessageEl.classList.remove('visible')
          setTimeout(() => {
            this.scoreMessageEl.classList.add('visible')
          }, 50)
          this.scoreMessageEl.classList.remove('win')
          this.scoreMessageEl.classList.remove('combo')
          this.scoreMessageEl.classList.add('lose')

          this.timeoutMsg = setTimeout(() => {
            this.scoreMessageEl.classList.remove('visible')
          }, 300)
          // this.score--
          // console.log('bad!')
          div.classList.add('missed')

          this.scoreEl.innerHTML = this.score
        }
        break
      }
    }
  }
}
