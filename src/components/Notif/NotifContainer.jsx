import Notif from "./Notif";
import ToastContainer from "react-bootstrap/ToastContainer";

export default function NotifContainer(props) {

    return (
        <ToastContainer className="overlay" position="top-end" style={{padding: "10px"}}>
            {props.notifications.map((n => <Notif key={n.id} title={n.title} message={n.message}/>))}
        </ToastContainer>
    );
}