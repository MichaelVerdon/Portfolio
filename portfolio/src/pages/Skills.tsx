import SkillCard from '../components/SkillCard';
import { skillGroups } from '../data';

export default function Skills() {
  return (
    <>
      <h1>Skills</h1>
      <p className="paragraph">
        These are the technologies, services, languages and frameworks that I have experience in:
      </p>
      {skillGroups.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <div className="skillsContainer">
            {group.skills.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
