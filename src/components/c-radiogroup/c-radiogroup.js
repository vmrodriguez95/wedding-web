import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import style from './c-radiogroup.style.scss?inline'

@customElement('c-radiogroup')
class CRadiogroup extends LitElement {

  @property({ type: String }) id = ''

  @property({ type: String }) name = ''

  @property({ type: String }) label = ''

  @property({ type: Array }) options = []

  @property({ type: Boolean }) required = true

  @property({ type: String }) value = ''

  _internals

  static formAssociated = true

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  constructor() {
    super()
    this._internals = this.attachInternals()
    this._internals.setValidity({ valueMissing: true }, 'Selecciona una opción')
  }

  /**
   * Lifecycle methods
   */
  render() {
    return html`
      <div class="c-radiogroup" tabindex="0">
        <p>${this.label}</p>
        ${this.options.map((option, idx) => html`
          <label class="e-radio__label" for="${this.id}-${idx}">${option.label}</label>
          <input
            class="e-radio__input"
            id="${this.id}-${idx}"
            name=${this.name}
            type="radio"
            value=${option.value}
            ?required=${this.required}
            @change=${this._onRadioChange}
          />
        `)}
      </div>
    `
  }

  updated() {
    const inputChecked = this.shadowRoot.querySelector('input:checked')

    if (inputChecked) {
      this._internals.setValidity({})
    } else {
      this._internals.setValidity({ valueMissing: true }, 'Selecciona una opción', this.shadowRoot.firstElementChild)
    }
  }

  _onRadioChange(event) {
    this._internals.setValidity({})
    this.value = event.target.value
  }

  checkValidity() {
    return this._internals.checkValidity()
  }
}
