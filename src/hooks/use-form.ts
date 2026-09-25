import { useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from 'react';
import { createForm, type FormOptions, type FormValues } from '@manthan/base';

/**
 * Form state + validation (Manthan's `createForm` store in React).
 *
 *   const form = useForm({ initialValues, rules, onSubmit });
 *   <form onSubmit={form.handleSubmit}>
 *     <Field label="Email" error={form.errors.email}><Input {...form.register('email')} /></Field>
 */
export function useForm<V extends FormValues>(options: FormOptions<V>) {
  const latest = useRef(options);
  latest.current = options;
  const [store] = useState(() =>
    createForm<V>({ ...options, onSubmit: (values) => latest.current.onSubmit?.(values) }),
  );
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const visibleErrors = Object.fromEntries(Object.keys({ ...state.values, ...options.rules }).map((k) => [k, store.visibleError(k as keyof V)])) as {
    [K in keyof V]?: string;
  };

  return {
    ...state,
    /** Errors that should be shown now (field visited or form submitted). */
    errors: visibleErrors,
    store,
    setValue: store.setValue,
    setValues: store.setValues,
    reset: store.reset,
    validate: store.validate,
    field: store.field,
    handleSubmit: (event?: FormEvent) => void store.submit(event),
    /** Props for text inputs, textareas and selects. */
    register<K extends keyof V>(name: K) {
      const error = store.visibleError(name);
      return {
        name: String(name),
        value: (state.values[name] ?? '') as string,
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => store.setValue(name, e.target.value as V[K]),
        onBlur: () => store.blur(name),
        'aria-invalid': error ? true : undefined,
      };
    },
    /** Props for Checkbox / Switch. */
    registerCheckbox<K extends keyof V>(name: K) {
      return {
        name: String(name),
        checked: !!state.values[name],
        onCheckedChange: (checked: boolean) => {
          store.setValue(name, checked as V[K]);
          store.blur(name);
        },
        'aria-invalid': store.visibleError(name) ? true : undefined,
      };
    },
  };
}
