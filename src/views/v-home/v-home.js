import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, state, query } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { repeat } from 'lit/directives/repeat.js'
import { generateToken, sanitize } from '../../utils/actions.utils.js'
import { DBController } from '../../controllers/db.controller.js'
import { StorageController } from '../../controllers/storage.controller.js'
import style from './v-home.style.scss?inline'

const elementName = 'v-home'

@customElement(elementName)
class VHome extends LitElement {

  @state() form

  @query('form') _formEl

  _actualStep = 'base'

  _goBackEl = null

  _dbController = new DBController(this)

  _storageController = new StorageController(this)


  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  connectedCallback() {
    super.connectedCallback()

    this._dbController.startDBConnection()
    this._dbController.getFormByKey(this._actualStep)
  }

  /*
   * Lifecycle methods
   */
  render() {
    /* eslint-disable indent */
    return html`
      <main class=${elementName}>
        <section class="${elementName}__wrapper">
          ${when(this.form?.sectionTitle, () => html`
            <h2 class="${elementName}__title">${this.form.sectionTitle}</h2>
          `)}
          ${when(this.form?.description, () => html`
            <p class="${elementName}__description">${this.form.description}</p>
          `)}
          ${when(this.form?.fields, () => html`
            <form class="${elementName}__form" @submit=${this.onSubmit}>
              ${repeat(
                Object.entries(this.form.fields),
                ([, field]) => field.id,
                ([key, field]) => this.getFieldTemplate(key, field)
              )}
            </form> 
          `)}
        </section>
      </main>
    `
  }

  getFormData() {
    let formData = {}

    for(const element of this._formEl.elements) {
      if (element.tagName !== 'E-BUTTON') {
        formData[element.id] = element.value
      }
    }

    return formData
  }

  goBack(step) {
    this.setActualStep(step)
    this._dbController.getFormByKey(step)
  }

  getFieldTemplate(key, field) {
    let template = ''

    switch (field.type) {
      case 'text':
      case 'email':
        template = html`
          <e-input
            id=${field.id}
            label=${field.label}
            type=${field.type}
            required
            regexp=${field.regexp}
          ></e-input>
        `
        break
      case 'radio':
        template = html`
          <c-radiogroup
            id=${field.id}
            name=${field.name}
            label=${field.label}
            type=${field.type}
            required
            .options=${field.options}
          ></c-radiogroup>
        `
        break
      case 'select':
        template = html`
          <e-select
            id=${field.id}
            label=${field.label}
            required
            .options=${field.options}
          ></e-select>
        `
        break
      case 'button':
        template = html`
          <e-button
            id=${field.id}
            type=${field.type}
            nextStep=${field.nextStep}
            .nextStepFromValue=${field.nextStepFromValue}
            .options=${field.options}
            @click=${this.goBack.bind(this, field.nextStep)}
          >
            <span>${field.label}</span>
          </e-button>
        `
        break
      case 'submit':
        template = html`
          <e-button
            id=${field.id}
            type=${field.type}
            nextStep=${field.nextStep}
            .nextStepFromValue=${field.nextStepFromValue}
            .options=${field.options}
          >
            <span>${field.label}</span>
          </e-button>
        `
        break
    }

    return template
  }

  createToken(email, username) {
    const clearedName = sanitize(username)
    const newToken = generateToken(email, clearedName)

    this._storageController.setValue('token', newToken)

    return newToken
  }

  setMainUserInfoInStorage(email, username) {
    this._storageController.setValue('email', email)
    this._storageController.setValue('username', username)
  }

  setActualStep(step) {
    this._actualStep = step
  }

  onSubmit(e) {
    e.preventDefault()

    const formData = this.getFormData()
    let token = this._storageController.getValue('token')
    let nextStep = e.target.querySelector('e-button[nextstep]')?.nextStep

    if (!token) {
      token = this.createToken(formData.email, formData.name)
      this.setMainUserInfoInStorage(formData.email, formData.name)
    }

    formData.actualStep = nextStep
    this.setActualStep(nextStep)

    this._dbController.saveUserData(token, formData)
    this._dbController.getFormByKey(nextStep)
  }
}
