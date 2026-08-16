import type { Diagnostico } from './schema';
import { crearTokenPeticion } from './peticion';

export function crearMensajeEnlacePeticion(
  diagnostico: Diagnostico | undefined,
  municipio: string,
  barrio: string,
  baseUrl: string,
  secreto = process.env.PETICION_LINK_SECRET,
) {
  if (!diagnostico?.compuerta || !secreto) return null;
  try {
    const token = crearTokenPeticion({
      municipio,
      barrio,
      compuerta: diagnostico.compuerta,
      hechos: diagnostico.hechos,
    }, secreto);
    const url = new URL(`/api/peticion/${token}`, baseUrl).toString();
    return `Borrador de derecho de petición (enlace privado, válido 15 minutos): ${url} Contados no lo radica por usted.`;
  } catch {
    return null;
  }
}
