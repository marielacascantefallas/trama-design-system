import { useEffect, useRef } from 'react';

/** Foco atrapado, Esc para cerrar y foco de vuelta al botón que abrió el diálogo. */
export function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const back = useRef<Element | null>(document.activeElement);
  useEffect(() => {
    const el = ref.current!;
    (
      el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>('button, input, textarea')
    )?.focus();
    const ret = back.current as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const f = [
        ...el.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not([type=radio]), input[type=radio]:checked, textarea, [href]',
        ),
      ];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      ret?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}
