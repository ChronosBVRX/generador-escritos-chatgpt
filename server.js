import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createServer } from 'http'; // NUEVO: Necesario para usar Socket.io con Express
import { Server } from 'socket.io'; // NUEVO: Importamos Socket.io

dotenv.config();
const app = express();

// NUEVO: Creamos el servidor HTTP y lo conectamos a Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static('.'));

// Configuración de la API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ruta del chat (INTACTA - Tu IA seguirá funcionando perfecto)
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

// === NUEVA LÓGICA DEL KIOSKO (PUENTE EN TIEMPO REAL) ===
io.on('connection', (socket) => {
  console.log('📱 Un dispositivo se conectó al Kiosko:', socket.id);

  // 1. El Kiosko crea una sala de espera con su código QR
  socket.on('crear-sesion', (idSesion) => {
    socket.join(idSesion);
    console.log(`📡 Kiosko esperando documentos en la sala: ${idSesion}`);
  });

  // 2. El Celular envía el documento procesado a esa sala específica
  socket.on('enviar-documento', (data) => {
    // data trae la sesión y la imagen en base64
    io.to(data.sesion).emit('documento-recibido', data.archivo);
    console.log(`✅ Documento transferido con éxito a la sala: ${data.sesion}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado');
  });
});
// ========================================================

const PORT = process.env.PORT || 3000;

// NUEVO: Cambiamos app.listen por httpServer.listen para que ambos (Express y Socket) escuchen el mismo puerto
httpServer.listen(PORT, () => {
  console.log(`✅ Servidor híbrido (IA + Kiosko) corriendo en el puerto ${PORT}`);
});
