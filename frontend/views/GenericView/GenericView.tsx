import * as React from 'react'
import { useState } from 'react'
import Nav from 'reactstrap/lib/Nav'
import css from './GenericView.module.css'
import { Collapse, Navbar, NavbarToggler, NavItem } from 'reactstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link'

export default function GenericView() {
    const [isOpen, setOpen] = useState(false);

    return (
        <div id={"navbar"}>
            <Navbar light={true} expand="md" className={css.navbar}>
                <Link href="/">
                    <a className={"navbar-brand"}>HeizungsPi</a>
                </Link>
                <NavbarToggler onClick={() => setOpen(!isOpen)}/>

                <Collapse isOpen={isOpen} navbar={true}>
                    <Nav className="ml-auto" navbar={true}>
                        <NavItem>
                            <Link href="/schema">
                                <a onClick={() => setOpen(false)} className={"nav-link " + css.link}>Schema</a>
                            </Link>
                        </NavItem>
                        <NavItem>
                            <Link href="/temperature">
                                <a onClick={() => setOpen(false)} className={"nav-link " + css.link}>Temperature</a>
                            </Link>
                        </NavItem>
                        <NavItem>
                            <Link href="/settings">
                                <a onClick={() => setOpen(false)} className={"nav-link " + css.link}>
                                    <FontAwesomeIcon icon={faCog}/>
                                </a>
                            </Link>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        </div>
    )
}




