import clsx from "clsx";

type ModalProps = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div
        className={clsx(
          "w-full max-w-md rounded-2xl border p-4 shadow-2xl",
          "bg-white/95 border-slate-200/80 text-slate-900 dark:bg-slate-900 dark:border-white/15 dark:text-slate-50",
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            {title && <h3 className="text-base font-semibold">{title}</h3>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200/70 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-white/20 dark:text-slate-100 dark:hover:border-slate-200"
          >
            Cerrar
          </button>
        </div>
        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );
}
