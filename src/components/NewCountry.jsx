import React, {useEffect, useState} from 'react';
import {Button, Modal} from "react-bootstrap";
import {PlusCircleFill} from "react-bootstrap-icons";
import Form from 'react-bootstrap/Form';
import Nav from "react-bootstrap/Nav";
import axios from "axios";

export default function NewCountry(props) {
    const { onAdd } = props;
    const [showModal, setShowModal] = useState(false);
    const [newCountryName, setNewCountryName] = useState("");

    const [newSelectedName, setNewSelectedName] = useState("DEFAULT");
    const [possibleCountries, setPossibleCountries] = useState([]);
    const [useCustomName, setUseCustomName] = useState(false);

    useEffect(() => {
        const grabCountries = async () => {
            try {
                const res = await axios.get("https://countryinfoapi.com/api/countries");
                setPossibleCountries(res.data)
                console.log(res.data);
            } catch (e) {
                console.error(e);
            }

        }
        grabCountries();
    }, []);

    const handleAdd = (e) => {
        if(useCustomName) {
            newCountryName.length > 0 && onAdd(newCountryName);
        } else {
            if(newSelectedName !== "DEFAULT" && newSelectedName.length > 0) {
                onAdd(newSelectedName);
            }
        }

        handleModalClose();
    }

    const handleModalClose = () => {
        setShowModal(false);
        setNewCountryName("");
        setNewSelectedName("DEFAULT");
    }

    const handleModalKeyPress = (e) => (e.keyCode ? e.keyCode : e.which) === 13 && handleAdd();

    return (
        <React.Fragment>
            <Nav.Link href="#" className="btn" variant="outline-success" onClick={ () => setShowModal(true)}>
                <PlusCircleFill className="me-3 mb-1"/>
            </Nav.Link>
            <Modal show={ showModal } onHide={ handleModalClose } onKeyPress={ handleModalKeyPress }>
                <Modal.Header closeButton>
                    <Modal.Title>New Country</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="modalForm1">
                        <Form.Label>Country Name</Form.Label>
                        <Form.Select disabled={useCustomName} className="mb-3" value={newSelectedName} onChange={(e) => setNewSelectedName(e.target.value)}>
                            <option value="DEFAULT" disabled>Select a Country</option>
                            {possibleCountries.map(c =>
                                <option key={c.ccn3} value={c.name}>{c.name}</option>
                            )}
                        </Form.Select>
                        <Form.Check
                            checked={useCustomName}
                            onChange={(e) => setUseCustomName(e.target.checked)}
                            type="switch"
                            id="custom-country"
                            label="Use Custom Name"
                        />
                        <Form.Control
                            disabled={!useCustomName}
                            name="newCountryName"
                            onChange={ (e) => setNewCountryName(e.target.value) }
                            value={ newCountryName }
                            type="text"
                            placeholder="Name"
                            autoFocus
                            autoComplete='off'
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ handleModalClose }>
                        Close
                    </Button>
                    <Button variant="primary" onClick={ handleAdd }>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}