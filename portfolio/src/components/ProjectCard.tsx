import { useRef, useState } from 'react';
import Modal from 'react-modal';
import { techTags } from '../data';
import type { Project } from '../types/content';
import { transitionName, withViewTransition } from '../motion/viewTransition';
import { imageOrPlaceholder } from '../utils/image';

interface ProjectCardProps {
  project: Project;
  /** Large, wide layout for the lead project. */
  featured?: boolean;
}

/** Only real web links get a "source code" button (some projects have none). */
function hasSourceLink(project: Project) {
  return project.link.startsWith('https://');
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const [open, setOpen] = useState(false);
  // The card's image and the modal's image share one name, so the browser
  // morphs one into the other. The card only carries the name for the moment
  // of its own transition; otherwise every card would be lifted above the
  // modal overlay while it animates.
  const cardImage = useRef<HTMLDivElement>(null);
  const vtName = transitionName('project', project.name);
  const nameCard = (name: string) => {
    if (cardImage.current) cardImage.current.style.viewTransitionName = name;
  };
  const openModal = () =>
    withViewTransition(
      () => {
        nameCard('');
        setOpen(true);
      },
      { before: () => nameCard(vtName) },
    );
  const closeModal = () =>
    withViewTransition(
      () => {
        setOpen(false);
        nameCard(vtName);
      },
      { after: () => nameCard('') },
    );
  const tags = techTags(project);
  const image = imageOrPlaceholder(project.src);
  const coverClass = project.imageFit === 'cover' ? ' is-cover' : '';

  return (
    <>
      <button
        type="button"
        className={`projectCard${featured ? ' projectCard--featured' : ''}`}
        onClick={openModal}
      >
        <div
          ref={cardImage}
          className={`projectCard-image${coverClass}`}
        >
          <img src={image} alt="" loading="lazy" />
          {project.status && <span className="statusBadge">{project.status}</span>}
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
          <span className="projectCard-cta mono" aria-hidden="true">
            View project <span className="projectCard-arrow">→</span>
          </span>
        </div>
      </button>

      <Modal
        isOpen={open}
        onRequestClose={closeModal}
        className="projectModal"
        overlayClassName="projectModal-overlay"
        contentLabel={project.name}
      >
        <button
          type="button"
          className="projectModal-close"
          aria-label="Close"
          onClick={closeModal}
        >
          ×
        </button>
        <div
          className={`projectModal-image${coverClass}`}
          style={{ viewTransitionName: open ? vtName : undefined }}
        >
          <img src={image} alt={project.name} />
        </div>
        <div className="projectModal-body">
          {project.status && <span className="statusBadge statusBadge--inline">{project.status}</span>}
          <h3>{project.name}</h3>
          <p>{project.desc}</p>
          <ul className="tags" aria-label="Tech">
            {tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
          {(project.demo || hasSourceLink(project)) && (
            <div className="actions">
              {project.demo && (
                <a className="button button--primary" href={project.demo} target="_blank" rel="noreferrer">
                  See it live
                </a>
              )}
              {hasSourceLink(project) && (
                <a
                  className={`button ${project.demo ? 'button--ghost' : 'button--primary'}`}
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source on GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
