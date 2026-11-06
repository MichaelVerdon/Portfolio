import { Col } from 'react-bootstrap';
import type { Skill } from '../types/content';
import { imageOrPlaceholder } from '../utils/image';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <Col className="cardColumn2">
      <div className="card2">
        <img src={imageOrPlaceholder(skill.src)} alt={skill.name} />
        <div className="skillTitle">
          <div>{skill.name}</div>
        </div>
      </div>
    </Col>
  );
}
