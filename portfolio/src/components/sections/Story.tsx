import { useEffect, useRef, useState } from 'react';
import selfie from '../../assets/selfielinkedin.jpg';
import { about } from '../../data';
import { DESKTOP_MOTION, gsap, ScrollTrigger } from '../../motion/gsap';
import { prefersReducedMotion } from '../../motion/reducedMotion';
import { PixelSteps } from '../geometry';
import SectionHeading from '../SectionHeading';

/**
 * On wide screens with motion allowed, the photo and timeline pin in place
 * and scrolling steps through each stage of the story in turn, like a car
 * site revealing a model. Otherwise it is a plain vertical timeline.
 */
export default function Story() {
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(about.timeline.length - 1);
  const count = about.timeline.length;

  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_MOTION, () => {
      setPinned(true);
      setActive(0);
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 18%',
        end: () => `+=${window.innerHeight * count * 0.55}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          setActive(Math.min(count - 1, Math.floor(self.progress * count)));
          if (progress.current) progress.current.style.transform = `scaleY(${self.progress})`;
        },
      });
      return () => {
        trigger.kill();
        setPinned(false);
        setActive(count - 1);
      };
    });
    return () => mm.revert();
  }, [count]);

  return (
    <section id="story" className="section" aria-labelledby="story-title">
      <div className="container">
        <SectionHeading id="story-title" index="01" eyebrow="Story" title="Hello, I'm Michael." />
        <div ref={stage} className={`story-grid ${pinned ? 'is-pinned' : ''}`}>
          <div className="story-portrait" data-reveal>
            <div className="portrait">
              <img src={selfie} alt={about.name} />
              <PixelSteps className="portrait-steps" steps={pinned ? active + 1 : count} size={16} />
            </div>
            <p className="lead story-lead">{about.intro}</p>
          </div>
          <div className="story-text">
            <div className="timeline-wrap">
              <span ref={progress} className="timeline-progress" aria-hidden="true" />
              <ol className="timeline">
              {about.timeline.map((step, i) => (
                <li
                  key={step.title}
                  className={`timeline-step ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
                  aria-current={pinned && i === active ? 'step' : undefined}
                >
                  <span className="timeline-label mono">{step.label}</span>
                  <h3>{step.title}</h3>
                  <p className="timeline-place">{step.place}</p>
                  <div className="timeline-detail">
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
