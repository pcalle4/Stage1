type FileUploaderProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

const FileUploader: React.FC<FileUploaderProps> = ({ file, onFileChange }) => {
  return (
    <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300/80 bg-white/80 px-4 py-3 text-xs md:text-sm text-slate-800 transition hover:border-sky-400/70 hover:bg-white dark:border-slate-600/60 dark:bg-white/5 dark:text-slate-100">
      <span className="font-semibold text-slate-900 dark:text-slate-50">Seleccionar archivo</span>
      <span className="text-[11px] text-slate-500 dark:text-slate-300">
        {file ? `${file.name} (${formatSize(file.size)})` : "Ningún archivo seleccionado"}
      </span>
      <input
        type="file"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
};

export default FileUploader;
