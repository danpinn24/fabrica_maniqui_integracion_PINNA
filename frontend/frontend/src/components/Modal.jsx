function Modal({
  open,
  title,
  message,
  onClose,
  onAccept,
  confirm = false
}) {
  if (!open) return null;

  return (
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
}

export default Modal;