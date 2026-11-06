import ProjectCard from '../components/ProjectCard';
import { projects } from '../data';

export default function Projects() {
  return (
    <div className="projectPageContainer">
      <h1>Projects</h1>
      <p className="paragraph">
        Explore a collection of my programming projects that showcase my skills. Clicking on one
        will redirect you to the source code on GitHub.
      </p>
      <div className="projectsContainer">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}
