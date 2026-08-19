const shimmer = `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="1080" fill="#e5e7eb"/>
</svg>
`;

export const DEFAULT_BLUR = `data:image/svg+xml;base64,${Buffer.from(shimmer).toString("base64")}`;