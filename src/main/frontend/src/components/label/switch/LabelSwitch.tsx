import * as React from 'react'
import styles from './LabelSwitch.module.css'
import {ReactNode} from "react";

class LabelSwitch extends React.Component<EditableLabelProps, EditableLabelStats> {

    constructor(props: EditableLabelProps, context: any) {
        super(props, context)

        this.state = {index: props.defaultindex || 0, defaultindex: props.defaultindex || 0, disabled: (this.props.disabled !== undefined && this.props.disabled)}
        this.onSave = this.onSave.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    public render() {
        return <div title={this.getTooltip()} onClick={this.onClick}
                    className={this.state.disabled ? styles.disabledSwitch : styles.switch}
                    onMouseOut={this.onSave}>{this.props.switchlist[this.state.index][0]}</div>
    }

    private onClick() {
        if (!this.state.disabled) {
            this.setState({index: this.getNextListIndex()},
                () => this.props.instantSave ? this.onSave() : null)
        }
    }

    private onSave() {
        if ((!this.state.disabled) && this.state.index !== this.state.defaultindex) {
            this.setState({defaultindex: this.state.index})
            this.props.onChange(this.props.switchlist[this.state.index][1])
        }
    }

    private getNextListIndex(): number {
        return this.state.index + 1 < this.props.switchlist.length ? this.state.index + 1 : 0
    }

    private getTooltip(): string {
        if (this.state.disabled) {
            return ""
        }

        if (this.props.switchlist[this.getNextListIndex()][2]) {
            return this.props.switchlist[this.getNextListIndex()][2]!.toString();
        }

        return this.props.tooltip || ""
    }

}

interface EditableLabelProps {
    tooltip?: string
    disabled?: boolean
    instantSave?: boolean
    defaultindex?: number
    onChange: (value: string | number | object | void | boolean) => void
    switchlist: Array<[string | ReactNode, string | number | object | void | boolean, null | undefined | string | ReactNode]>
}


interface EditableLabelStats {
    index: number
    disabled: boolean
    defaultindex: number
}

export default LabelSwitch