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
    gui.add(this.guiObj, 'marginError', 0, 0.5)
  }

  events() {
    this.startEl.addEventListener('click', this.startGame)
    window.addEventListener('resize', this.handleResize, false)
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('keyup', this.handleKeyup)
    if (!this.isTouch) {
      window.addEventListener('mousemove', this.handleMousemove)
    }
  }

  setArrows() {
    this.dataDir = []
    DATA.forEach((value, i) => {
      const div = document.createElement('div')
      div.classList.add('game__arrow')

      div.style.transform = `translate(-50%, -50%) translateX(${value * this.spacingCoef}px)`

      this.dataDir.push({ time: value, dir: getRandomInt(4) })

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
        this.input = 'left'
        this.deltaInput = this.delta
        break
      case 38:
      case 87: // w
      case 90: // z
        // up
        this.input = 'up'
        this.deltaInput = this.delta
        break
      case 39:
      case 68: // d
        // right
        this.input = 'right'
        this.deltaInput = this.delta
        break
      case 40:
      case 83: // s
        // down
        this.input = 'down'
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
      const { time } = this.dataDir[i]

      if (time + margin > this.delta) {
        // arrow not played yet
        if (time + margin > this.deltaInput && time - margin < this.deltaInput) {
          // deltaInput is inside this period
          // console.log('good!')
          this.scoreMessageEl.innerHTML = 'Good!'
          this.score++
          this.scoreEl.innerHTML = this.score
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

  handleMousemove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1

    const dist = distance(0, 0, x, y)

    this.mouse.x = dist > 0.75 ? 0 : x
    this.mouse.y = dist > 0.75 ? 0 : y
  }
}
