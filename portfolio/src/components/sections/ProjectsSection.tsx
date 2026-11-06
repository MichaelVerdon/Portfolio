import { useState } from 'react';
import { projects } from '../../data';
import ProjectCard from '../ProjectCard';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

/** How many projects show before "Show all". The order in projects.json sets which. */
export const FEATURED_COUNT = 6;

export default function ProjectsSection() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? projects : projects.slice(0, FEATURED_COUNT);

  return (
    <section id="projects" className="section section--tinted" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading
          id="projects-title"
          index="02"
          eyebrow="Projects"
          title="Things I've built"
          intro="From open-source libraries used by thousands of apps to machine learning research and games. Pick one to read more."
        />
        <ul className="projectGrid">
          {visible.map((project, i) => (
            <li key={project.name}>
              <Reveal delay={(i % 3) * 100}>
                <ProjectCard project={project} />
              </Reveal>
            </li>
          ))}
        </ul>
        {projects.length > FEATURED_COUNT && (
          <div className="actions actions--center">
            <button
              type="button"
              className="button button--ghost"
              aria-expanded={showAll}
              onClick={() => setShowAll((s) => !s)}
            >
              {showAll ? 'Show fewer' : `Show all ${projects.length} projects`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
