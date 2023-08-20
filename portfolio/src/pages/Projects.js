import React from 'react';
import ProjectCard from './ProjectCard';

export default function Projects() {
    const Project = {
        "name": "Test Project",
        "src": "https://www.zbrushcentral.com/uploads/default/original/3X/3/e/3e60ab859db110c6a2924f70633963fb966f0174.jpeg",
        "link": "http://www.google.com",
    };

    const projectsArray = new Array(8).fill(Project); // Create an array of Project objects

    return (
        <div className='projectsContainer'>
            {projectsArray.map((project, index) => (
                <ProjectCard key={index} Project={project} />
            ))}
        </div>
    );
}
