import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import BackendCalls from '../../utils/backendCalls'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import * as toastr from "toastr"

class PinViewModal extends React.Component<PinViewProps, PinViewStats> {

    constructor(props: PinViewProps) {
        super(props)

        this.state = {pins: [undefined], modified: false}

        new BackendCalls().getPins((e: any) => this.setState({pins: e}), this.onError, props.schema)
    }


    public componentWillReceiveProps(nextProps: Readonly<PinViewProps>, nextContext: any): void {
        if (nextProps.saveNow && this.state.modified) {
            this.setState({modified: false})
            console.log(this.state.pins)
            this.props.onSave(this.props.schema!, this.state.pins!)
        }
    }


    public render() {
        return <Container>
            <Row>
                <Table>
                    <tbody>
                    <tr>
                        <th>Pinnumber</th>
                        <th>Name</th>
                        <th>State</th>
                    </tr>

                    {this.state.pins!.filter((e: any) => e !== undefined && e !== null).sort((a: Pin, b: Pin) => a.id > b.id ? 1 : -1).map((e: Pin) =>
                        <tr key={e.id}>
                            <td>{e.id}</td>
                            <td>{e.name}</td>
                            {/*todo hier noch den richtigen default index einfügen*/}
                            <td>{<LabelSwitch defaultindex={e.state} tooltip={"Click to change"} switchlist={[["unmodified", "2"], ["active", "1"], ["deactivated", "0"]]}
                                              onChange={(text: string) => this.saveState(e.id, text)}/>}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
    }

    private saveState(id: number, value: string) {
        const pins: [Pin] = this.state.pins!
        const pin: Pin = pins!.splice(pins!.findIndex((e: Pin) => e.id === id), 1)[0]

        pin!.state = +value
        pins!.push(pin)

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