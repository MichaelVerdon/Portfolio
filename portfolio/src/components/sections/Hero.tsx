import { about } from '../../data';
import { useWebglActive } from '../../webgl/sceneBus';
import { HeroCanvas } from '../geometry';

export default function Hero() {
  // With 3D on, the cubes behind the page draw the mark; the 2D pixel
  // canvas is the fallback.
  const webgl = useWebglActive();
  return (
    <section className={`hero ${webgl ? 'hero--3d' : ''}`} aria-labelledby="hero-title" data-scene="logo">
      {!webgl && <HeroCanvas className="hero-field" />}
      <div className="container hero-content">
        <p className="eyebrow eyebrow--dark" data-reveal>
          {about.name} · {about.role}
        </p>
        <h1 id="hero-title" data-split>
          {about.headline}
        </h1>
        <ul className="hero-drives" aria-label="What drives me" data-reveal data-reveal-delay="0.5">
          {about.drives.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <div className="actions" data-reveal data-reveal-delay="0.7">
          <a className="button button--primary" href="#projects">
            See my work
          </a>
          <a className="button button--ghostDark" href="#contact">
            Get in touch
          </a>
        </div>
      </div>
      <a className="hero-scroll mono" href="#story" aria-label="Scroll to my story">
        <span className="hero-scroll-line" aria-hidden="true" />
        scroll
      </a>
    </section>
  );
}
