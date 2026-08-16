import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El indicador de desarrollo se superpone sobre la esquina inferior izquierda
  // y aparecería en la grabación de la demo. Apagarlo no oculta errores de
  // compilación ni de ejecución, que Next.js sigue mostrando.
  devIndicators: false,
};

export default nextConfig;
