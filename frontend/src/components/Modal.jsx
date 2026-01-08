
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md sm:p-6 animate-fade-in transition-all duration-300">
      <div className="bg-bg-primary dark:bg-[#080808] w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto shadow-2xl border-none sm:border border-grey-light/20 animate-slide-up rounded-none sm:rounded-sm transition-colors duration-300 relative flex flex-col">
        <div className="flex justify-between items-center px-6 sm:px-8 py-4 sm:py-6 border-b border-grey-light/10 sticky top-0 bg-bg-primary/95 dark:bg-[#111]/95 backdrop-blur z-10 transition-colors duration-300">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-pink-primary truncate">{title}</h3>
          <button
            onClick={onClose}
            className="text-grey-medium hover:text-text-primary transition-colors text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-grey-light/10"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="p-6 sm:p-8 text-text-primary">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
