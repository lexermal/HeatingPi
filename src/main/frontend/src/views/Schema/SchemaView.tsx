import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import BackendCalls from '../../utils/backendCalls'
import EditableLabel from '../../components/label/editable/EditableLabel'
import * as toastr from 'toastr'
import LabelSwitch from '../../components/label/switch/LabelSwitch'

class SchemaView extends React.Component<PinViewProps, PinViewStats> {


    constructor(props: PinViewProps) {
        super(props)

        this.state = {pins: [undefined]}

        const backend = new BackendCalls()
        backend.getPins((e: any) => this.setState({pins: e}), (err: any) => console.error(err))
        this.saveName = this.saveName.bind(this)
    }


    public componentWillUpdate(nextProps: Readonly<PinViewProps>, nextState: Readonly<PinViewStats>, nextContext: any): void {
        console.log(nextState.pins)
    }

    public render() {
        return <Container>
            <h1>Overview of all Schemas</h1>
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
                        <td><EditableLabel value={e.name} onSumbit={(g: string) => this.saveName(e.id, g)}/></td>
                        <td>{<LabelSwitch tooltip={"Click to change"} switchlist={[["Active", "true"], ["Deactivated", "false"]]}
                                          onChange={(g: string) => this.saveDefaultState(e.id, g)}/>}</td>
                    </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
    }

    private saveName(id: number, value: string) {
        console.log("SAVE : " + id + " with value: " + value)
        toastr.success("The changes have successfully been saved.")
        // @todo graphql implementieren
    }

    private saveDefaultState(id: number, value: string) {
        console.log("SAVE : " + id + " with value: " + value)
        toastr.success("The changes have successfully been saved.")
        // @todo graphql implementieren
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

export default SchemaView