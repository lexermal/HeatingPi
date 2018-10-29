import * as React from 'react';
import {Collapse, DropdownToggle, Navbar, NavbarBrand, NavbarToggler, NavItem} from 'reactstrap'
import Nav from 'reactstrap/lib/Nav'
import NavLink from 'reactstrap/lib/NavLink'
import {UncontrolledDropdown} from 'reactstrap/lib/Uncontrolled'
import DropdownMenu from 'reactstrap/lib/DropdownMenu'
import DropdownItem from 'reactstrap/lib/DropdownItem'

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
                    <NavbarBrand href="/">reactstrap</NavbarBrand>
                    <NavbarToggler onClick={this.toggle}/>
                    <Collapse isOpen={this.state.isOpen} navbar={true}>
                        <Nav className="ml-auto" navbar={true}>
                            <NavItem>
                                <NavLink href="/components/">Components</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="https://github.com/reactstrap/reactstrap">GitHub</NavLink>
                            </NavItem>
                            <UncontrolledDropdown nav={true} innavbar={true}>
                                <DropdownToggle nav={true} caret={true}>
                                    Options
                                </DropdownToggle>
                                <DropdownMenu right={true}>
                                    <DropdownItem>
                                        Option 1
                                    </DropdownItem>
                                    <DropdownItem>
                                        Option 2
                                    </DropdownItem>
                                    <DropdownItem divider={true}/>
                                    <DropdownItem>
                                        Reset
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Nav>
                    </Collapse>
                </Navbar>
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
