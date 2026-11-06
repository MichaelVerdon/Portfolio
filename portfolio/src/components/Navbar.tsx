import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  logo: string;
}

const links = [
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar({ logo }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <nav className="nav">
      <div className="logoContainer">
        <Link to="/" onClick={close}>
          <img src={logo} alt="Michael Verdon" />
        </Link>
      </div>
      <div className={`navContentsContainer ${isOpen ? 'open' : ''}`}>
        <ul className={`navList ${isOpen ? 'active' : ''}`}>
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="header" onClick={close}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
    </nav>
  );
}
