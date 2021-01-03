import './MainStyle.css'
import * as React from 'react'
import {Link} from 'react-router-dom'
import Routing from '../../routing'
import Nav from 'reactstrap/lib/Nav'
import {Collapse, Navbar, NavbarToggler, NavItem} from 'reactstrap'
import './GenericView.css'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";

class GenericView extends React.Component<{}, GenericViewStats> {
    public constructor(props: any) {
        super(props)

        this.toggle = this.toggle.bind(this)
        this.state = {isOpen: false}
    }

    public render() {
        return (
            <Routing>
                <div id={"navbar"}>
                    <Navbar light={true} expand="md">
                        <Link className={"navbar-brand"} to="/">HeizungsPi</Link>
                        <NavbarToggler onClick={this.toggle}/>

                        <Collapse isOpen={this.state.isOpen} navbar={true}>
                            <Nav className="ml-auto" navbar={true}>
                                <NavItem>
                                    <Link onClick={this.toggle} className={"nav-link"} to="/schema">Scheme</Link>
                                </NavItem>
                                <NavItem>
                                    <Link onClick={this.toggle} className={"nav-link"} to="/settings">
                                        <FontAwesomeIcon icon={faCog}/>
                                    </Link>
                                </NavItem>
                            </Nav>
                        </Collapse>
                    </Navbar>
                </div>
            </Routing>
        )
    }

    private toggle() {
        this.setState({isOpen: !this.state.isOpen})
    }

}


interface GenericViewStats {
    isOpen: boolean
}

export default GenericView
