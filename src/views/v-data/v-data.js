// Lit imports
import { LitElement, html, css, unsafeCSS } from 'lit'
import { map } from 'lit/directives/map.js'
import { customElement, state } from 'lit/decorators.js'

// Controller imports
import { DBController } from '../../controllers/db.controller.js'
import { StorageController } from '../../controllers/storage.controller.js'

// Style imports
import style from './v-data.style.scss?inline'

const elementName = 'v-data'

@customElement(elementName)
class VData extends LitElement {

  @state() userChoises = []

  @state() columns = []

  _dbController = new DBController(this)

  _storageController = new StorageController(this)

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  connectedCallback() {
    super.connectedCallback()

    this._dbController.startDBConnection()

    this._dbController.getUserChoises()
    this._dbController.getTableColumns()
  }
  
  /*
  * Lifecycle methods
  */
 render() {
    return html`
      <main class=${elementName}>
        <h1 class="${elementName}__title">Datos de los usuarios</h1>
        <h2 class="${elementName}__subtitle">Elecciones de los usuarios</h2>
        <section class="${elementName}__wrapper">
          <table class="${elementName}__table">
            <thead>
              <tr>
                ${map(this.columns, (column) => html`
                  <th>${column.name}</th>
                `)}
              </tr>
            </thead>
            <tbody>
              ${map(this.userChoises, (user) => html`
                <tr>
                  ${map(this.columns, (column) => html`
                    <td>${this.processValue(user[column.key])}</td>
                  `)}
                </tr>
              `)}
            </tbody>
          </table>
        </section>
      </main>
    `
  }

  /**
   * Methods
   */
  processValue(value) {
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No'
    }

    return value
  }
}
