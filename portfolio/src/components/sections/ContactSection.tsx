import { contacts } from '../../data';
import { imageOrPlaceholder } from '../../utils/image';
import { PixelField } from '../geometry';
import SectionHeading from '../SectionHeading';

export default function ContactSection() {
  return (
    <section id="contact" className="section section--dark" aria-labelledby="contact-title">
      <PixelField className="contact-field" columns={40} rows={12} density={0.05} seed={21} />
      <div className="container contact-content">
        <SectionHeading
          id="contact-title"
          index="04"
          eyebrow="Contact"
          title="Let's build something."
          intro="Whether it's a role, a project or just a chat about AI and creative tech, I'd love to hear from you."
        />
        <ul className="contactLinks">
          {contacts.map((c) => (
            <li key={c.name}>
              <a
                className="contactLink"
                href={c.link}
                target={c.link.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                <img src={imageOrPlaceholder(c.img)} alt="" />
                <span>{c.name}</span>
              </a>
            </li>
          ))}
          <li>
            <a
              className="contactLink"
              href="https://github.com/MichaelVerdon"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contactLink-icon mono">{'</>'}</span>
              <span>GitHub</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
