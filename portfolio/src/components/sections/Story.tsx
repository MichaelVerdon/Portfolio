import selfie from '../../assets/selfielinkedin.jpg';
import { about } from '../../data';
import { PixelSteps } from '../geometry';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

export default function Story() {
  return (
    <section id="story" className="section" aria-labelledby="story-title">
      <div className="container">
        <SectionHeading id="story-title" index="01" eyebrow="Story" title="Hello, I'm Michael." />
        <div className="story-grid">
          <Reveal className="story-portrait">
            <div className="portrait">
              <img src={selfie} alt={about.name} />
              <PixelSteps className="portrait-steps" steps={4} size={16} />
            </div>
          </Reveal>
          <div className="story-text">
            <Reveal>
              <p className="lead">{about.intro}</p>
            </Reveal>
            <ol className="timeline">
              {about.timeline.map((step, i) => (
                <li key={step.title} className="timeline-step">
                  <Reveal delay={i * 120}>
                    <span className="timeline-label mono">{step.label}</span>
                    <h3>{step.title}</h3>
                    <p className="timeline-place">{step.place}</p>
                    <p>{step.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
