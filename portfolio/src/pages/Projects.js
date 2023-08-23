import React from 'react';
import ProjectCard from './ProjectCard';
import ProjectsInfo from'./projects.json';

export default function Projects() {

    return (
        <>
        <h1>Projects</h1>
        <p>Explore a collection of my programming projects that showcase my skills.
            Clicking on one will redirect you to the source code on GitHub.</p>
        <div className='projectsContainer'>
            {ProjectsInfo.map((project, index) => (
                <ProjectCard key={index} Project={project}/>
            ))}
        </div>
        </>
    );
}
