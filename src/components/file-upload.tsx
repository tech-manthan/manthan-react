import { useEffect, useRef, useState, type ReactNode } from 'react';
import { File as FileIcon, Upload, X } from '@manthan/icons';
import { closeButton, fileUpload, formatBytes, validateFiles, type FileRejection } from '@manthan/base';
import { createDropzone, setInputFiles } from '@manthan/base/dom';
import { useField } from './form';
import { Icon } from './icon';
import { useControllableState, useLatest } from '../utils';

export interface FileUploadProps {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onReject?: (rejections: FileRejection<File>[]) => void;
  /** Same syntax as `<input accept>`, e.g. `".pdf,image/*"`. */
  accept?: string;
  multiple?: boolean;
  /** Bytes. */
  maxSize?: number;
  maxFiles?: number;
  /** Posts the files with the surrounding form. */
  name?: string;
  label?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function FileUpload({
  value,
  defaultValue = [],
  onValueChange,
  onReject,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  name,
  label = 'Drop files here, or click to browse',
  hint,
  disabled,
  size,
  className,
}: FileUploadProps) {
  const field = useField();
  const [files, setFiles] = useControllableState(value, defaultValue, onValueChange);
  const [errors, setErrors] = useState<string[]>([]);
  const zone = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const s = fileUpload({ size });
  const add = useLatest((incoming: File[]) => {
    const { accepted, rejected } = validateFiles(incoming, { accept, maxSize, maxFiles: multiple ? maxFiles : 1, existing: multiple ? files.length : 0 });
    setErrors(rejected.map((r) => r.message));
    if (rejected.length) onReject?.(rejected);
    if (accepted.length) setFiles(multiple ? [...files, ...accepted] : accepted);
  });
  useEffect(() => createDropzone({ zone: zone.current!, input: input.current!, onFiles: (f) => add.current(f) }), [add]);
  useEffect(() => setInputFiles(input.current!, files), [files]);
  const invalid = errors.length > 0 || !!field?.invalid;

  return (
    <div className={s.root(className)}>
      <div
        ref={zone}
        id={field?.id}
        aria-label={typeof label === 'string' ? label : undefined}
        aria-describedby={field?.describedBy}
        aria-disabled={disabled || field?.disabled || undefined}
        aria-invalid={invalid || undefined}
        className={s.dropzone()}
      >
        <span className={s.icon()}>
          <Icon icon={Upload} />
        </span>
        <p className={s.title()}>{label}</p>
        {hint && <p className={s.hint()}>{hint}</p>}
      </div>
      <input ref={input} type="file" className="sr-only" tabIndex={-1} aria-hidden name={name} accept={accept} multiple={multiple} disabled={disabled} />
      {errors.length > 0 && (
        <div role="alert" className={s.errors()}>
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <ul className={s.list()}>
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className={s.item()}>
              <span className={s.itemIcon()}>
                <Icon icon={FileIcon} />
              </span>
              <div className={s.itemBody()}>
                <span className={s.itemName()}>{file.name}</span>
                <span className={s.itemMeta()}>{formatBytes(file.size)}</span>
              </div>
              <button type="button" aria-label={`Remove ${file.name}`} className={closeButton()} onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                <Icon icon={X} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
