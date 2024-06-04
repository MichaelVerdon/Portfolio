import React from 'react';
import { Col } from 'react-bootstrap';

const ProjectCard = ({ Project }) => {

    const redirectLink = () => {
        window.open(Project.link)
    }

    return(
        <>
            <Col className='cardColumn'>
                <div className='card' onClick={redirectLink}>
                    <img src={
                        Project.src !== "N/A" 
                        ? Project.src
                        : 'https://via.placeholder.com/400'
                        } alt="project"/>
                    <div className='projectTitle'>
                        <h3>{Project.name}</h3>
                    </div>
                    <div className="projectDesc">
                        <p>{Project.desc}</p>
                    </div>
                </div> 
            </Col>     
        </>
    )
}

export default ProjectCard;