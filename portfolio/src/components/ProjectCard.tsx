import { useState } from 'react';
import { Col } from 'react-bootstrap';
import Modal from 'react-modal';
import gitHubLogo from '../assets/github.svg';
import type { Project } from '../types/content';
import { imageOrPlaceholder } from '../utils/image';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const image = imageOrPlaceholder(project.src);

  return (
    <>
      <Col className="cardColumn">
        <div className="card" onClick={() => setModalOpen(true)}>
          <img src={image} alt={project.name} />
          <div className="projectTitle">
            <h3>{project.name}</h3>
          </div>
          <div className="projectShow">
            <p>Click for more info</p>
          </div>
        </div>
      </Col>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="projectModal"
      >
        <div className="projectModalContents">
          <div className="modalImage">
            <img src={image} alt={project.name} />
          </div>
          <div className="projectTextContainer">
            <div>
              <h3>{project.name}</h3>
            </div>
            <div className="projectDesc">
              <p>
                <strong>Description:</strong> {project.desc}
              </p>
            </div>
            <div className="projectTechContainer">
              <p>
                <strong>Tech:</strong> {project.tech}
              </p>
            </div>
            <div className="githubCont">
              <img
                src={gitHubLogo}
                alt="GitHub"
                id="projectGithub"
                onClick={() => window.open(project.link)}
              />
              <p>Github</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
