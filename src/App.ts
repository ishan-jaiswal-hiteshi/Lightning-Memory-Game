import { Lightning } from '@lightningjs/sdk'
import Card from './componenets/cards'
import Color from '@lightningjs/sdk/src/Colors'

export default class MemoryGame extends Lightning.Component {
  private score = 0
  private firstCard: Card | null = null
  private secondCard: Card | null = null
  private activeItem: Lightning.Component | null = null

  static override _template() {
    return {
      // Background for TV display
      Background: { w: 1920, h: 1080, rect: true, color: 0xff202020 },
      // Score display at the top-left
      collision: true,
      Score: {
        x: 20,
        y: 20,
        text: { text: 'Score: 0', fontSize: 32, textColor: 0xffffffff },
        collision: true,
      },
      // The grid container for cards
      Grid: {
        x: 330,
        y: 100,
        w: 1260,
        //h: 600,
        collision: true,
        flex: {
          direction: 'row',
          wrap: true,
          //justifyContent: "center",
          //alignContent: "center",
          //alignItems: "center",
          //spacing: 40, // gap between cards
        },
        children: [],
      },
      // Reset button (focusable and interactive)
      ResetButton: {
        x: 20,
        y: 750,
        w: 200,
        h: 60,
        rect: true,
        interactive: true,
        color: 0xff0077cc,
        mountY: 0.5,
        collision: true,
        text: {
          text: 'Reset',
          fontSize: 32,
          verticalAlign: 'end',
          textColor: Color('white').get(),
        },
        FocusRect: {
          rect: true,
          w: 200,
          h: 60,
          visible: false,
          color: Color('blue').get(),
          collision: true,
        },
      },
    }
  }

  override _init(): void {
    this.score = 0
    this.firstCard = null
    this.secondCard = null
    //this.interactive = true;
    this._buildCards()
    this._setState('Idle')
  }

  private _buildCards(): void {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    let cardLetters = letters.concat(letters)
    cardLetters = cardLetters.sort(() => Math.random() - 0.5)
    const cards = cardLetters.map((letter, index) => ({
      type: Card,
      letter: letter,
      index: index,
      interactive: true,
      // signals: {
      //   $handleCardSelect: "$handleCardSelect",
      // },
    }))
    this.tag('Grid').children = cards
    if (cards.length > 0) {
      this.activeItem = this.tag('Grid').children[0]
    }
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
        // A match! Disable the cards and update the score.
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
          setTimeout(() => {
            this._resetGame()
          }, 2000)
        }
      } else {
        this._setState('Wait')
        setTimeout(() => {
          this.firstCard && this.firstCard.hide()
          this.secondCard && this.secondCard.hide()
          this.firstCard = null
          this.secondCard = null
          this._setState('Idle')
        }, 1000)
      }
    }
  }

  private _resetGame(): void {
    this.score = 0
    this.patch({
      Score: { text: { text: 'Score: 0' } },
    })
    this.firstCard = null
    this.secondCard = null
    this._buildCards()
    this.activeItem = this.tag('Grid').children[0]
    this._setState('Idle')
  }

  static override _states() {
    return [
      class Idle extends MemoryGame {
        override $enter() {
          const gridChildren = this.tag('Grid').children
          if (gridChildren && gridChildren.length > 0) {
            this.activeItem = gridChildren[0]
          }
          this.tag('ResetButton').patch({ FocusRect: { visible: false } })
        }
      },
    ]
  }

  override _getFocused(): Lightning.Component | null {
    if (this.state === 'Idle' && this.activeItem) {
      return this.activeItem
    }
    return this
  }

  override _handleLeft(): void {
    const grid = this.tag('Grid').children
    const index = grid.indexOf(this.activeItem)
    if (index > 0) {
      this.activeItem = grid[index - 1]
      this.patch({})
    }
  }

  override _handleRight(): void {
    const grid = this.tag('Grid').children
    const index = grid.indexOf(this.activeItem)
    if (index < grid.length - 1) {
      this.activeItem = grid[index + 1]
      this.patch({})
    }
  }

  override _handleUp(): void {
    const grid = this.tag('Grid').children
    const index = grid.indexOf(this.activeItem)
    // Assuming a 4-column grid.
    if (index - 4 >= 0) {
      this.activeItem = grid[index - 4]
      this.patch({})
    }
  }

  override _handleDown(): void {
    const grid = this.tag('Grid').children
    const index = grid.indexOf(this.activeItem)
    if (index + 4 < grid.length) {
      this.activeItem = grid[index + 4]
      this.patch({})
    }
  }

  override _handleEnter(): void {
    if (this.activeItem === this.tag('ResetButton')) {
      this._resetGame()
    } else {
      // Forward Enter event to the active item.
      //this.activeItem?._handleEnter();
    }
  }

  handleClick() {
    this._refocus()
    console.log('clicked')
    this._resetGame()
  }
}
