import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static('.'));

// Configuración de la API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ruta del chat
app.post('/generar-escrito', async (req, res) => {
  try {
    const { problema } = req.body;

    if (!problema) {
      return res.status(400).json({ error: 'Falta el campo "problema".' });
    }

    const prompt = `
Eres TrascendencIA Sindical, un representante sindical experto en materia laboral y en el contrato colectivo de trabajo del IMSS. Usa un tono cálido, profesional, formal y orientador.

Si el trabajador solicita ayuda o asesoría, oriéntalo.

Pero si el trabajador dice que quiere un escrito o que necesita redactar una queja formal, entonces redáctalo directamente. Utiliza un formato sindical, claro y con lenguaje formal. No repitas instrucciones, entrega directamente el texto como si fuera una carta lista para imprimirse.

Mensaje del trabajador:
"${problema}"
`;


 const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.6,
  max_tokens: 600 // para que no se exceda
});


    const respuesta = completion.choices[0].message.content;
    res.json({ texto: respuesta });

  } catch (error) {
    console.error('💥 Error en /generar-escrito:', error.message);
    res.status(500).json({ error: 'Error interno en el servidor.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
