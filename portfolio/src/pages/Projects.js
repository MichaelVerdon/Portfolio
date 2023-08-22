import React from 'react';
import ProjectCard from './ProjectCard';
import ProjectsInfo from'./projects.json';

export default function Projects() {
    const Project = {
        "name": "Test Project",
        "src": "https://www.zbrushcentral.com/uploads/default/original/3X/3/e/3e60ab859db110c6a2924f70633963fb966f0174.jpeg",
        "link": "http://www.google.com",
    };

    const projectsArray = new Array(Project); // Create an array of Project objects

    return (
        <>
        <h1>Projects</h1>
        <div className='projectsContainer'>
            {ProjectsInfo.map((project, index) => (
                <ProjectCard key={index} Project={project}/>
            ))}
        </div>
        </>
    );
}
