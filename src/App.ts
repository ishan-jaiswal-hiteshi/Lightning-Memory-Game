import { Lightning } from '@lightningjs/sdk'
import Color from '@lightningjs/sdk/src/Colors'
import Card from './componenets/cards'

export default class MemoryGame extends Lightning.Component {
  private score = 0
  private firstCard: Card | null = null
  private secondCard: Card | null = null
  private activeItem: Lightning.Component | null = null
  private startTime = 0

  static override _template() {
    return {
      Background: { w: 1920, h: 1080, rect: true, color: Color('black').get() },
      Score: {
        x: 20,
        y: 20,
        text: {
          text: 'Score: 0',
          fontSize: 32,
          textColor: Color('white').get(),
        },
        visible: false,
      },
      Grid: {
        x: 330,
        y: 100,
        w: 1260,
        flex: {
          direction: 'row',
          wrap: true,
        },
        children: [],
        visible: false,
      },
      StartScreen: {
        x: 840,
        y: 440,
        //mount: 0.5,
        visible: true,
        //interactive: true,
        // flexItem: {
        //   justifyContent: "center",
        //   alignItem: "center",
        // },
        //collision: true,
        StartButton: {
          w: 300,
          h: 80,
          rect: true,
          //color: Color("white").get(),
          //interactive: true,
          collision: true,
          text: {
            text: 'Start Game',
            fontSize: 43,
            FontFace: 'SemiBold',
            textColor: Color('red').get(),
            //collision: true,
          },
        },
        TimerText: {
          y: 100,
          text: { text: '', fontSize: 25, textColor: Color('green').get() },
          visible: false,
        },
      },
    }
  }

  override _init(): void {
    this.score = 0
    this.firstCard = null
    this.secondCard = null
    this._setState('Start')
  }

  private _buildCards(): void {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    let cardLetters = letters.concat(letters)
    cardLetters = cardLetters.sort(() => Math.random() - 0.5)
    const cards = cardLetters.map((letter, index) => ({
      type: Card,
      letter: letter,
      index: index,
      //interactive: true,
      //collision: true,
    }))
    this.tag('Grid').children = cards
    // if (cards.length > 0) {
    //   this.activeItem = this.tag("Grid").children[0];
    // }
  }

  public $handleCardSelect(card: Card): void {
    if (card.revealed || card.disabled) return
    if (!this.firstCard) {
      this.firstCard = card
      card.reveal()
    } else if (!this.secondCard && card !== this.firstCard) {
      this.secondCard = card
      card.reveal()
      this._checkForMatch()
    }
  }

  private _checkForMatch(): void {
    if (this.firstCard && this.secondCard) {
      if (this.firstCard.letter === this.secondCard.letter) {
        this.firstCard.disable()
        this.secondCard.disable()
        this.score++
        this.patch({
          Score: { text: { text: 'Score: ' + this.score } },
        })
        this.firstCard = null
        this.secondCard = null
        if (this.score === 8) {
          this._setState('Wait')
          const compleatedIn = Date.now() - this.startTime
          const seconds = Math.floor(compleatedIn / 1000)
          setTimeout(() => {
            this.patch({
              StartScreen: {
                visible: true,
                TimerText: {
                  visible: true,
                  text: { text: 'Time: ' + seconds + ' seconds' },
                },
              },
              Score: { visible: false },
              Grid: { visible: false },
            })
            this._setState('Start')
          }, 2000)
        }
      } else {
        //this disables controls
        this._setState('Wait')
        setTimeout(() => {
          this.firstCard && this.firstCard.hide()
          this.secondCard && this.secondCard.hide()
          this.firstCard = null
          this.secondCard = null
          this._setState('Playing')
        }, 1000)
      }
    }
  }

  private startGame(): void {
    this.startTime = Date.now()
    this.score = 0
    this.patch({
      Score: { text: { text: 'Score: 0' }, visible: true },
      Grid: { visible: true },
      StartScreen: {
        visible: false,
        TimerText: { visible: false, text: { text: '' } },
      },
    })
    this._buildCards()
    const gridChildren = this.tag('Grid').children
    // if (gridChildren && gridChildren.length > 0) {
    //   this.activeItem = gridChildren[0];
    // }
    this._setState('Playing')
  }

  static override _states() {
    return [
      class Start extends MemoryGame {
        override $enter() {
          this.patch({
            StartScreen: { visible: true },
            Score: { visible: false },
            Grid: { visible: false },
          })
        }

        override _handleEnterRelease() {
          this.startGame()
        }
        _handleClick() {
          this.startGame()
        }

        _handleHover() {
          this.tag('StartScreen.StartButton').patch({
            text: {
              fontSize: 45,
              textColor: Color('green').get(),
              //collision: true,
            },
          })
        }

        _handleUnhover() {
          this.tag('StartScreen.StartButton').patch({
            text: {
              fontSize: 44,
              textColor: Color('red').get(),
              //collision: true,
            },
          })
        }
      },
      class Playing extends MemoryGame {
        override $enter() {
          this.patch({
            StartScreen: { visible: false },
            Score: { visible: true },
            Grid: { visible: true },
          })
          const gridChildren = this.tag('Grid').children
          if (gridChildren && gridChildren.length > 0) {
            //this.activeItem = gridChildren[0];
          }
        }
        override _handleLeft() {
          const grid = this.tag('Grid').children
          const index = grid.indexOf(this.activeItem)
          if (index > 0) {
            this.activeItem = grid[index - 1]
            this.patch({})
          }
        }
        override _handleRight() {
          const grid = this.tag('Grid').children
          const index = grid.indexOf(this.activeItem)
          if (index < grid.length - 1) {
            this.activeItem = grid[index + 1]
            this.patch({})
          }
        }
        override _handleUp() {
          const grid = this.tag('Grid').children
          const index = grid.indexOf(this.activeItem)
          if (index - 4 >= 0) {
            this.activeItem = grid[index - 4]
            this.patch({})
          }
        }
        override _handleDown() {
          const grid = this.tag('Grid').children
          const index = grid.indexOf(this.activeItem)
          if (index + 4 < grid.length) {
            this.activeItem = grid[index + 4]
            this.patch({})
          }
        }
        // override _getFocused() {
        //   return this.activeItem;
        // }
      },
      // class Wait extends MemoryGame {
      //   //so that it holds on wait
      //   override $enter() {}
      // },
    ]
  }

  // override _handleEnterRelease(): void {
  //   if (this.state === "Playing" && this.activeItem) {
  //     //this.activeItem._handleEnter();
  //   }
  // }
}
