import ProjectCard from './ProjectCard';
import onyo from './images/onyo.jpg'

export default function Projects(){

    const Project = {
        "name":"Test Project",
        "src":{onyo},
        "link":"http://www.google.com",

    }
    return(
        <ProjectCard Project={Project}></ProjectCard>
    )
}