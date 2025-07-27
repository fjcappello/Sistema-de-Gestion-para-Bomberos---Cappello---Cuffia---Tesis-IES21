import ReactDOM from "react-dom";

// Funcion para mostrar contenido adicional en una capa superpuesta
function Modal({ children }) {
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
}

export default Modal;
