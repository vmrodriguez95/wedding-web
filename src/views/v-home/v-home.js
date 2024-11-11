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

  actualStep = 'base'

  dependencies = []

  _token = ''

  _companionChoise = null

  _goBackEl = null

  _dbController = new DBController(this)

  _storageController = new StorageController(this)

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  async connectedCallback() {
    super.connectedCallback()

    this.setToken(this._storageController.getValue('token'))
    this.setCompanionChoise(this._storageController.getValue('companionChoise'))


    this._dbController.startDBConnection()

    if (this._token) {
      await this._dbController.getActualStep(this._token)
    }

    await this._dbController.getFormByKey(this.actualStep)
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
                ([,field]) => field.id,
                ([key, field]) => this.getFieldTemplate(key, field)
              )}
            </form> 
          `)}
        </section>
      </main>
    `
  }

  updated() {
    if (this._formEl && this.dependencies.length > 0) {
      this.activateDependencies()
    }
  }

  /**
   * Methods
   */
  setToken(token) {
    this._token = token
  }

  setActualStep(step) {
    this.actualStep = step
  }

  setCompanionChoise(choise) {
    this._companionChoise = choise
  }

  setMainUserInfoInStorage(email, fullname) {
    this._storageController.setValue('email', email)
    this._storageController.setValue('fullname', fullname)
  }

  toggleShowItem(mainFieldEl, dependingValue) {
    if (dependingValue) {
      mainFieldEl.classList.remove('hide')
      mainFieldEl.setRequired(true)
    } else {
      mainFieldEl.classList.add('hide')
      mainFieldEl.setRequired(false)
    }
  }

  async activateDependencies() {
    this.dependencies.forEach((dependency) => {
      const [mainFieldId, dependingObjects] = Object.entries(dependency)[0]
      const mainFieldEl = this._formEl.querySelector(`#${mainFieldId}`)

      dependingObjects.forEach((item) => {
        if (!item.isInDB) {
          const dependingFieldEl = this._formEl.querySelector(`#${item.key}`)

          if (mainFieldEl && dependingFieldEl) {
            this.toggleShowItem(mainFieldEl, dependingFieldEl.value)

            dependingFieldEl.addEventListener('change', (ev) => {
              this.toggleShowItem(mainFieldEl, ev.detail.value)
            })
          }
        }
      })
    })
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

  async getActualStepFromValue(fieldKeys, options) {
    let nextStep = ''
    let valueForOptions = ''

    valueForOptions = await Promise.all(
      fieldKeys.map(async(key) => {
        const fieldEl = this._formEl.querySelector(`#${key}`)

        if (fieldEl) {
          nextStep = fieldEl.nextStep
          return ''
        } else {
          return await this._dbController.getValueFromKey(key, this._token)
        }
      })
    )

    valueForOptions = valueForOptions.join('-')

    if (valueForOptions) {
      nextStep = options[valueForOptions]
    }

    return nextStep
  }

  async getNextStep(nextButtonEl) {
    let newNextStep = ''
    const { nextStep, nextStepFromValue, options } = nextButtonEl

    if (nextStep) {
      newNextStep = nextStep
      this.setActualStep(nextStep)
    } else {
      newNextStep = await this.getActualStepFromValue(nextStepFromValue, options)
    }

    return newNextStep
  }

  async goBack(field) {
    let nextStep = field.nextStep

    if (field.nextStepFromValue) {
      const nextStepFromValue = field.nextStepFromValue
      nextStep = await this.getActualStepFromValue(nextStepFromValue, field.options)
    }

    this.setActualStep(nextStep)
    this._dbController.getFormByKey(nextStep)
  }

  getDependencyByKey(key) {
    return this.dependencies.find((dependency) => Object.keys(dependency)[0] === key)
  }

  getFieldTemplate(key, field) {
    let template = ''
    let printField = true

    if (field.depends) {
      const dependency = this.getDependencyByKey(key)
      dependency[key].forEach((item) => {
        if (item.isInDB && item.dbValue !== true) {
          printField = false
        }
      })
    }

    if (printField) {
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
              @click=${this.goBack.bind(this, field)}
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
    }

    return template
  }

  createToken(email, fullname) {
    const clearedName = sanitize(fullname)
    const newToken = generateToken(email, clearedName)

    this._storageController.setValue('token', newToken)

    return newToken
  }

  async onSubmit(e) {
    e.preventDefault()

    const formData = this.getFormData()
    const nextButtonEl = e.target.querySelector('#buttonNext')

    if (!this._token) {
      this.setToken(this.createToken(formData.email, formData.fullname))
      this.setMainUserInfoInStorage(formData.email, formData.fullname)
    }

    if (formData.companionChoise) {
      this._storageController.setValue('companionChoise', formData.companionChoise)
    }

    formData.actualStep = await this.getNextStep(nextButtonEl, this._token)

    this.dependencies = []
    await this._dbController.saveUserData(formData, this._token)
    await this._dbController.getFormByKey(formData.actualStep)
  }
}
