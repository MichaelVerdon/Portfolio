import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  logo: string;
}

export const navLinks = [
  { href: '/#story', label: 'Story' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar({ logo }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main">
        <Link to="/" className="navbar-logo" onClick={close}>
          <img src={logo} alt="Michael Verdon" />
        </Link>
        <button
          type="button"
          className="navbar-toggle"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="navbar-links"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <ul id="navbar-links" className={`navbar-links ${isOpen ? 'is-open' : ''}`}>
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <a href={href} onClick={close}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
