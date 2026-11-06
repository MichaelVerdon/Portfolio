import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contacts, projects, skillGroups } from '.';

const publicDir = resolve(process.cwd(), 'public');

/** Maps an image path from the JSON (e.g. "../projects/x.png") to a file in /public. */
function publicFile(src: string) {
  return resolve(publicDir, src.replace(/^(\.\.\/|\/)+/, ''));
}

function expectImageExists(src: string) {
  if (src === 'N/A') return;
  expect(existsSync(publicFile(src)), `missing image public/${src}`).toBe(true);
}

function expectUnique(names: string[]) {
  expect(new Set(names).size, `duplicate names: ${names.join(', ')}`).toBe(names.length);
}

describe('projects.json', () => {
  it('has at least one project', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it.each(projects.map((p) => [p.name, p] as const))('%s is complete', (_, project) => {
    expect(project.name.trim()).not.toBe('');
    expect(project.desc.trim()).not.toBe('');
    expect(project.tech.trim()).not.toBe('');
    // A link is a full https URL, or a path on this site (e.g. "/" for no public repo).
    expect(project.link).toMatch(/^(https:\/\/|\/)/);
    expectImageExists(project.src);
  });

  it('has unique project names', () => {
    expectUnique(projects.map((p) => p.name));
  });
});

describe('skills JSON files', () => {
  it.each(skillGroups.map((g) => [g.title, g] as const))('%s is valid', (_, group) => {
    expect(group.skills.length).toBeGreaterThan(0);
    for (const skill of group.skills) {
      expect(skill.name.trim()).not.toBe('');
      expectImageExists(skill.src);
    }
    expectUnique(group.skills.map((s) => s.name));
  });
});

describe('contact.json', () => {
  it.each(contacts.map((c) => [c.name, c] as const))('%s is valid', (_, contact) => {
    expect(contact.link).toMatch(/^(https:\/\/|mailto:)/);
    expectImageExists(contact.img);
  });
});
