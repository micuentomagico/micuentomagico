import { UserPreferences, Story } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export async function generateStory(prefs: UserPreferences): Promise<Story> {
  console.log("👉 generateStory LLAMADO con:", prefs);

  const prompt = `Actúa como un autor profesional de cuentos infantiles con experiencia en psicología infantil y narrativa literaria.
Escribes historias cálidas, reconfortantes y fáciles de leer en voz alta antes de dormir.
Tu objetivo es que el niño se sienta protagonista, pero con una narrativa fluida y literaria.

Detalles del protagonista:
- Nombre: ${prefs.name} (Edad: ${prefs.age} años).
- Intereses: ${prefs.interests.join(", ")}.
- Tipo de historia: ${prefs.storyType}.
- Idioma: ${prefs.language}.

Estructura narrativa:
1. Introducción breve y cálida.
2. Inicio de una aventura relacionada con sus intereses.
3. Aparición de un pequeño reto o curiosidad (sin miedo).
4. Resolución mediante valentía, imaginación o amabilidad.
5. Final feliz, soñoliento y reconfortante.

Reglas:
- Mínimo 45 párrafos cortos
- Máximo 60 párrafos
- Máximo 3 líneas por párrafo
- Tono positivo y relajante

Formato:
Primera línea: Título del cuento
Resto: párrafos separados por salto de línea.
`;

  const response = await fetch(`${API_URL}/generate-story`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ prompt })
});


  if (!response.ok) {
    throw new Error("Error llamando al backend");
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    console.error("Respuesta inválida del backend:", data);
    throw new Error("Texto vacío devuelto por la IA");
  }

  const lines = text.split("\n").filter(l => l.trim());

  const title = lines[0]
    .replace(/[*#"_`]/g, "")
    .trim();

  const paragraphs = lines.slice(1);

  // 📘 Configuración del libro
  const PARAGRAPHS_PER_PAGE = 3;
  const MAX_PAGES = 20;

  const pages: string[][] = [];
  for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_PAGE) {
    pages.push(paragraphs.slice(i, i + PARAGRAPHS_PER_PAGE));
  }

  const finalPages = pages.slice(0, MAX_PAGES);

  return {
    id: crypto.randomUUID(),
    title,
    pages: finalPages,
    fullText: text,
    createdAt: Date.now()
  };
}
