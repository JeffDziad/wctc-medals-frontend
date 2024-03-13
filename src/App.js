import './App.css';
import React, {useEffect, useRef, useState} from 'react';
import Country from "./components/Country";
import NewCountry from "./components/NewCountry";
import {Badge, Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import axios from "axios";
import {HubConnectionBuilder} from "@microsoft/signalr";
import Login from "./components/Login";
import Logout from "./components/Logout";
import jwtDecode from "jwt-decode";
import NotifContainer from "./components/Notif/NotifContainer";

class CountryObj {
    constructor(name, id=0, gold=0, silver=0, bronze=0) {
        this.id = id;
        this.name = name;
        this.gold = gold;
        this.silver = silver;
        this.bronze = bronze;
    }
}

function App() {

    //! CHANGE THIS TO AZURE ONCE DEPLOYED
    const HUB_ENDPOINT = "https://jeffdziad-wctc-medals-api.azurewebsites.net/medalsHub";
    const [connection, setConnection] = useState(null);

    const USERS_ENDPOINT = "https://jeffdziad-wctc-medals-api.azurewebsites.net/api/users/login";
    const [user, setUser] = useState({
        name: null,
        authenticated: false,
        canPost: false,
        canPatch: false,
        canDelete: false
    });


    const COUNTRY_ENDPOINT = "https://jeffdziad-wctc-medals-api.azurewebsites.net/jwt/api/country";
    const [countries, setCountries] = useState([]);
    const medals = useRef([
        {id: 1, name: 'gold'},
        { id: 2, name: 'silver' },
        { id: 3, name: 'bronze' },
    ]);
    const latestCountries = useRef(null);
    latestCountries.current = countries;

    const [notifId, setNotifId] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const createNotification = (title, message) => {
        setNotifications(prevState => [...prevState, {id: notifId, title: title, message: message}])
        setNotifId(prevState => prevState+1);
    }

    useEffect(() => {
        async function fetchCountries() {
            const { data: fetchedCountries } = await axios.get(COUNTRY_ENDPOINT);
            let newCountries = [];
            fetchedCountries.forEach(country => {
                let newCountry = new CountryObj(country.name, country.id);
                medals.current.forEach(medal => {
                    const count = country[medal.name];
                    newCountry[medal.name] = { page_value: count, saved_value: count };
                });
                newCountries.push(newCountry);
            });
            setCountries(newCountries);
        }
        fetchCountries();

        const encodedJwt = localStorage.getItem("token");
        encodedJwt && setUser(getUser(encodedJwt));

        const newConnection = new HubConnectionBuilder()
            .withUrl(HUB_ENDPOINT)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {

                    connection.on('ReceiveAddMessage', country => {
                        let newCountry = {
                            id: country.id,
                            name: country.name,
                        };
                        medals.current.forEach(medal => {
                            const count = country[medal.name];
                            newCountry[medal.name] = { page_value: count, saved_value: count };
                        });
                        let mutableCountries = [...latestCountries.current];
                        mutableCountries = mutableCountries.concat(newCountry);
                        setCountries(mutableCountries);
                    });

                    connection.on('ReceiveDeleteMessage', id => {
                        let mutableCountries = [...latestCountries.current];
                        mutableCountries = mutableCountries.filter(c => c.id !== id);
                        setCountries(mutableCountries);
                    });

                    connection.on('ReceivePatchMessage', country => {
                        let updatedCountry = {
                            id: country.id,
                            name: country.name,
                        }
                        medals.current.forEach(medal => {
                            const count = country[medal.name];
                            updatedCountry[medal.name] = { page_value: count, saved_value: count };
                        });
                        let mutableCountries = [...latestCountries.current];
                        const idx = mutableCountries.findIndex(c => c.id === country.id);
                        mutableCountries[idx] = updatedCountry;

                        setCountries(mutableCountries);
                    });

                })
                .catch(e => createNotification("Database", "Failed to connect to the Olympic Medals Database!"));
        }
    }, [connection]);

    const handleLogin = async (username, password) => {
        try {
            const resp = await axios.post(USERS_ENDPOINT, { username: username, password: password });
            const encodedJwt = resp.data.token;
            localStorage.setItem('token', encodedJwt);
            const u = getUser(encodedJwt);
            setUser(u);
            createNotification("Login Success", `Welcome, ${u.name}!`);
        } catch (ex) {
            if (ex.response && (ex.response.status === 401 || ex.response.status === 400 )) {
                createNotification("Authentication", "Unable to login, please try again...");
            } else if (ex.response) {
                console.log(ex.response);
            } else {
                createNotification("Authentication", "The server was unresponsive, please try again at a later time...");
            }
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser({
            name: null,
            authenticated: false,
            canPost: false,
            canPatch: false,
            canDelete: false
        });
        createNotification("Logout", `Goodbye!`);
    }

    const getUser = (encodedJwt) => {
        // return unencoded user / permissions
        const decodedJwt = jwtDecode(encodedJwt);
        return {
            name: decodedJwt['username'],
            authenticated: true,
            canPost: decodedJwt['roles'].indexOf('medals-post') === -1 ? false : true,
            canPatch: decodedJwt['roles'].indexOf('medals-patch') === -1 ? false : true,
            canDelete: decodedJwt['roles'].indexOf('medals-delete') === -1 ? false : true,
        };
    }

    const handleUpdate = (countryId, medalName, factor) => {
        const idx = countries.findIndex(c => c.id === countryId);
        const mutableCountries = [...countries ];
        mutableCountries[idx][medalName].page_value += (1 * factor);
        setCountries(mutableCountries);
    }

    const handleIncrement = (countryId, medalName) => {
        handleUpdate(countryId, medalName, 1);
    }

    const handleDecrement = (countryId, medalName) => {
        handleUpdate(countryId, medalName, -1);
    }

    const getAllMedalsTotal = () => {
        let sum = 0;
        medals.current.forEach(medal => { sum += countries.reduce((a, b) => a + b[medal.name].page_value, 0); });
        return sum;
    }

    const handleAdd = async (name) => {
        try {
            await axios.post(COUNTRY_ENDPOINT, {
                name: name
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            createNotification("Added", `Added ${name}`);
        } catch (ex) {
            if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) {
                createNotification("Authentication", "You are not Authorized to do that! Please login.");
            } else if (ex.response) {
                console.log(ex.response);
            } else {
                createNotification("Authentication", "The server was unresponsive, please try again at a later time...");
            }
        }
    }

    const handleDelete = async  (countryId) => {
        const originalCountries = countries;
        setCountries(countries.filter(c => c.id !== countryId));
        try {
            await axios.delete(`${COUNTRY_ENDPOINT}/${countryId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            createNotification("Delete", `Successfully removed the country.`);
        } catch(e) {
            console.error(e);
            if (e.response && e.response.status === 404) {
                createNotification("Conflict", "That record does not exist, it may have been deleted...");
            } else {
                setCountries(originalCountries);
                if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                    createNotification("Authentication", "You are not Authorized to do that! Please login.");
                } else if (e.response) {
                    console.log(e.response);
                } else {
                    createNotification("Authentication", "The server was unresponsive, please try again at a later time...");
                }
            }
        }
    }

    const handleSave = async (countryId) => {
        const originalCountries = countries;

        const idx = countries.findIndex(c => c.id === countryId);
        const mutableCountries = [ ...countries ];
        const country = mutableCountries[idx];
        let jsonPatch = [];
        medals.current.forEach(medal => {
            if (country[medal.name].page_value !== country[medal.name].saved_value) {
                jsonPatch.push({ op: "replace", path: medal.name, value: country[medal.name].page_value });
                country[medal.name].saved_value = country[medal.name].page_value;
            }
        });
        setCountries(mutableCountries);

        try {
            await axios.patch(`${COUNTRY_ENDPOINT}/${countryId}`, jsonPatch, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            createNotification("Update", `Successfully updated the Database.`);
        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                createNotification("Conflict", "That record does not exist, it may have been deleted...");
            } else if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) {
                createNotification("Authentication", "You are not Authorized to do that! Please login.");
                window.location.reload(false);
            } else {
                createNotification("Authentication", "The server was unresponsive, please try again at a later time...");
                setCountries(originalCountries);
            }
        }
    }

    const handleReset = (countryId) => {
        const idx = countries.findIndex(c => c.id === countryId);
        const mutableCountries = [ ...countries ];
        const country = mutableCountries[idx];
        medals.current.forEach(medal => {
            country[medal.name].page_value = country[medal.name].saved_value;
        });
        setCountries(mutableCountries);
    }

    return (
        <React.Fragment>
            <NotifContainer notifications={notifications}/>
            <Navbar className="navbar-dark bg-dark">
                <Container fluid>
                    <Navbar.Brand>
                        Olympic Medals
                        <Badge className="ms-2" bg="light" text="dark" pill>{ getAllMedalsTotal() }</Badge>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        { user.canPost && <NewCountry onAdd={ handleAdd } /> }
                        { user.authenticated ? <Logout onLogout={ handleLogout } user={user} /> : <Login onLogin={ handleLogin } /> }
                    </Nav>
                </Container>
            </Navbar>
            <Container fluid>
                <Row>
                    { countries.map(country =>
                        <Col className="mt-3 d-flex justify-content-center" key={ country.id }>
                            <Country
                                country={ country }
                                medals={ medals.current }
                                onDelete={ handleDelete }
                                canDelete={ user.canDelete }
                                canPatch={ user.canPatch }
                                onSave={ handleSave }
                                onReset={ handleReset }
                                onIncrement={ handleIncrement }
                                onDecrement={ handleDecrement } />
                        </Col>
                    )}
                </Row>
            </Container>
        </React.Fragment>
    );
}

export default App;
