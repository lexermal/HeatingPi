import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import EditableLabel from '../../components/label/editable/EditableLabel'
import * as toastr from 'toastr'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import BackendCalls from '../../utils/backendCalls'

class DashboardView extends React.Component<PinViewProps, PinViewStats> {

    private backend: BackendCalls;

    public constructor(props: PinViewProps) {
        super(props)

        this.state = {pins: [undefined]}

        this.backend = new BackendCalls()
        this.backend.getPins((e: any) => this.setState({pins: e}), (err: any) => console.error(err))
        this.saveName = this.saveName.bind(this)
    }

    public render() {
        return <Container>
            <br/>Dashboard
            <h1>Overview of different things</h1>
            <br/>
            <br/>Active Pin Schema
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
        this.backend.editPins(id, value, () => toastr.success("The changes have successfully been saved."), this.onError)
    }

    private onError(e: Error) {
        toastr.error("Change could not be made permanently. " + e.message)
    }

    private saveDefaultState(id: number, value: string) {
        this.backend.setPinDefaultState(id, value === "true", () => toastr.success("The changes have successfully been saved."), this.onError)
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

export default DashboardView