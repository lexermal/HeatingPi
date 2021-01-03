import * as React from 'react'
import styles from './HiddenButton.module.css'

class HiddenButton extends React.Component<HiddenButtonProps, {}> {

    constructor(props: HiddenButtonProps, context: any) {
        super(props, context)

        this.onSave = this.onSave.bind(this)
    }

    public render() {
        return <button className={this.props.hidden ? styles.hidden : styles.visible} onClick={this.onSave}>{this.props.value}</button>
    }


    private onSave() {
        this.props.onClick(this.props.actionvalue)
    }
}

interface HiddenButtonProps {
    value: string
    hidden: boolean
    actionvalue?: string
    onClick: (value: string | undefined) => void
}

export default HiddenButton