import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

import style from './e-input.style.scss?inline'

@customElement('e-input')
class EInput extends LitElement {

  @property({ type: String }) id = ''

  @property({ type: String }) name = ''

  @property({ type: String }) label = ''

  @property({ type: String }) regexp = ''

  @property({ type: String }) type = 'text'

  @property({ type: String }) value = ''

  @property({ type: Boolean }) required = true

  @query('input') input

  _internals

  static formAssociated = true

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
      <div class="e-input">
        <label class="e-input__label" for=${this.id}>${this.label}</label>
        <input
          class="e-input__input"
          id=${this.id}
          name=${this.name}
          type=${this.type}
          ?required=${this.required}
          @input=${this._onInput}
          value=${this.value}
        />
      </div>
    `
  }

  checkValidity() {
    return this.input.checkValidity()
  }

  updated() {
    const input = this.shadowRoot.querySelector('input')

    this._internals.setValidity(
      input.validity,
      input.validationMessage,
      input
    )
  }

  _onInput() {
    this.value = this.input.value
    this._internals.setValidity(
      this.input.validity,
      this.input.validationMessage,
      this.input
    )
  }
}
