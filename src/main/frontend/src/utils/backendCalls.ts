import {Mode} from "../views/Pins/PinViewModal"

class BackendCalls {
    public static setSessionCookie(key: string, value: string): void {
        document.cookie = key + "=" + value + "; expires=0; path=/"
    }

    public static isLoggedIn(): boolean {
        return this.getCookieValue("session") !== null
    }

    private static getCookieValue(a: string): string | null {
        const b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)')
        if (b) {
            const value = b.pop()
            return value === "null" ? null : value!
        }
        return null
    }

    private static deleteCookie(name: string) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }

    public getPins(then: (response: any) => void, error: (e: string) => void, schema?: number) {
        this.callGraphql(`
query{
	pins` + (schema === undefined ? "" : "(schema:" + schema + ")") + `{
		id
		name
		default:defaultActive
	}
}
`, (e: any) => then(e.pins.sort((f: any, g: any) => f.id > g.id ? 1 : -1)), error)
    }

    public getPinModes(then: (response: any) => void, error: (e: string) => void, schema: number) {
        this.callGraphql(`
query{
  schema(id:` + schema + `){
    id
    pinmodes:pins{
      mode
      pin{
        id
        name
      }
    }
  }
}
`, (e: any) => then(e.schema[0].pinmodes.sort((f: any, g: any) => f.id > g.id ? 1 : -1)), error)
    }

    public editPins(id: number, name: string, then: (response: any) => void, error: (e: string) => void) {
        this.callGraphql(`mutation{
  editPin(id:` + id + `, name:"` + name + `"){
    id
    name
  }
}`, then, error)
    }

    public setPinDefaultState(id: number, state: boolean, then: (response: any) => void, error: (e: string) => void) {
        this.callGraphql(`mutation{
  setPinDefaultState(id:` + id + `, mode:` + state + `){
    id
    name
  }
}`, then, error)
    }

    public getSchemas(then: (response: any) => void, error: (e: string) => void, active?: boolean) {
        this.callGraphql(`
query{
schema` + (active ? "(active:true)" : "") + `{
	name
	id
	active
	` + (active ? `pins{
      mode
      pin{
        id
        name
      }
    }` : '') + `
}
}
`, (e: any) => then(e.schema.sort((f: any, g: any) => f.name.toLowerCase() > g.name.toLowerCase() ? 1 : -1)), error)
    }

    public createSchema(name: string, pins: [Mode], then: () => void, error: (e: string) => void) {
        this.callGraphql(`
mutation{
  schema:createSchema(
    name:"` + name + `"
    mode:[` + (pins.map(e => "{pinid:" + e.pin.id + ",mode:" + e.mode + "}, ")) + `]
  ){
    name
  }
}
`, then, error)
    }

    public activateSchema(id: number, then: () => void, error: (e: string) => void) {
        this.callGraphql(`
mutation{
 activateSchema(id:` + id + `){
  name
  id
  active
}
}
`, then, error)
    }

    public editSchema(id: number, name: string, pins: [Mode], then: () => void, error: (e: string) => void) {
        this.callGraphql(`
mutation{
  schema:editSchema(
    id:` + id + `
    name:"` + name + `"
    mode:[` + (pins.map(e => "{pinid:" + e.pin.id + ",mode:" + e.mode + "}, ")) + `]
  ){
    name
  }
}
`, then, error)
    }

    public editSchemaName(id: number, name: string, then: () => void, error: (e: string) => void) {
        this.callGraphql(`
mutation{
  schema:editSchemaName(
    id:` + id + `
    name:"` + name + `"
  ){
    name
  }
}
`, then, error)
    }

    public deleteSchema(id: number, then: () => void, error: (e: string) => void) {
        this.callGraphql(`
mutation{
  deleteSchema(id:` + id + `){
    name
    id
  }
}
`, then, error)
    }

    public login(user: string, password: string, then: () => void, error: (e: string) => void) {
        this.callGraphql(`
mutation{
 login(user:"` + user + `", password:"` + password + `")
}
`, (e: { login: string }) => {
            if (e.login !== null) {
                BackendCalls.setSessionCookie("session", e.login)
                then()
            } else {
                error("User or password is wrong")
            }
        }, error)
    }

    public networkCheck(then: () => void, error: (e: string) => void) {
        this.callGraphql(`
query{
  ping
}
`, (e: { ping: string }) => {
            if (e.ping !== null) {
                then()
            } else {
                error("The server is not reachable")
            }
        }, error)
    }

    private callGraphql(body: string, then: (response: any) => void, error: (err: string) => void) {
        const url = this.replacePlaceHolder("REACT_APP_BACKEND", this.getEnv("REACT_APP_BACKEND", "http://localhost:9000/graphql"))
        fetch(url, {
            method: 'post',
            body: JSON.stringify({"query": body}),
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + BackendCalls.getCookieValue("session")})
        }).then((r) => r.json()).then((response) => {
            // console.log(response)
            if (response.errors !== undefined) {

                if (response.errors[0].message === "Permission not granted") {
                    BackendCalls.deleteCookie("session")
                    window.location.href = "/"
                } else {
                    error(response.errors[0].message)
                }
            } else {
                then(response.data)
            }
        }).catch((err: Error) => {
            console.error(err.message)
            error(err.message.includes("NetworkError") ? "The server is not reachable" : err.message)
        })
    }

    private getEnv(key: string, defaultvalue: string): string {
        return process.env[key] ? process.env[key]! : defaultvalue
    }

    private replacePlaceHolder(key: string, value: string): string {
        if (key === "REACT_APP_BACKEND" && value.includes("__SERVER__")) {
            return value.replace("__SERVER__", window.location.protocol + "//" + window.location.hostname)
        }

        return value
    }
}


export default BackendCalls
