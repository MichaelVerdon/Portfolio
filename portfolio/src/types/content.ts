import type { SceneId } from "../webgl/chapters";

/** Shapes of the JSON content files in src/data. */

export interface Project {
  name: string;
  /** Image path under /public, or "N/A" for a placeholder. */
  src: string;
  /** Link to the source code. */
  link: string;
  desc: string;
  tech: string;
  /** "cover" fills the frame edge to edge (good for screenshots). Defaults to fitting a logo inside it. */
  imageFit?: "cover" | "contain";
  /** Optional badge, e.g. "To be released". */
  status?: string;
  /** Optional link to a live version of the project. */
  demo?: string;
}

export interface Skill {
  name: string;
  /** Icon path under /public, or "N/A" for a placeholder. */
  src: string;
}

/** A tool given its own card above the skill lists. */
export interface ToolSpotlight {
  eyebrow: string;
  name: string;
  /** Icon path under /public. */
  icon: string;
  text: string;
  tags: string[];
}

export interface ContactLink {
  name: string;
  /** Icon path under /public, or "N/A" for a placeholder. */
  img: string;
  link: string;
}

export interface Milestone {
  /** Short label shown above the step, e.g. "Now". */
  label: string;
  title: string;
  place: string;
  text: string;
  /** The 3D formation shown while this step is on screen (see src/webgl/chapters.ts). */
  scene?: SceneId;
  /**
   * Optional logo (path under /public) built from cubes for this step,
   * in place of the scene's shape. Falls back to the shape if it can't load.
   */
  logo?: string;
}

export interface About {
  name: string;
  role: string;
  /** One-line statement shown big in the hero. */
  headline: string;
  intro: string;
  timeline: Milestone[];
  /** Short phrases for what motivates you. */
  drives: string[];
}
