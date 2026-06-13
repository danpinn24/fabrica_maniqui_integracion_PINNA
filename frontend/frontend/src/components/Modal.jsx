import { createPortal } from 'react-dom';

function Modal({
  open,
  title,
  message,
  onClose,
  onAccept,
  confirm = false
}) {
  // Si no está abierto, no renderiza nada
  if (!open) return null;

  // Creamos el HTML del modal
  const contenidoModal = (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-buttons">
          {confirm && (
            <button onClick={onClose}>
              Cancelar
            </button>
          )}

          <button
            onClick={() => {
              if (onAccept) onAccept();
              onClose();
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );

  // createPortal inyecta este fragmento directamente al final del body
  return createPortal(contenidoModal, document.body);
}

export default Modal;