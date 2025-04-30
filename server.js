import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static('.'));

app.post('/generar-escrito', async (req, res) => {
  const { nombre, cargo, destinatario, problema, peticion } = req.body;

  const prompt = `Redacta un escrito formal con los siguientes datos:
Nombre: ${nombre}
Cargo: ${cargo}
Dirigido a: ${destinatario}
Problema: ${problema}
Petición: ${peticion}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ texto: respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el texto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
