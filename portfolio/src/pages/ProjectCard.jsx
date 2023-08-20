import React from 'react';
import { Col } from 'react-bootstrap';

const ProjectCard = ({ Project }) => {
    return(
        <>
        <Col>
            <div className='card'>
                <img src={
                    Project.src !== "N/A" 
                    ? Project.src 
                    : 'https://via.placeholder.com/400'
                     } alt="project"/>
                <div className='projectTitle'>{Project.name}</div>  
            </div> 
        </Col>     
        </>
    )
}

export default ProjectCard;