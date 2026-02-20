interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export default function Card(props: CardProps) {
  const { children, hover, className } = props;

  const hoverEffect = hover
    ? "hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
    : "";

  return (
    <div
      className={`
        bg-card-background
        rounded-2xl
        border
        border-primary-border
        shadow-default
        ${className}
        ${hoverEffect}
      `}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
}

export function CardTitle(props: CardTitleProps) {
  const { children } = props;

  return <h3 className="text-xl font-bold">{children}</h3>;
}

interface CardDescriptionProps {
  children: React.ReactNode;
}

export function CardDescription(props: CardDescriptionProps) {
  const { children } = props;

  return <p className="text-inverted-text">{children}</p>;
}
