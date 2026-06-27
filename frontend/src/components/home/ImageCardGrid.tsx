export type ImageCardItem = {
  title: string;
  text?: string;
  meta?: string;
  imageClass: string;
};

type ImageCardGridProps = {
  items: ImageCardItem[];
  columns?: "three" | "four" | "five";
  imageKind: "service" | "team" | "post";
};

export function ImageCardGrid({ items, columns = "three", imageKind }: ImageCardGridProps) {
  const gridCols = {
    three: "md:grid-cols-3",
    four: "md:grid-cols-4",
    five: "md:grid-cols-5",
  }[columns];
  const imageClass = {
    service: "hm-service-photo",
    team: "hm-team-photo",
    post: "hm-post-photo",
  }[imageKind];

  return (
    <div className={`mx-auto mt-16 grid max-w-[1220px] gap-8 ${gridCols}`}>
      {items.map(({ title, text, meta, imageClass: itemImageClass }) => (
        <article key={title} className="min-w-0">
          <div className={`${imageClass} ${itemImageClass}`} />
          {meta ? <p className="mt-5 text-sm font-black text-stone-950">{meta}</p> : null}
          <h3 className="hm-heading mt-7 text-3xl font-semibold leading-tight text-[var(--ink)]">{title}</h3>
          {text ? <p className="mt-5 text-lg font-semibold leading-8 text-[var(--tan)]">{text}</p> : null}
        </article>
      ))}
    </div>
  );
}
