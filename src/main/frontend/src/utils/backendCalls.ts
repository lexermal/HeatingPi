class BackendCalls {

    public getPins(then: (response: any) => void, error: (e: string) => void, schema?: number) {

        let schemafilter = schema !== undefined ? "(id:" + schema + ")" : ""

        console.log("Remve this workaround")
        // this is here because the backend does not find the pins of the schemas
        schemafilter = ""

        this.callGraphql(`
query{
	pins` + schemafilter + `{
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

    private callGraphql(body: string, then: (response: any) => void, error: (err: string) => void) {
        fetch('http://localhost:9000/graphql', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({"query": body})
        }).then((response) => {
            return response.json();
        }).then((response) => {
            if (response.errors !== undefined) {
                error(response.errors[0].message)
            } else {
                then(response.data)
            }

        }).catch((err: Error) => {
            error(err.message)
        })
    }

}


export default BackendCalls
