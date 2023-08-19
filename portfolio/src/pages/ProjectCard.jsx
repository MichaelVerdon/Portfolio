import React from 'react';

const ProjectCard = ({ Project }) => {
    return(
        <>
        <div className='Card'>
            <img src={Project.src !== "N/A" ? Project.src : 'https://via.placeholder.com/400'} alt="project"/>
        </div>
        </>
    )
}

export default ProjectCard;