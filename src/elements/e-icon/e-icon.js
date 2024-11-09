import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { classMap } from 'lit/directives/class-map.js'

import style from './e-icon.style.scss?inline'

@customElement('e-icon')
class EIcon extends LitElement {

  @property({ type: String }) icon = ''

  @property({ type: String }) size = ''

  @state() icons

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /**
   * Lifecycle methods
   */
  connectedCallback() {
    super.connectedCallback()

    // eslint-disable-next-line no-undef
    this.icons = EICON_LIST
  }

  render() {
    const classes = classMap({
      'e-icon': true,
      ['e-icon--' + this.size]: true
    })

    return html`
      <div class=${classes}>
        ${unsafeHTML(this.icons[this.icon])}
      </div>
    `
  }
}
