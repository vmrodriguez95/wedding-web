/* eslint-disable no-undef */
import { URLPattern } from 'urlpattern-polyfill'
import { Router } from '@lit-labs/router'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { RouterController } from '../../controllers/router.controller.js'

if (!globalThis.URLPattern) {
  globalThis.URLPattern = URLPattern
}

@customElement('e-app')
class EApp extends LitElement {
  /**
   * Sets custom props
   */

  routerController = new RouterController(this)

  router = new Router(this, this.routerController.getRoutes())

  /**
   * Renders template
   */
  render() {
    return this.router.outlet()
  }
}
