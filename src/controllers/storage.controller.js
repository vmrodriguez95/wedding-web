import { STORAGE_KEY } from '../utils/consts.utils.js'

export class StorageController {
  host

  _storage = localStorage

  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    // TODO
  }

  hostDisconnected() {
    // TODO
  }

  getValue(key) {
    const storage = this._storage.getItem(STORAGE_KEY)

    if (!storage) return null

    const data = JSON.parse(storage)

    if (!data[key]) return null

    return data[key]
  }

  setValue(key, value) {
    const storage = this._storage.getItem(STORAGE_KEY)

    if (!storage) {
      this._storage.setItem(STORAGE_KEY, JSON.stringify({ [key]: value }))
    } else {
      const data = JSON.parse(storage)

      data[key] = value

      this._storage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }
}

