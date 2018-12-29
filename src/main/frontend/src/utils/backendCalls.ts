class BackendCalls {

    public getPins(then: (response: any) => void, error: (e: string) => void, schema?: number) {
        this.callGraphql(`
query{
	pins` + (schema === undefined ? "" : "(id:" + schema + ")") + `{
		id
		name
	}
}
`, (e: any) => then(e.pins.sort((f: any, g: any) => f.id > g.id ? 1 : -1)), error);
        // 		default:default_activated
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

    public getSchemas(then: (response: any) => void, error: (e: string) => void) {
        this.callGraphql(`
query{
schema{
	name
	id
	active
}
}
`, (e: any) => then(e.schema.sort((f: any, g: any) => f.name > g.name ? 1 : -1)), error);
    }

    public createSchema(name: string, pins: [any], then: () => void, error: (e: string) => void) {
        this.callGraphql(`
mutation{
  schema:createSchema(
    name:"` + name + `"
    mode:[` + (pins.map(e => "{pinid:" + e.id + ",mode:" + (e.state || 2) + "}, ")) + `]
  ){
    name
  }
}
`, then, error)
    }


    private callGraphql(body: string, then: (response: any) => void, error: (err: string) => void) {
        fetch('http://localhost:9000/graphql', {
            method: 'post',
            body: JSON.stringify({"query": body}),
            headers: new Headers({'Content-Type': 'application/json'})
        }).then((r) => r.json()).then((response) => {
            if (response.errors !== undefined) {
                error(response.errors[0].message)
            } else {
                then(response.data)
            }
        }).catch((err: Error) => error(err.message))
    }

}


export default BackendCalls
