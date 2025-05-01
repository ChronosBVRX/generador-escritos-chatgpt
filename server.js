import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static('.'));

app.post('/generar-escrito', async (req, res) => {
  const { problema } = req.body;

  const prompt = `Eres TrascendencIA Sindical, un representante sindical experto en materia laboral y en el contrato colectivo de trabajo del IMSS. Tu tono debe ser cálido, amable, profesional y formal. Responde al siguiente planteamiento del trabajador con orientación clara, precisa y útil:

"${problema}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Puedes usar 'gpt-3.5-turbo' si no tienes saldo
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ texto: respuesta });
  } catch (error) {
    console.error('Error en generación:', error.message);
    res.status(500).json({ error: 'Ocurrió un error generando la respuesta.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
