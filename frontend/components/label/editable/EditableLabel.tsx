import * as React from 'react'
import { createRef } from 'react'
import styles from './EditableLabel.module.css'

class EditableLabel extends React.Component<EditableLabelProps, EditableLabelStats> {

    private areaRef = createRef<HTMLTextAreaElement>()

    constructor(props: EditableLabelProps, context: any) {
        super(props, context)
        this.state = { value: props.value || "", defaultValue: props.value || "" }
        EditableLabel.onChange = EditableLabel.onChange.bind(this)
        this.autoGrow = this.autoGrow.bind(this)
    }

    public componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({ value: this.props.value || "", defaultValue: this.props.value || "" })
        }
    }

    public render() {
        if (this.props.disabled) {
            return <div className={styles.input}>{this.state.value} </div>
        }
        return <textarea
            rows={1}
            ref={this.areaRef}
            onInput={this.autoGrow}
            className={styles.input}
            value={this.state.value}
            onKeyPress={EditableLabel.onChange}
            onChange={(e: any) => this.setState({ value: e.target.value })}
            onBlur={e => {
                if (this.state.defaultValue !== e.target.value) {
                    this.setState({ defaultValue: e.target.value })
                    this.props.onSubmit(e.target.value)
                }
            }}/>
    }

    public componentDidMount(): void {
        if (!(this.props.disabled)) {
            this.autoGrow()
            new MutationObserver(this.autoGrow).observe(this.areaRef.current!, {
                attributes: true,
                attributeFilter: ["style"]
            })
        }
    }

    private autoGrow() {
        this.areaRef.current!.style.height = this.areaRef.current!.scrollHeight + "px"
    }

    private static onChange(e: any) {
        if (e.which === 9 || e.which === 13) {
            e.target.blur()
        }
    }
}

interface EditableLabelProps {
    value?: string
    disabled?: boolean
    onSubmit: (value: string) => void
}


interface EditableLabelStats {
    value: string
    defaultValue: string
}

export default EditableLabel
