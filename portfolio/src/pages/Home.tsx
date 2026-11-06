import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ContactSection from '../components/sections/ContactSection';
import Hero from '../components/sections/Hero';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';
import Story from '../components/sections/Story';

export default function Home() {
  const { hash } = useLocation();

  // When arriving with a hash (e.g. /#projects from another page or an old
  // /projects link), scroll to that section once it has rendered.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView?.();
  }, [hash]);

  return (
    <main>
      <Hero />
      <Story />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}
