import GUI from 'lil-gui'
import { lerp, distance } from '@/js/utils/Math'
import gsap from 'gsap'
import DATA from '../../data/timestamps.json'
import { getRandomInt, roundTo } from '../utils/Math'

export default class Game {
  el
  guiObj = {
    marginError: 0.1,
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

  constructor(el) {
    this.el = el
    this.arrows = this.el.querySelector('[data-game-arrows]')
    this.timeEl = document.querySelector('[data-game-time]')
    this.timeInputEl = document.querySelector('[data-game-time-input]')
    this.scoreEl = document.querySelector('[data-game-score]')
    this.scoreMessageEl = document.querySelector('[data-game-score-message]')
    this.startEl = document.querySelector('[data-intro-start]')
    this.handleResize()
    this.setGUI()
    this.events()
    this.setArrows()
  }

  setGUI() {
    const gui = new GUI()
    gui.add(this.guiObj, 'marginError', 0, 0.2)
  }

  events() {
    this.startEl.addEventListener('click', this.startGame)
    window.addEventListener('resize', this.handleResize, false)
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('keyup', this.handleKeyup)
    // if (!this.isTouch)
  }

  setArrows() {
    this.dataDir = []
    DATA.forEach((value, i) => {
      const div = document.createElement('div')
      div.classList.add('game__arrow')

      const dir = getRandomInt(4)

      switch (dir) {
        case 0:
          div.style.transform = `translate(-50%, -50%) translateX(${value * this.spacingCoef}px)`
          break
        case 1:
          div.style.transform = `translate(-50%, -50%) translateX(${value * this.spacingCoef}px) rotate(90deg)`
          break
        case 2:
          div.style.transform = `translate(-50%, -50%) translateX(${value * this.spacingCoef}px) rotate(180deg)`
          break
        case 3:
          div.style.transform = `translate(-50%, -50%) translateX(${value * this.spacingCoef}px) rotate(270deg)`
          break
      }

      this.dataDir.push({ time: value, dir, found: false })

      this.arrows.appendChild(div)
    })
  }

  handleResize = () => {}

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

    this.scoreMessageEl.innerHTML = ''
  }

  startGame = () => {
    // this.timeStart = Date.now()
    this.dataDir.forEach((el) => {
      el.found = false
    })
    this.score = 0
    this.scoreEl.innerHTML = this.score
    this.timeStart = null
    this.arrows.style.transform = `translateX(50vw)`
    this.delta = this.deltaTime = 0
    gsap.ticker.add(this.handleRAF)
  }

  handleRAF = (time, o) => {
    if (!this.timeStart) this.timeStart = time

    const delta = time - this.timeStart
    this.delta = delta

    this.arrows.style.transform = `translateX(50vw) translateX(-${delta * this.spacingCoef}px)`

    this.timeEl.innerHTML = roundTo(this.delta, 10)
    this.timeInputEl.innerHTML = roundTo(this.deltaInput, 10)
  }

  checkValues() {
    const margin = this.guiObj.marginError
    // for each arrows, check if input values are good
    for (let i = 0; i < this.dataDir.length; i++) {
      const { time, dir, found } = this.dataDir[i]

      if (time + margin > this.delta) {
        // arrow not played yet
        if (time + margin > this.deltaInput && time - margin < this.deltaInput && !found && this.input === dir) {
          // deltaInput is inside this period
          // console.log('good!')
          this.scoreMessageEl.innerHTML = 'Good!'
          this.score++
          this.scoreEl.innerHTML = this.score
          this.dataDir[i].found = true
        } else {
          this.scoreMessageEl.innerHTML = 'Bad!'
          this.score--
          // console.log('bad!')

          this.scoreEl.innerHTML = this.score
        }
        break
      }
    }
  }
}
