import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import BackendCalls from '../../utils/backendCalls'
import EditableLabel from '../../components/label/editable/EditableLabel'
import * as toastr from 'toastr'

class PinView extends React.Component<PinViewProps, PinViewStats> {


    constructor(props: PinViewProps) {
        super(props)

        this.state = {pins: [undefined]}

        const backend = new BackendCalls()
        backend.getPins((e: any) => this.setState({pins: e}), (err: any) => console.error(err))
        this.save = this.save.bind(this)
    }


    public componentWillUpdate(nextProps: Readonly<PinViewProps>, nextState: Readonly<PinViewStats>, nextContext: any): void {
        console.log(nextState.pins)
    }

    public render() {
        return <Container>
            <h1>Overview of all Pins</h1>
            <Row>
                <Table>
                    <tbody>
                    <tr>
                        <th>Pinnumber</th>
                        <th>Name</th>
                        <th>Defaultvalue</th>
                    </tr>

                    {this.state.pins!.filter((e: any) => e !== undefined && e !== null).map((e: Pins) => <tr key={e.id}>
                        <td>{e.id}</td>
                        <td><EditableLabel value={e.name} onSumbit={(g: string) => this.save(e.id, g)}/></td>
                        <td>{e.default}</td>
                    </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
    }

    private save(id: number, value: string) {
        console.log("save " + id + " with value: " + value)
        toastr.success("The changes have successfully been saved.")
    }

}

interface PinViewProps {
    pins?: [any]
}

interface Pins {
    id: number
    name: string
    default: number

}

interface PinViewStats {
    pins?: [any]
}

export default PinView