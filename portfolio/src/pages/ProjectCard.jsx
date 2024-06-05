import React from 'react';
import { useState } from 'react';
import { Col } from 'react-bootstrap';
import Modal from 'react-modal';
import gitHubLogo from "./images/github.svg"

const ProjectCard = ({ Project }) => {

    const redirectLink = () => {
        window.open(Project.link)
    }

    const [modalOpen, toggleModal] = useState(false);
    const handleOpen = () => toggleModal(true);
    const handleClose = () => toggleModal(false);

    return(
        <>
            <Col className='cardColumn'>
                <div className='card' onClick={handleOpen}>
                    <img src={
                        Project.src !== "N/A" 
                        ? Project.src
                        : 'https://via.placeholder.com/400'
                        } alt="project"/>
                    <div className='projectTitle'>
                        <h3>{Project.name}</h3>
                    </div>
                    <div className="projectShow">
                        <p>Click for more info</p>
                    </div>
                </div> 
            </Col>
            <Modal isOpen={modalOpen} onRequestClose={handleClose} className="projectModal">
             <div className='projectModalContents'>
                <div className='modalImage'>
                    <img src={
                            Project.src !== "N/A" 
                            ? Project.src
                            : 'https://via.placeholder.com/400'
                            } alt="project"/>
                    </div>
                <div className='projectTextContainer'>
                    <div>
                        <h3>{Project.name}</h3>
                    </div>
                    <div className="projectDesc">
                        <p><strong>Description:</strong> {Project.desc}</p>
                    </div>
                    <div className='projectTechContainer'>
                        <p><strong>Tech:</strong> {Project.tech}</p>
                    </div>
                    <div className="githubCont">
                        <img src={gitHubLogo} alt="github" id="projectGithub" onClick={redirectLink}/>
                        <p>Github</p>
                    </div>     
                </div>
                
             </div>
            </Modal>  
        </>
    )
}

export default ProjectCard;
