/** Shapes of the JSON content files in src/data. */

export interface Project {
  name: string;
  /** Image path under /public, or "N/A" for a placeholder. */
  src: string;
  /** Link to the source code. */
  link: string;
  desc: string;
  tech: string;
}

export interface Skill {
  name: string;
  /** Icon path under /public, or "N/A" for a placeholder. */
  src: string;
}

export interface ContactLink {
  name: string;
  /** Icon path under /public, or "N/A" for a placeholder. */
  img: string;
  link: string;
}
