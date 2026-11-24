import { skillGroups, toolkitSpotlight as spot } from "../../data";
import { imageOrPlaceholder } from "../../utils/image";
import { useWebglActive } from "../../webgl/sceneBus";
import { OrbitRings } from "../geometry";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

export default function SkillsSection() {
  const webgl = useWebglActive();
  return (
    <section
      id="skills"
      className="section"
      data-scene="orbit"
      aria-labelledby="skills-title"
    >
      <div className="container">
        <div className="skills-header">
          <SectionHeading
            id="skills-title"
            index="03"
            eyebrow="Skills"
            title="My toolkit"
            intro="The languages, frameworks and tools I reach for, from mobile apps to machine learning."
          />
          {!webgl && <OrbitRings className="skills-orbit" size={200} />}
        </div>
        <Reveal>
          <article
            className="toolSpotlight"
            aria-labelledby="tool-spotlight-name"
          >
            <img className="toolSpotlight-icon" src={spot.icon} alt="" />
            <div className="toolSpotlight-body">
              <p className="toolSpotlight-eyebrow mono">{spot.eyebrow}</p>
              <h3 id="tool-spotlight-name">{spot.name}</h3>
              <p className="toolSpotlight-text">{spot.text}</p>
              <ul className="toolSpotlight-tags">
                {spot.tags.map((tag) => (
                  <li key={tag} className="mono">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
        <div className="skills-groups">
          {skillGroups.map((group, i) => (
            <Reveal key={group.title} delay={i * 100}>
              <div className="skillGroup">
                <h3>{group.title}</h3>
                <ul className="skillList">
                  {group.skills.map((skill) => (
                    <li key={skill.name} className="skill">
                      <img
                        src={imageOrPlaceholder(skill.src)}
                        alt=""
                        loading="lazy"
                      />
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
