import React from 'react';
import { Col } from 'react-bootstrap';

const SkillCard = ({ Skill }) => {
    return(
        <>
            <Col className='cardColumn2'>
                <div className='card2'>
                    <img src={
                                Skill.src !== "N/A" 
                                ? Skill.src
                                : 'https://via.placeholder.com/400'
                                } alt='project'/>
                    <div className='skillTitle'>
                        <h1>{Skill.name}</h1>
                    </div>
                </div>
            </Col>
        </>
    )
}

export default SkillCard;
