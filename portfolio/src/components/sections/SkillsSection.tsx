import { skillGroups } from '../../data';
import { imageOrPlaceholder } from '../../utils/image';
import { OrbitRings } from '../geometry';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

export default function SkillsSection() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <div className="skills-header">
          <SectionHeading
            id="skills-title"
            index="03"
            eyebrow="Skills"
            title="My toolkit"
            intro="The languages, frameworks and tools I reach for, from mobile apps to machine learning."
          />
          <OrbitRings className="skills-orbit" size={200} />
        </div>
        <div className="skills-groups">
          {skillGroups.map((group, i) => (
            <Reveal key={group.title} delay={i * 100}>
              <div className="skillGroup">
                <h3>{group.title}</h3>
                <ul className="skillList">
                  {group.skills.map((skill) => (
                    <li key={skill.name} className="skill">
                      <img src={imageOrPlaceholder(skill.src)} alt="" loading="lazy" />
                      <span>{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
