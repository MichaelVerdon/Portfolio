import React from 'react';
import { Col } from 'react-bootstrap';

const ProjectCard = ({ Project }) => {

    const redirectLink = () => {
        window.open(Project.link)
    }

    return(
        <>
        <Col>
            <div className='card' onClick={redirectLink}>
                <img src={
                    Project.src !== "N/A" 
                    ? Project.src
                    : 'https://via.placeholder.com/400'
                     } alt="project"/>
                <div className='projectTitle'>
                    <a>{Project.name}</a>
                </div>  
            </div> 
        </Col>     
        </>
    )
}

export default ProjectCard;