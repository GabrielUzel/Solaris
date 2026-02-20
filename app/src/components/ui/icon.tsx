interface IconProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function Icon(props: IconProps) {
  const { src, alt, width, height } = props;

  return <img src={src} alt={alt} width={width} height={height} />;
}
