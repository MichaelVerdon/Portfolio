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
  imageFit?: 'cover' | 'contain';
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

export interface Milestone {
  /** Short label shown above the step, e.g. "Now". */
  label: string;
  title: string;
  place: string;
  text: string;
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
