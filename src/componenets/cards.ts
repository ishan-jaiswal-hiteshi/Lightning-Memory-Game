import { Colors, Lightning } from '@lightningjs/sdk'
import Color from '@lightningjs/sdk/src/Colors'

export default class Card extends Lightning.Component {
  public letter = ''
  public revealed = false
  public disabled = false
  private _focusAnimation: any
  static override _template() {
    return {
      w: 240,
      h: 220,
      interactive: true,
      flexItem: { margin: 7 },
      collision: true,
      rect: true,
      color: Color('white').alpha(0.5).get(), // Back-of-card (gray)
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        radius: 10,
        // stroke: {
        //   width: 10,
        //   color: Colors("white").get(),
        // },
      },
      smooth: { alpha: 1 },
      // Focus indicator overlay (hidden by default)
      FocusRect: {
        collision: true,
        rect: true,
        w: 240,
        h: 220,
        visible: false,
        color: Color('red').get(),
      },
      Letter: {
        collision: true,
        x: 120,
        y: 110,
        mountX: 0.5,
        mountY: 0.5,
        text: { text: '', fontSize: 64, textColor: 0xff000000 },
      },
    }
  }

  override _init(): void {
    this.revealed = false
    this.disabled = false

    this._focusAnimation = this.tag('FocusRect').animation({
      duration: 0.2,
      actions: [
        { p: 'scale', v: { 0: 1, 1: 1.03 } }, // Scale up the FocusRect
        { p: 'alpha', v: { 0: 0.5, 1: 1 } }, // Fade in the FocusRect
      ],
    })
  }

  public reveal(): void {
    if (!this.revealed && !this.disabled) {
      this.revealed = true
      this.patch({
        Letter: { text: { text: this.letter } },
        color: Color('white').get(), // White background when revealed.
      })
    }
  }

  public hide(): void {
    if (!this.disabled) {
      this.revealed = false
      this.patch({
        Letter: { text: { text: '' } },
        color: 0xff888888,
      })
      this._refocus()
    }
  }

  public disable(): void {
    this.disabled = true
    this.patch({ alpha: 0.5, color: Color('green').get() })
  }

  override _handleEnter(): void {
    this.fireAncestors('$handleCardSelect' as any, this)
  }

  override _focus(): void {
    this.patch({ FocusRect: { visible: true } })
    this._focusAnimation.start()
  }

  override _unfocus(): void {
    this.patch({ FocusRect: { visible: false } })
    this._focusAnimation.stop()
  }

  handleClick() {
    this._handleEnter()
  }
}
