import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ContactSection from '../components/sections/ContactSection';
import Hero from '../components/sections/Hero';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';
import Story from '../components/sections/Story';
import { useMagnetic } from '../motion/useMagnetic';
import { useScrollReveals } from '../motion/useScrollReveals';

export default function Home() {
  const { hash } = useLocation();
  const main = useRef<HTMLElement>(null);

  useScrollReveals(main);
  useMagnetic(main, '.button, .contactLink');

  // When arriving with a hash (e.g. /#projects from another page or an old
  // /projects link), scroll to that section once it has rendered.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView?.();
  }, [hash]);

  return (
    <main ref={main}>
      <Hero />
      <Story />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}
