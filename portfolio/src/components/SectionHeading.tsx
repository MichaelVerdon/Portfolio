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
      <span className="eyebrow" data-reveal>
        <span className="eyebrow-index">{index}</span> {eyebrow}
      </span>
      <h2 id={id} data-split data-underline>
        {title}
      </h2>
      {intro && (
        <p className="sectionIntro" data-reveal data-reveal-delay="0.2">
          {intro}
        </p>
      )}
    </header>
  );
}
