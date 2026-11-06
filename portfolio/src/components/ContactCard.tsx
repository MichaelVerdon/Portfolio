import { Col } from 'react-bootstrap';
import type { ContactLink } from '../types/content';
import { imageOrPlaceholder } from '../utils/image';

interface ContactCardProps {
  contact: ContactLink;
}

export default function ContactCard({ contact }: ContactCardProps) {
  return (
    <Col>
      <div className="contactContainer">
        <img
          src={imageOrPlaceholder(contact.img)}
          alt={contact.name}
          onClick={() => window.open(contact.link)}
          className="contactImg"
        />
      </div>
    </Col>
  );
}
