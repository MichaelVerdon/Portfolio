import React from 'react';

const ProjectCard = ({ Project }) => {
    return(
        <>
            <div className='card'>
                <img src={
                    Project.src !== "N/A" 
                    ? Project.src 
                    : 'https://via.placeholder.com/400'
                     } alt="project"/>
                <div className='projectTitle'>{Project.name}</div>  
            </div>      
        </>
    )
}

export default ProjectCard;