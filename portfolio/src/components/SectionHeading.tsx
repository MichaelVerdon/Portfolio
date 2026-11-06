interface SectionHeadingProps {
  id: string;
  /** Two-digit chapter number, e.g. "01". */
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
}

export default function SectionHeading({ id, index, eyebrow, title, intro }: SectionHeadingProps) {
  return (
    <header className="sectionHeading">
      <span className="eyebrow">
        <span className="eyebrow-index">{index}</span> {eyebrow}
      </span>
      <h2 id={id}>{title}</h2>
      {intro && <p className="sectionIntro">{intro}</p>}
    </header>
  );
}
