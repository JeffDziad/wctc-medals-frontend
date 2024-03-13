import React from 'react';
import {BoxArrowLeft, PersonCheckFill} from 'react-bootstrap-icons';
import {Dropdown, DropdownButton} from "react-bootstrap";

const Logout = (props) => {
    const {user} = props;

    const handleLogout = () => {
        props.onLogout();
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