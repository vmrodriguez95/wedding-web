import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import style from './e-button.style.scss?inline'

@customElement('e-button')
class EButton extends LitElement {

  @property({ type: String }) id = ''

  @property({ type: String }) name = ''

  @property({ type: String }) type = 'text'

  @property({ type: String }) nextStep = ''

  @property({ type: Array }) nextStepFromValue = []

  @property({ type: Object }) options = {}

  static formAssociated = true

  _internals

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  constructor() {
    super()
    this._internals = this.attachInternals()
  }

  /**
   * Lifecycle methods
   */
  render() {
    return html`
      <button class="e-button" type=${this.type} @click=${this.onClick}>
        <slot></slot>
      </button>
    `
  }

  onClick() {
    if (this.type === 'submit') {
      this._internals.form.requestSubmit()
    }
  }
}
