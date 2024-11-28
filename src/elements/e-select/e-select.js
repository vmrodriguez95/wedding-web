import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

import style from './e-select.style.scss?inline'

@customElement('e-select')
class ESelect extends LitElement {

  @property({ type: String }) id = ''

  @property({ type: String }) name = ''

  @property({ type: String }) label = ''

  @property({ type: String }) value = ''

  @property({ type: Boolean }) required = true

  @property({ type: Array }) options = []

  @query('select') selectEl

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

  connectedCallback() {
    super.connectedCallback()
    this.setDefaultValue()
  }

  /**
   * Lifecycle methods
   */
  render() {
    return html`
      <div class="e-select">
        <label class="e-select__label" for=${this.id}>${this.label}</label>
        <select
          class="e-select__input"
          id=${this.id}
          name=${this.name}
          ?required=${this.required}
          value=${this.value}
          @change=${this._onSelectChange}
        >
          ${this.options.map(option => html`
            <option value=${option.value}>${option.label}</option>
          `)}
        </select>
        <e-icon class="e-select__icon" icon="arrow-down" size="sm"></e-icon>
      </div>
    `
  }

  updated() {
    const select = this.shadowRoot.querySelector('select')

    this._internals.setValidity(
      select.validity,
      select.validationMessage,
      select
    )
  }

  /**
   * Methods
   */
  setRequired(value) {
    this.required = value
  }

  setDefaultValue() {
    const option = this.options.find(option => option.default) || this.options[0]
    this.value = option.value
  }

  checkValidity() {
    return this.selectEl.checkValidity()
  }

  _onSelectChange() {
    this.value = this.selectEl.value
    this._internals.setValidity(
      this.selectEl.validity,
      this.selectEl.validationMessage,
      this.selectEl
    )
    this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }))
  }
}
