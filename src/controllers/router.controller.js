import { html } from 'lit'

export class RouterController {
  host

  _routes = [
    {
      path: '/',
      render: () => html`<v-home></v-home>`
    },
    {
      path: '/data/',
      render: () => html`<v-data></v-data>`
    },
    {
      path: '*',
      addToMenu: false,
      enter: () => {
        location.pathname = '/'
      }
    }
  ]

  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostDisconnected() {
    // TODO
  }

  getRoutes() {
    return this._routes
  }
}

