import * as React from 'react'
import * as toastr from 'toastr'
import {Container, Table, Row} from 'reactstrap'
import BackendCalls from '../../utils/backendCalls'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import EditableLabel from '../../components/label/editable/EditableLabel'
import {faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons"

class PinView extends React.Component<PinViewProps, PinViewStats> {

    private backend: BackendCalls;

    public constructor(props: PinViewProps) {
        super(props)

        this.state = {pins: [undefined]}

        this.backend = new BackendCalls()
        this.backend.getPins((e: any) => this.setState({pins: e}), (err: string) => toastr.error("Could not load the pins because " + err))
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

                    {this.state.pins!.filter((e: any) => e !== undefined && e !== null).map((e: Pins) => <tr key={e.id}>
                        <td><EditableLabel value={e.name} onSumbit={(g: string) => this.saveName(e.id, g)}/></td>
                        <td>{<LabelSwitch defaultindex={e.default ? 0 : 1} switchlist={[
                            [<FontAwesomeIcon key={1} icon={faToggleOn} size={"lg"} className={"text-success"}/>, true, "Change to enable default setting"],
                            [<FontAwesomeIcon key={1} icon={faToggleOff} size={"lg"} className={"text-danger"}/>, false, "Chanto do disable default setting"]]}
                                          instantSave={true} onChange={(g: boolean) => this.saveDefaultState(e.id, g)}/>}</td>
                    </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
    }

    private saveName(id: number, value: string) {
        this.backend.editPins(id, value, () => toastr.success("The changes have been successfully saved."), this.onError)
    }

    private onError(e: string) {
        toastr.error("Change could not be saved. " + e)
    }

    private saveDefaultState(id: number, value: boolean) {
        this.backend.setPinDefaultState(id, value, () => toastr.success("The changes have been successfully saved."), this.onError)
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