import type {
  About,
  ContactLink,
  Project,
  Skill,
  ToolSpotlight,
} from "../types/content";
import { isSceneId } from "../webgl/chapters";
import aboutJson from "./about.json";
import contactJson from "./contact.json";
import projectsJson from "./projects.json";
import skillsLangsJson from "./skillsLangs.json";
import skillsLibrariesJson from "./skillsLibraries.json";
import skillsSoftwareJson from "./skillsSoftware.json";
import toolkitSpotlightJson from "./toolkitSpotlight.json";

// Typed access to the site's JSON content. The `satisfies` checks fail the
// build if a JSON file is missing a field the components rely on.
// Each story step's "scene" names a 3D chapter; unknown names are dropped.
export const about: About = {
  ...aboutJson,
  timeline: aboutJson.timeline.map(({ scene, ...step }) => ({
    ...step,
    scene: isSceneId(scene) ? scene : undefined,
  })),
};
// JSON can't express string literal types, so narrow imageFit here; the data
// tests check the raw values are valid.
export const projects: Project[] = projectsJson.map(
  ({ imageFit, ...project }) =>
    ({
      ...project,
      imageFit: imageFit === "cover" ? "cover" : "contain",
    }) satisfies Project,
);
export const contacts = contactJson satisfies ContactLink[];

export const skillGroups: { title: string; skills: Skill[] }[] = [
  { title: "Languages", skills: skillsLangsJson satisfies Skill[] },
  {
    title: "Frameworks and Libraries",
    skills: skillsLibrariesJson satisfies Skill[],
  },
  {
    title: "Software and Services",
    skills: skillsSoftwareJson satisfies Skill[],
  },
];

/** The one tool called out above the skill lists. */
export const toolkitSpotlight: ToolSpotlight = toolkitSpotlightJson;

/** Splits a project's comma-separated tech list into tags. */
export function techTags(project: Project): string[] {
  return project.tech
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
