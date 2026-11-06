import type { ContactLink, Project, Skill } from '../types/content';
import contactJson from './contact.json';
import projectsJson from './projects.json';
import skillsLangsJson from './skillsLangs.json';
import skillsLibrariesJson from './skillsLibraries.json';
import skillsSoftwareJson from './skillsSoftware.json';

// Typed access to the site's JSON content. The `satisfies` checks fail the
// build if a JSON file is missing a field the components rely on.
export const projects = projectsJson satisfies Project[];
export const contacts = contactJson satisfies ContactLink[];

export const skillGroups: { title: string; skills: Skill[] }[] = [
  { title: 'Languages', skills: skillsLangsJson satisfies Skill[] },
  { title: 'Frameworks and Libraries', skills: skillsLibrariesJson satisfies Skill[] },
  { title: 'Software and Services', skills: skillsSoftwareJson satisfies Skill[] },
];
