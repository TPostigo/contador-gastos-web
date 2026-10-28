import { useState } from 'react';
import * as api from './api';

// Cada mensaje de la conversación: lo escribe el usuario o el asistente
interface Mensaje {
  autor: 'usuario' | 'asistente';
  texto: string;
  esError?: boolean;
}

function AsistenteChat() {
  const [pregunta, setPregunta] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [pensando, setPensando] = useState(false);

  const enviarTexto = async (texto: string) => {
    if (!texto || pensando) return;

    setMensajes((previos) => [...previos, { autor: 'usuario', texto }]);
    setPregunta('');
    setPensando(true);

    try {
      const respuesta = await api.preguntarAsistente(texto);
      setMensajes((previos) => [...previos, { autor: 'asistente', texto: respuesta }]);
    } catch (err) {
      setMensajes((previos) => [
        ...previos,
        {
          autor: 'asistente',
          texto: err instanceof Error ? err.message : 'No se pudo obtener respuesta',
          esError: true,
        },
      ]);
    } finally {
      setPensando(false);
    }
  };

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    enviarTexto(pregunta.trim());
  };

  // Solo tres ejemplos, para que el chat vacío no se llene de botones
  const ejemplos = [
    '¿Cuánto gasté en comida?',
    '¿En qué categoría gasto más?',
    '¿Cuál es mi mayor gasto?',
  ];

  return (
    <section className="seccion seccion-asistente">
      <h2 className="seccion-titulo">
        Asistente <span className="badge-ia">IA</span>
      </h2>

      <div className="chat">
        {mensajes.length === 0 && (
          <div className="chat-vacio">
            <p>Pregunta por tus gastos:</p>
            <div className="chat-ejemplos">
              {ejemplos.map((texto) => (
                <button
                  key={texto}
                  type="button"
                  className="chat-ejemplo"
                  onClick={() => enviarTexto(texto)}
                  disabled={pensando}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((mensaje, indice) => (
          <div
            key={indice}
            className={`chat-mensaje chat-${mensaje.autor}${mensaje.esError ? ' chat-error' : ''}`}
          >
            {mensaje.texto}
          </div>
        ))}

        {pensando && (
          <div className="chat-mensaje chat-asistente chat-pensando">Pensando…</div>
        )}
      </div>

      <form className="chat-form" onSubmit={enviar}>
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Escribe tu pregunta"
          maxLength={500}
          aria-label="Pregunta para el asistente"
        />
        <button type="submit" disabled={pensando || !pregunta.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}

export default AsistenteChat;