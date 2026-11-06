import type { ReactNode } from 'react';
import logo from '../assets/Michael-Logotype-03.png';
import { OrbitRings, PixelField, PixelSteps } from '../components/geometry';
import '../styles/styleGuide.css';

const colours = [
  { name: 'Ink', token: '--ink', hex: '#0D0D12', use: 'Text, dark sections, the logo' },
  { name: 'Ink soft', token: '--ink-soft', hex: '#2A2A33', use: 'Cards on dark sections' },
  { name: 'Graphite', token: '--graphite', hex: '#6B6B78', use: 'Secondary text, captions' },
  { name: 'Mist', token: '--mist', hex: '#D9D8DE', use: 'Borders and dividers' },
  { name: 'Paper', token: '--paper', hex: '#F6F5F1', use: 'Page background' },
  { name: 'Accent', token: '--accent', hex: '#4B3BFF', use: 'Links, highlights, one per view' },
  { name: 'Accent soft', token: '--accent-soft', hex: '#E6E3FF', use: 'Tags, hover fills' },
  { name: 'Accent glow', token: '--accent-glow', hex: '#8F85FF', use: 'Accent on dark sections' },
];

const typeScale = [
  { token: '--text-3xl', label: 'Display', sample: 'Building things that think' },
  { token: '--text-2xl', label: 'Heading 1', sample: 'Selected projects' },
  { token: '--text-xl', label: 'Heading 2', sample: 'From Portsmouth to Invertase' },
  { token: '--text-lg', label: 'Lead', sample: 'A short intro paragraph that sets the scene.' },
  { token: '--text-base', label: 'Body', sample: 'Regular reading text for project write-ups and story sections.' },
  { token: '--text-sm', label: 'Small', sample: 'Captions, metadata and supporting detail.' },
];

const spacing = ['--space-2', '--space-4', '--space-8', '--space-12', '--space-16', '--space-24'];

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section className="sg-section" aria-labelledby={id}>
      <header className="sg-sectionHeader">
        <span className="sg-eyebrow">{title}</span>
        <h2 id={id}>{intro}</h2>
      </header>
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <div className="sg">
      <div className="sg-hero">
        <PixelField className="sg-heroField" columns={40} rows={18} />
        <div className="sg-heroContent">
          <img src={logo} alt="Michael Verdon" className="sg-heroLogo" />
          <p className="sg-eyebrow sg-eyebrow--dark">Design direction · draft</p>
          <h1>
            Software engineer building <span className="sg-accentText">AI</span> and{' '}
            <span className="sg-accentText">creative tech</span>.
          </h1>
          <p className="sg-lead">
            A sample hero showing the direction: ink and paper from the logo, one electric accent,
            and quiet geometry in the background.
          </p>
          <div className="sg-actions">
            <a className="sg-button sg-button--primary" href="#colour">
              See the system
            </a>
            <a className="sg-button sg-button--ghostDark" href="#visuals">
              Geometric visuals
            </a>
          </div>
        </div>
      </div>

      <div className="sg-body">
        <Section id="logo" title="Logo" intro="The logo stays as the anchor of the brand">
          <p className="sg-note">
            Its stepped mark of rounded squares is the motif everything else borrows from. On dark
            areas the logo is inverted to white.
          </p>
          <div className="sg-logoRow">
            <div className="sg-logoTile">
              <img src={logo} alt="Logo on paper" />
            </div>
            <div className="sg-logoTile sg-logoTile--dark">
              <img src={logo} alt="Logo on ink" className="sg-invert" />
            </div>
          </div>
        </Section>

        <Section id="colour" title="Colour" intro="Monochrome with a single electric accent">
          <div className="sg-swatches">
            {colours.map((c) => (
              <figure key={c.token} className="sg-swatch">
                <div className="sg-swatchChip" style={{ background: `var(${c.token})` }} />
                <figcaption>
                  <strong>{c.name}</strong>
                  <code>
                    {c.hex} · {c.token}
                  </code>
                  <span>{c.use}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section id="type" title="Typography" intro="Space Grotesk for headings, Inter for reading">
          <p className="sg-note">
            Space Grotesk's geometric shapes sit well beside the logotype. Inter keeps long text easy
            to read, and JetBrains Mono adds a technical touch for labels and code.
          </p>
          <div className="sg-typeScale">
            {typeScale.map((t, i) => (
              <div key={t.token} className="sg-typeRow">
                <code className="sg-typeLabel">
                  {t.label} · {t.token}
                </code>
                <p
                  className={i < 3 ? 'sg-display' : undefined}
                  style={{ fontSize: `var(${t.token})` }}
                >
                  {t.sample}
                </p>
              </div>
            ))}
            <div className="sg-typeRow">
              <code className="sg-typeLabel">Mono · labels</code>
              <p className="sg-mono">TypeScript · React · PyTorch · Flutter</p>
            </div>
          </div>
        </Section>

        <Section id="space" title="Space and shape" intro="A 4px grid and small, pixel-like corners">
          <div className="sg-spacing">
            {spacing.map((s) => (
              <div key={s} className="sg-spaceRow">
                <code>{s}</code>
                <div className="sg-spaceBar" style={{ width: `var(${s})` }} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="components" title="Components" intro="Buttons, tags and project cards">
          <div className="sg-actions">
            <button type="button" className="sg-button sg-button--primary">
              View project
            </button>
            <button type="button" className="sg-button sg-button--ghost">
              Source on GitHub
            </button>
            <a className="sg-link" href="#components">
              Inline link →
            </a>
          </div>
          <div className="sg-tags">
            {['TypeScript', 'React', 'Flutter', 'PyTorch', 'Firebase'].map((tag) => (
              <span key={tag} className="sg-tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="sg-cards">
            <article className="sg-card">
              <div className="sg-cardVisual">
                <PixelSteps steps={5} size={18} />
              </div>
              <div className="sg-cardBody">
                <span className="sg-mono sg-cardMeta">2024 · Open source</span>
                <h3>React Native Firebase</h3>
                <p>Contributing to the library thousands of apps use to talk to Firebase.</p>
              </div>
            </article>
            <article className="sg-card sg-card--dark">
              <div className="sg-cardVisual">
                <OrbitRings size={140} />
              </div>
              <div className="sg-cardBody">
                <span className="sg-mono sg-cardMeta">2023 · Machine learning</span>
                <h3>Sentiment analysis</h3>
                <p>Fuzzy logic and SentiWordNet compared against learned models on real reviews.</p>
              </div>
            </article>
          </div>
        </Section>

        <Section id="visuals" title="Geometric visuals" intro="Abstract shapes drawn from the logo">
          <p className="sg-note">
            All three are lightweight SVG with no libraries, move gently, and stay still for anyone
            who has reduced motion turned on.
          </p>
          <div className="sg-visuals">
            <figure className="sg-visual">
              <div className="sg-visualStage">
                <PixelSteps />
              </div>
              <figcaption>
                <strong>Pixel steps</strong>
                <span>The logo's staircase, building up square by square. For section openers.</span>
              </figcaption>
            </figure>
            <figure className="sg-visual">
              <div className="sg-visualStage sg-visualStage--dark">
                <PixelField columns={16} rows={10} density={0.12} seed={3} />
              </div>
              <figcaption>
                <strong>Pixel field</strong>
                <span>A quiet grid where a few squares glow. For hero and footer backgrounds.</span>
              </figcaption>
            </figure>
            <figure className="sg-visual">
              <div className="sg-visualStage">
                <OrbitRings size={200} />
              </div>
              <figcaption>
                <strong>Orbit rings</strong>
                <span>Slowly turning arcs, a nod to AI and systems. For the skills section.</span>
              </figcaption>
            </figure>
          </div>
        </Section>
      </div>
    </div>
  );
}
