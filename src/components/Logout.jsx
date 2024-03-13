import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import {BoxArrowLeft, PersonCheckFill} from 'react-bootstrap-icons';
import {Dropdown, DropdownButton} from "react-bootstrap";

const Logout = (props) => {
    const {user} = props;
    const [ showModal, setShowModal ] = useState(false);

    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => {
        setShowModal(true);
    }
    const handleModalKeyPress = (e) => (e.keyCode ? e.keyCode : e.which) === 13 && handleLogout();
    const handleLogout = () => {
        props.onLogout();
        handleModalClose();
    }

    const permissions = () => {
        let out = [];
        if(user.canPost) out.push("Post");
        if(user.canDelete) out.push("Delete");
        if(user.canPatch) out.push("Patch");
        if(out.length <= 0) return "None";
        else return out.join(", ");
    }

    return (
        <React.Fragment>
            {/*<Nav.Link className="btn" href="#" onClick={ handleModalShow }><PersonCheckFill /></Nav.Link>*/}
            {/*<Modal onKeyPress={ handleModalKeyPress } show={ showModal } onHide={ handleModalClose }>*/}
            {/*    <Modal.Header closeButton>*/}
            {/*        <Modal.Title>Logout</Modal.Title>*/}
            {/*    </Modal.Header>*/}
            {/*    <Modal.Body>*/}
            {/*        Click Logout to continue*/}
            {/*    </Modal.Body>*/}
            {/*    <Modal.Footer>*/}
            {/*        <Button variant="secondary" onClick={ handleModalClose }>*/}
            {/*            Close*/}
            {/*        </Button>*/}
            {/*        <Button variant="primary" onClick={ handleLogout }>*/}
            {/*            Logout*/}
            {/*        </Button>*/}
            {/*    </Modal.Footer>*/}
            {/*</Modal>*/}
            <DropdownButton drop="start" title={<PersonCheckFill className="ms-3"/>}>
                <Dropdown.ItemText style={{minWidth: "200px"}}><span>Hello, <span className="fw-bold">{ user.name.charAt(0).toUpperCase() + user.name.slice(1) }</span>!</span></Dropdown.ItemText>
                <Dropdown.Divider/>
                <Dropdown.ItemText>
                    <span style={{textDecoration: "underline"}}>Permissions:</span> <p className="fw-bold mb-0">{ permissions() }</p>
                </Dropdown.ItemText>
                <Dropdown.Divider/>
                <Dropdown.Item as="button" onClick={ handleLogout }><BoxArrowLeft className="me-2 mb-1"/>Logout</Dropdown.Item>
            </DropdownButton>
        </React.Fragment>
    );
}

export default Logout;