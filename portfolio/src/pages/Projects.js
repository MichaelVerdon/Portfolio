import ProjectCard from './ProjectCard';

export default function Projects(){

    const Project = {
        "name":"Test Project",
        "src":"https://www.zbrushcentral.com/uploads/default/original/3X/3/e/3e60ab859db110c6a2924f70633963fb966f0174.jpeg",
        "link":"http://www.google.com",
    }
    return(
        <div className='projectsContainer'>
            <ProjectCard Project={Project}></ProjectCard>
            <ProjectCard Project={Project}></ProjectCard>
            <ProjectCard Project={Project}></ProjectCard>
            
          
        </div>
        
    )
}