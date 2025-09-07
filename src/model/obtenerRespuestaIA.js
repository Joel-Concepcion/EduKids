import axios from 'axios';

const obtenerRespuestaIA = async (mensajeUsuario) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: mensajeUsuario }],
      },
      {
        headers: {
          Authorization: `Bearer TU_API_KEY`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error al obtener respuesta de la IA:', error);
    return 'Lo siento, hubo un problema al conectar con la IA.';
  }
};
