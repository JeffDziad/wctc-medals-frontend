import { Toast } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function Notif(props) {
    const [minAlive, setMinAlive] = useState(0);
    const [showToast, setShowToast] = useState(true); // State to manage toast visibility

    useEffect(() => {
        const interval = setInterval(() => {
            setMinAlive(prevState => prevState + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleClose = () => {
        setShowToast(false); // Set showToast to false to hide the toast
    }

    return (
        <>
            {showToast && (
                <Toast onClose={handleClose}>
                    <Toast.Header>
                        <strong className="me-auto">{props.title}</strong>
                        <small>{(minAlive === 0) ? "Just Now" : `${minAlive} min ago`}</small>
                    </Toast.Header>
                    <Toast.Body>{props.message}</Toast.Body>
                </Toast>
            )}
        </>
    );
}