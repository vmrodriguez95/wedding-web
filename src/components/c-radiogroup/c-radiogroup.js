import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { StorageController } from '../../controllers/storage.controller.js'

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

  _storageController = ''

  static formAssociated = true

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /**
   * Lifecycle methods
   */
  connectedCallback() {
    super.connectedCallback()

    this._internals = this.attachInternals()
    this._storageController = new StorageController(this)

    this.setDefaultValues()
  }

  render() {
    return html`
      <div class="c-radiogroup">
        <p class="c-radiogroup__label">${this.label}</p>
        <div class="c-radiogroup__items">
          ${this.options.map((option, idx) => html`
            ${when(!option.depends || (this._storageController.getValue(option.depends)), () => html`
              <input
                id="${this.id}-${idx}"
                name=${this.name}
                type="radio"
                value=${option.value}
                ?checked=${option.default}
                ?required=${this.required}
                @change=${this._onRadioChange.bind(this, option)}
              />
              <label class="c-radiogroup__input" for="${this.id}-${idx}">${option.label}</label>
            `)}
          `)}
        </div>
      </div>
    `
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
    this.value = option.value
    this.nextStep = option.nextStep
    this.dispatchEvent(new CustomEvent('change', { detail: option }))
  }
}
