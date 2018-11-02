class BackendCalls {


    public getPins(then: (response: any) => void, error: (err: any) => void) {
        this.callGraphql(`
query{
	pins{
		id
		name
	}
}
`, (e: any) => then(e.pins.sort((f: any, g: any) => f.id > g.id ? 1 : -1)), error);
        // 		default:default_activated
    }


    private callGraphql(body: string, then: (response: any) => void, error: (err: any) => void) {
        fetch('http://localhost:9000/graphql', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({"query": body})
        }).then((response) => {
            return response.json();
        }).then((response) => {
            then((response.data))
        }).catch((err) => {
            error(err)
        });
    }

}


export default BackendCalls
