import { useState } from 'react';
import Modal from 'react-modal';
import { techTags } from '../data';
import type { Project } from '../types/content';
import { imageOrPlaceholder } from '../utils/image';

interface ProjectCardProps {
  project: Project;
}

/** Only real web links get a "source code" button (some projects have none). */
function hasSourceLink(project: Project) {
  return project.link.startsWith('https://');
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [open, setOpen] = useState(false);
  const tags = techTags(project);
  const image = imageOrPlaceholder(project.src);
  const coverClass = project.imageFit === 'cover' ? ' is-cover' : '';

  return (
    <>
      <button type="button" className="projectCard" onClick={() => setOpen(true)}>
        <div className={`projectCard-image${coverClass}`}>
          <img src={image} alt="" loading="lazy" />
        </div>
        <div className="projectCard-body">
          <h3>{project.name}</h3>
          <p className="projectCard-desc">{project.desc}</p>
          <ul className="tags" aria-label="Tech">
            {tags.slice(0, 3).map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
            {tags.length > 3 && <li className="tag tag--more">+{tags.length - 3}</li>}
          </ul>
        </div>
      </button>

      <Modal
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        className="projectModal"
        overlayClassName="projectModal-overlay"
        contentLabel={project.name}
      >
        <button
          type="button"
          className="projectModal-close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <div className={`projectModal-image${coverClass}`}>
          <img src={image} alt={project.name} />
        </div>
        <div className="projectModal-body">
          <h3>{project.name}</h3>
          <p>{project.desc}</p>
          <ul className="tags" aria-label="Tech">
            {tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
          {hasSourceLink(project) && (
            <a className="button button--primary" href={project.link} target="_blank" rel="noreferrer">
              View source on GitHub
            </a>
          )}
        </div>
      </Modal>
    </>
  );
}
