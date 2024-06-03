import React from 'react';
import SkillCard from './SkillCard';
import SkillsLangs from './skillsLangs.json';
import SkillsLibraries from './skillsLibraries.json';
import SkillsSoftware from './skillsSoftware.json';

export default function Skills(){

    return(
        <>
            <h1>Skills</h1>
            <p>These are the technologies, services, languages and frameworks that I have experience in:</p>
            <h2>Languages</h2>
            <div className="skillsContainer">
                {SkillsLangs.map((skill, index) => (
                    <SkillCard key={index} Skill={skill}/>
                ))}
            </div>
            <h2>Frameworks and Libraries</h2>
            <div className="skillsContainer">
                {SkillsLibraries.map((skill, index) => (
                    <SkillCard key={index} Skill={skill}/>
                ))}
            </div>
            <h2>Software and Services</h2>
            <div className="skillsContainer">
                {SkillsSoftware.map((skill, index) => (
                    <SkillCard key={index} Skill={skill}/>
                ))}
            </div>
        </>
        
    )
}