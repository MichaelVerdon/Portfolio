import Contacts from "./contact.json";
import ContactCard from "./ContactCard";

export default function Contact(){
    return(
        <>
            <div className="textContainer">
                <h1>Contact</h1>
                <p className="paragraph">Get in touch with me via email or LinkedIn:</p>
            </div>
            <div className="contactsContainer">
                {Contacts.map((contact, index) => (
                    <ContactCard key={index} Contact={contact}/>
                ))}
            </div>
        </>
    )
}