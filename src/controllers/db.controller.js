import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set, child } from 'firebase/database'

export class DBController {
  host

  _dbRef

  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    this.startDBConnection()
  }

  startDBConnection() {
    // eslint-disable-next-line no-undef
    const app = initializeApp(FIREBASE)

    this._dbRef = ref(getDatabase(app))
  }

  async getFormByKey(key) {
    try {
      const snapshot = await get(child(this._dbRef, `form/${key}`))

      if (snapshot.exists()) {
        const data = snapshot.val()

        if (data.fields) {
          data.fields = this.orderFieldsByOrder(data.fields)
          this.host.dependencies = await this.prepareDependencies(data.fields)
        }

        this.host.form = data
      }
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async getActualStep(token) {
    try {
      const snapshot = await get(child(this._dbRef, `users/${token}/actualStep`))

      this.host.actualStep = snapshot.exists() ? snapshot.val() : 'base'
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async getValueFromKey(key, token) {
    try {
      const snapshot = await get(child(this._dbRef, `users/${token}/${key}`))

      return snapshot.exists() ? snapshot.val() : null
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async getTableColumns() {
    try {
      const snapshot = await get(child(this._dbRef, `form`))

      if (snapshot.exists()) {
        const columns = []
        const data = snapshot.val()

        const basicStructure = Object.values(data).filter((formStep) => {
          return formStep.order >= 0
        }).sort((a, b) => {
          return a.order - b.order
        }).map((formStep) => {
          return Object.values(formStep.fields).filter((fields) => {
            return fields.columnName
          }).sort((a, b) => {
            return a.order - b.order
          })
        })

        for (let item of basicStructure) {
          for (let field of item) {
            columns.push({
              name: field.columnName,
              key: field.id
            })
          }
        }

        this.host.columns = columns
      } else {
        this.host.columns = []
      }
    }

    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async getUserChoises() {
    try {
      const snapshot = await get(child(this._dbRef, `users`))

      if (snapshot.exists()) {
        this.host.userChoises = Object.values(snapshot.val())
      } else {
        this.host.userChoises = []
      }

    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async saveUserData(newData, token) {
    try {
      let data = newData
      const snapshot = await get(child(this._dbRef, `users/${token}`))

      if (snapshot.exists()) {
        data = Object.assign({}, snapshot.val(), newData)
      }

      set(child(this._dbRef, `users/${token}`), data)
    }
    catch(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  orderFieldsByOrder(object, order = 'asc') {
    let objectOrdered = object

    objectOrdered = Object.fromEntries(
      Object.entries(object).sort(([,a], [,b]) => {
        if (order === 'asc') {
          return a.order - b.order
        }
        return b.order - a.order
      })
    )

    return objectOrdered
  }

  async prepareDependencies(fields, token) {
    const fieldsWithDependencies = Object.entries(fields)
      .filter(([,field]) => field.depends)
      .map(([key, field]) => ({ [key]: field.depends }))

    return await Promise.all(
      fieldsWithDependencies.map(async(field) => {
        const [fieldKey, dependKeys] = Object.entries(field)[0]

        return {
          [fieldKey]: await Promise.all(
            dependKeys.map(async(dependKey) => {
              if (!fields[dependKey]) {
                const dbValue = this.host._storageController.getValue(dependKey) || await this.getValueFromKey(dependKey, token)

                return {
                  isInDB: true,
                  key: dependKey,
                  dbValue: dbValue
                }
              } else {
                return {
                  isInDB: false,
                  key: dependKey,
                  dbValue: null
                }
              }
            })
          )
        }
      })
    )
  }
}

