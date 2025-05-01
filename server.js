import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static('.'));

// Ruta para recibir los mensajes
app.post('/generar-escrito', async (req, res) => {
  const { problema } = req.body;

  const prompt = `Eres TrascendencIA Sindical, un representante sindical experto en materia laboral y en el contrato colectivo de trabajo del IMSS. Responde con un lenguaje cálido, profesional, formal y orientador.

El trabajador plantea lo siguiente: "${problema}". Por favor, proporciona una orientación clara, útil y estructurada.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // o 'gpt-3.5-turbo' si tienes poco crédito
      messages: [{ role: 'user', content: prompt }]
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ texto: respuesta });
  } catch (error) {
    console.error("Error al generar respuesta:", error);
    res.status(500).json({ error: "Error al generar respuesta desde OpenAI." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
