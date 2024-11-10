import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import style from './c-radiogroup.style.scss?inline'

@customElement('c-radiogroup')
class CRadiogroup extends LitElement {

  @property({ type: String }) id = ''

  @property({ type: String }) name = ''

  @property({ type: String }) label = ''

  @property({ type: String }) nextStep = ''

  @property({ type: String }) value = ''

  @property({ type: Array }) options = []

  @property({ type: Boolean }) required = true

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
  connectedCallback() {
    super.connectedCallback()
    this.setDefaultValues()
  }

  render() {
    // TODO: Añadir la funcionalidad de que cuando una opción dependa de un valor de otro campo, consulte el valor y mire a ver si debe pintar el option o no.
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
            ?checked=${option.default}
            ?required=${this.required}
            @change=${this._onRadioChange.bind(this, option)}
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
      this._internals.setValidity(
        { valueMissing: true },
        'Selecciona una opción',
        this.shadowRoot.firstElementChild
      )
    }
  }

  /**
   * Methods
   */
  setRequired(value) {
    this.required = value
  }

  setDefaultValues() {
    const option = this.options.find(option => option.default) || this.options[0]
    this.value = option.value
    this.nextStep = option.nextStep
  }

  _onRadioChange(option) {
    this._internals.setValidity({})
    this.value = option.value
    this.nextStep = option.nextStep
    this.dispatchEvent(new CustomEvent('change', { detail: option }))
  }

  checkValidity() {
    return this._internals.checkValidity()
  }
}
