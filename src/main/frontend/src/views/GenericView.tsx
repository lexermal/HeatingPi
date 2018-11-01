import * as React from 'react';
import {Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem} from 'reactstrap'
import Nav from 'reactstrap/lib/Nav'
import NavLink from 'reactstrap/lib/NavLink'
import RouteMain from '../RouteMain'

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
            <div>
                <Navbar color="light" light={true} expand="md">
                    <NavbarBrand href="/">HeizungsPi</NavbarBrand>
                    <NavbarToggler onClick={this.toggle}/>
                    <Collapse isOpen={this.state.isOpen} navbar={true}>
                        <Nav className="ml-auto" navbar={true}>
                            <NavItem>
                                <NavLink href="/pins">Pins</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/schema">Schema</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/active">Active</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
                <RouteMain/>
            </div>
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
