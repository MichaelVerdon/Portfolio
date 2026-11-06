import { about } from '../../data';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {about.name}
        </span>
        <span className="mono">Built with React, TypeScript and a lot of squares.</span>
      </div>
    </footer>
  );
}
