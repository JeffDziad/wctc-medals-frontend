import React, {useEffect, useState} from 'react';
import Medal from "./Medal";
import {Badge, Button, Card, Col, ListGroup, Row} from "react-bootstrap";
import {ArrowCounterclockwise, Save, TrashFill} from "react-bootstrap-icons";
import axios from "axios";

export default function Country(props) {
    const {country, medals, onDelete, canDelete, canPatch, onIncrement, onDecrement, onSave, onReset} = props;
    const {name} = props.country;
    const [countryApiData, setCountryApiData] = useState({});

    useEffect(() => {
        const grabCountryData = async () => {
            try {
                const res = await axios.get("https://countryinfoapi.com/api/countries/name/"+name);
                setCountryApiData(res.data);
                console.log(res.data);
            } catch (e) {
                console.error(e);
            }
        }
        grabCountryData();
    }, [setCountryApiData, name]);

    const getMedalsTotal = (country, medals) => {
        let sum = 0;
        medals.forEach(medal => { sum += country[medal.name].page_value; });
        return sum;
    }

    const renderSaveButton = () => {
        let unsaved = false;
        medals.forEach(medal => {
            if (country[medal.name].page_value !== country[medal.name].saved_value) {
                unsaved = true;
            }
        });
        return unsaved;
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title >
                    <Row>
                        <Col xs={12} className="d-flex justify-content-between align-content-center mb-3">
                            { countryApiData.flag && <img className="me-2" style={{width: "75px", height: "auto"}} alt={countryApiData.name} src={countryApiData.flag}/>}
                            { renderSaveButton() ?
                                <React.Fragment>
                                    <Button variant="outline-primary" onClick={ () => onSave(country.id) }><Save/></Button>
                                    <Button variant="outline-primary" onClick={ () => onReset(country.id) }><ArrowCounterclockwise/></Button>
                                </React.Fragment>
                                :
                                canDelete && <TrashFill onClick={() => onDelete(country.id)} className='icon-btn' style={{ color:'red' }} />
                            }
                        </Col>
                        <Col xs={12}>
                            {country.name}
                            <Badge bg="secondary" text="light" pill className="ms-2">
                                { getMedalsTotal(country, medals) }
                            </Badge>
                        </Col>
                    </Row>
                    <span>

                    </span>

                </Card.Title>
                <ListGroup variant="flush">
                    { medals.map(medal =>
                        <ListGroup.Item className="d-flex justify-content-between" key={ medal.id }>
                            <Medal
                                country={ country }
                                medal={ medal }
                                canPatch={ canPatch }
                                onIncrement={ onIncrement }
                                onDecrement={ onDecrement } />
                        </ListGroup.Item>
                    ) }
                </ListGroup>
            </Card.Body>
        </Card>
    );
}