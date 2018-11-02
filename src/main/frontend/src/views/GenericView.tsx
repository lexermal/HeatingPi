import * as React from 'react';
import {Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem} from 'reactstrap'
import Nav from 'reactstrap/lib/Nav'
import {Link} from 'react-router-dom'
import Routing from '../routing'

class GenericView extends React.Component<{}, GenericViewStats> {
    public constructor(props: any) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }


    public render() {
        return (
            <Routing>
                <div>
                    <Navbar color="primary" light={true} expand="md">
                        <NavbarBrand href="/">HeizungsPi</NavbarBrand>
                        <NavbarToggler onClick={this.toggle}/>

                        <Collapse isOpen={this.state.isOpen} navbar={true}>
                            <Nav className="ml-auto" navbar={true}>
                                <NavItem>
                                    <Link className={"nav-link"} to="/pins">Pins</Link>
                                </NavItem>
                                <NavItem>
                                    <Link className={"nav-link"} to="/schema">Schema</Link>
                                </NavItem>
                                <NavItem>
                                    <Link className={"nav-link"} to="/active">Active</Link>
                                </NavItem>
                            </Nav>
                        </Collapse>
                    </Navbar>
                </div>
            </Routing>
        );
    }

    private toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

}


interface GenericViewStats {
    isOpen: boolean
}

export default GenericView;
