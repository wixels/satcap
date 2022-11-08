const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const transparentize = (color: string, opacity: number) => {
  var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
};

export { randomColor, transparentize };
