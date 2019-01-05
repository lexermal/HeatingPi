import * as React from 'react'
import * as toastr from 'toastr'
import {Container, Table, Row} from 'reactstrap'
import BackendCalls from '../../utils/backendCalls'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import EditableLabel from '../../components/label/editable/EditableLabel'

class PinView extends React.Component<PinViewProps, PinViewStats> {

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
            <br/>
            <h1>Pins</h1>
            <br/>
            <Row>
                <Table>
                    <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Default Setting</th>
                    </tr>

                    {this.state.pins!.filter((e: any) => e !== undefined && e !== null).map((e: Pins) => <tr key={e.id}>
                        <td><EditableLabel value={e.name} onSumbit={(g: string) => this.saveName(e.id, g)}/></td>
                        <td>{<LabelSwitch tooltip={"Click to change"} switchlist={[["Active", "true"], ["Deactivated", "false"]]}
                                          instantSave={true} onChange={(g: string) => this.saveDefaultState(e.id, g)}/>}</td>
                    </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
    }

    private saveName(id: number, value: string) {
        this.backend.editPins(id, value, () => toastr.success("The changes have successfully been saved."), this.onError)
    }

    private onError(e: string) {
        toastr.error("Change could not be made permanently. " + e)
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

export default PinView