import ContactCard from '../components/ContactCard';
import { contacts } from '../data';

export default function Contact() {
  return (
    <>
      <div className="textContainer">
        <h1>Contact</h1>
        <p className="paragraph">Get in touch with me via email or LinkedIn:</p>
      </div>
      <div className="contactsContainer">
        {contacts.map((contact) => (
          <ContactCard key={contact.name} contact={contact} />
        ))}
      </div>
    </>
  );
}
