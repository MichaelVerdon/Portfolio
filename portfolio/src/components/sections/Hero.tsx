import { about } from '../../data';
import { PixelField } from '../geometry';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <PixelField className="hero-field" columns={40} rows={20} density={0.07} />
      <div className="container hero-content">
        <p className="eyebrow eyebrow--dark">
          {about.name} · {about.role}
        </p>
        <h1 id="hero-title">{about.headline}</h1>
        <ul className="hero-drives" aria-label="What drives me">
          {about.drives.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <div className="actions">
          <a className="button button--primary" href="#projects">
            See my work
          </a>
          <a className="button button--ghostDark" href="#contact">
            Get in touch
          </a>
        </div>
      </div>
      <a className="hero-scroll mono" href="#story" aria-label="Scroll to my story">
        scroll ↓
      </a>
    </section>
  );
}
