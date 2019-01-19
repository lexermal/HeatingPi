import * as React from 'react'
import * as toastr from "toastr"
import {Container, Table, Row} from 'reactstrap'
import BackendCalls from '../../utils/backendCalls'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import {faFrown, faGrin, faMeh} from "@fortawesome/free-regular-svg-icons"

class PinViewModal extends React.Component<PinViewProps, PinViewStats> {

    private backend: BackendCalls

    constructor(props: PinViewProps) {
        super(props)

        this.backend = new BackendCalls()

        this.state = {pins: [undefined], modified: false}

        if (props.schema) {
            this.backend.getPinModes((e: any) => this.setState({pins: e}), this.onError, props.schema)
        } else {
            // @ts-ignore
            this.backend.getPins((e: Pin[]) => this.setState({pins: this.convertToDefaultMode(e)}), this.onError)
        }
    }


    public componentWillReceiveProps(nextProps: Readonly<PinViewProps>, nextContext: any): void {
        if (nextProps.saveNow && this.state.modified) {
            this.setState({modified: false})
            this.props.onSave(this.props.schema!, this.state.pins!)
        }
    }


    public render() {
        return <Container>
            <Row>
                <Table>
                    <tbody>

                    {this.state.pins!.filter((e: any) => e !== undefined && e !== null).sort((a: Mode, b: Mode) => a.pin.id > b.pin.id ? 1 : -1).map((e: Mode) =>
                        <tr key={e.pin.id}>
                            <td>{e.pin.name}</td>
                            <td>{<LabelSwitch defaultindex={e.mode} tooltip={"Check pin reaction"} switchlist={[
                                [<FontAwesomeIcon icon={faFrown} key={1} size={"lg"} color={"red"}/>, "0", "Change to disable pin"],
                                [<FontAwesomeIcon icon={faGrin} key={2} size={"lg"} color={"green"}/>, "1", "Change to enable pin"],
                                [<FontAwesomeIcon icon={faMeh} key={3} size={"lg"} color={"orange"}/>, "2", "Change to leave pin unchanged"]]}
                                              instantSave={true} onChange={(text: string) => this.saveState(e.pin.id, text)}/>}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
    }

    private convertToDefaultMode(pins: [Pin]): Mode[] {
        const list = []

        for (let x = 0; x < pins.length; x++) {
            list[x] = {mode: 2, pin: pins[x]}
        }

        return list
    }

    private saveState(id: number, value: string) {
        const pins: [Mode] = this.state.pins!
        const pin: Pin = pins!.splice(pins!.findIndex((e: Mode) => e.pin.id === id), 1)[0].pin

        pins!.push({mode: +value, pin})
        this.setState({pins, modified: true})
    }

    private onError(e: string) {
        toastr.error("Change could not be made permanently. " + e)
    }

}

interface PinViewProps {
    pins?: [any]
    schema?: number
    saveNow: boolean
    onSave: (schema: number, pins: [any]) => void
}

export interface Mode {
    mode: number
    pin: Pin
}

interface Pin {
    id: number
    name: string
    state: number

}

interface PinViewStats {
    pins?: [any]
    modified: boolean
}

export default PinViewModal