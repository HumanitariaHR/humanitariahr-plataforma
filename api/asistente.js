// Función serverless para Vercel. La API key nunca queda expuesta al navegador.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { baseTexto, consulta } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: `Sos el Asistente Laboral de HumanitariaHR, especializado en legislación laboral argentina. Respondé SOLO en base a la siguiente base legal cargada por la empresa. Si la consulta no está cubierta por esta base, decilo explícitamente y no inventes.\n\nBASE LEGAL:\n${baseTexto}\n\n${consulta}\n\nRespondé de forma clara, citando artículo si está en la base, y agregá al final una línea "Fuente:" indicando qué norma usaste o si no hay fuente disponible.`
        }]
      })
    });

    const data = await response.json();

    if (!data.content) {
      console.error("Respuesta de Anthropic sin contenido:", JSON.stringify(data));
      return res.status(200).json({ texto: "Error de la IA: " + (data.error ? data.error.message : JSON.stringify(data)) });
    }

    const texto = data.content.map(c => c.text || "").join("\n");

    return res.status(200).json({ texto });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
