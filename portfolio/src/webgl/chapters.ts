/**
 * The 3D story's chapters. Each one is a formation the cubes fly into, and
 * a layout saying where it sits on screen. This file has no three.js in it,
 * so sections can name chapters without pulling the 3D code into the first
 * load.
 */

export type SceneId = 'logo' | 'sphere' | 'steps' | 'network' | 'monolith' | 'field' | 'toolkit';

export interface ChapterLayout {
  /** Horizontal centre, as a fraction of half the visible width (-1 left edge, 1 right edge). */
  x: number;
  /** Vertical centre, as a fraction of half the visible height. */
  y: number;
  /** Push back (negative) or pull forward, in world units. */
  z: number;
  scale: number;
  /** Brightness, 0 to 1. Lower behind dense text. */
  dim: number;
  /** Slowly turn on the spot. Off for the logo, which faces the camera. */
  spin: boolean;
  /** 0 solid, 1 glassy (see-through cubes). */
  glass?: number;
}

export interface Chapter {
  id: SceneId;
  /** Shown as a small technical caption next to the scene. */
  label: string;
  wide: ChapterLayout;
  /** Phones and narrow windows: centred, dimmer, behind the text. */
  narrow: ChapterLayout;
}

export const CHAPTERS: Record<SceneId, Chapter> = {
  logo: {
    id: 'logo',
    label: 'Mark / 7 × 3 grid',
    wide: { x: 0.56, y: 0.04, z: 0, scale: 0.8, dim: 1, spin: false },
    narrow: { x: 0, y: 0.56, z: -6, scale: 0.75, dim: 0.9, spin: false },
  },
  sphere: {
    id: 'sphere',
    label: 'Fig. 01 / Neural sphere',
    wide: { x: 0.5, y: -0.06, z: 0, scale: 0.85, dim: 1, spin: true },
    narrow: { x: 0, y: 0, z: -24, scale: 1, dim: 0.2, spin: true },
  },
  steps: {
    id: 'steps',
    label: 'Fig. 02 / Iteration steps',
    wide: { x: 0.5, y: -0.1, z: 0, scale: 0.8, dim: 1, spin: true },
    narrow: { x: 0, y: 0, z: -24, scale: 1, dim: 0.2, spin: true },
  },
  network: {
    id: 'network',
    label: 'Fig. 03 / Open-source network',
    wide: { x: 0.5, y: -0.06, z: 0, scale: 0.85, dim: 1, spin: true },
    narrow: { x: 0, y: 0, z: -24, scale: 1, dim: 0.2, spin: true },
  },
  monolith: {
    id: 'monolith',
    label: 'Fig. 04 / Systems at scale',
    wide: { x: 0.5, y: -0.06, z: 0, scale: 0.85, dim: 1, spin: true },
    narrow: { x: 0, y: 0, z: -24, scale: 1, dim: 0.2, spin: true },
  },
  field: {
    id: 'field',
    label: 'Index / Data towers',
    wide: {
      x: 0,
      y: -0.2,
      z: -44,
      scale: 1.15,
      dim: 0.6,
      spin: false,
      glass: 1,
    },
    narrow: {
      x: 0,
      y: -0.5,
      z: -40,
      scale: 1,
      dim: 0.4,
      spin: false,
      glass: 1,
    },
  },
  toolkit: {
    id: 'toolkit',
    label: 'Fig. 05 / Toolkit',
    wide: { x: 0.55, y: 0.3, z: -8, scale: 1.05, dim: 1, spin: true },
    narrow: { x: 0, y: 0, z: -20, scale: 1, dim: 0.3, spin: true },
  },
};

export const SCENE_IDS = Object.keys(CHAPTERS) as SceneId[];

export function isSceneId(value: unknown): value is SceneId {
  return typeof value === 'string' && value in CHAPTERS;
}
