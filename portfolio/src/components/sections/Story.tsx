import { useEffect, useRef, useState } from 'react';
import selfie from '../../assets/selfielinkedin.jpg';
import { about } from '../../data';
import { DESKTOP_MOTION, gsap, ScrollTrigger } from '../../motion/gsap';
import { prefersReducedMotion } from '../../motion/reducedMotion';
import { CHAPTERS } from '../../webgl/chapters';
import { sceneBus, useWebglActive } from '../../webgl/sceneBus';
import { PixelSteps } from '../geometry';
import SectionHeading from '../SectionHeading';

const NARROW_MOTION = '(prefers-reduced-motion: no-preference) and (max-width: 899px)';

function showScene(step: number) {
  const milestone = about.timeline[step];
  if (milestone?.scene) sceneBus.setChapter(milestone.scene, milestone.logo);
}

/**
 * On wide screens with motion allowed, the timeline pins in place and
 * scrolling steps through each stage of the story in turn. With 3D on,
 * each stage also morphs the cubes into that chapter's formation, framed
 * in the right-hand column. Otherwise it is a plain vertical timeline.
 */
export default function Story() {
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(about.timeline.length - 1);
  const webgl = useWebglActive();
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
        start: webgl ? 'top 12%' : 'top 18%',
        end: () => `+=${window.innerHeight * count * 0.6}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const step = Math.min(count - 1, Math.floor(self.progress * count));
          setActive(step);
          if (self.isActive) showScene(step);
          if (progress.current) progress.current.style.transform = `scaleY(${self.progress})`;
        },
        onToggle: (self) => {
          if (self.isActive) showScene(Math.min(count - 1, Math.floor(self.progress * count)));
        },
      });
      return () => {
        trigger.kill();
        setPinned(false);
        setActive(count - 1);
      };
    });
    // Phones: no pinning; each step switches the 3D chapter as it passes.
    mm.add(NARROW_MOTION, () => {
      const triggers = Array.from(el.querySelectorAll<HTMLElement>('.timeline-step')).map((li, i) =>
        ScrollTrigger.create({
          trigger: li,
          start: 'top 60%',
          end: 'bottom 40%',
          onToggle: (self) => {
            if (self.isActive) showScene(i);
          },
        }),
      );
      return () => triggers.forEach((t) => t.kill());
    });
    return () => mm.revert();
  }, [count, webgl]);

  const timeline = (
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
  );

  if (webgl) {
    const milestone = about.timeline[active];
    const scene = milestone?.scene;
    return (
      <section id="story" className="section story--3d" aria-labelledby="story-title">
        <div className="container">
          <SectionHeading id="story-title" index="01" eyebrow="Story" title="Hello, I'm Michael." />
          <div className="story-intro" data-reveal data-scene={about.timeline[0]?.scene}>
            <img className="story-avatar" src={selfie} alt={about.name} />
            <p className="lead">{about.intro}</p>
          </div>
          <div ref={stage} className={`story-grid ${pinned ? 'is-pinned' : ''}`}>
            {timeline}
            <div className="story-scene" aria-hidden="true">
              <span className="story-scene-corner story-scene-corner--tl" />
              <span className="story-scene-corner story-scene-corner--br" />
              <span className="story-caption mono">
                {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                <span className="story-caption-label">
                  {milestone?.logo ? `Fig. ${String(active + 1).padStart(2, '0')} / ${milestone.place.split(' · ')[0]}` : scene ? CHAPTERS[scene].label : ''}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
          {timeline}
        </div>
      </div>
    </section>
  );
}
