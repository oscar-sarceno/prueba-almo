import { RefObject, useEffect } from 'react';

const esCampo = (el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;

/**
 * Sincroniza aria-invalid con el estado visual :user-invalid, de modo que los lectores de pantalla
 * reciban el error solo después de que la persona interactuó con el campo.
 */
export const useUserInvalidAria = (formRef: RefObject<HTMLFormElement | null>) => {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const sync = (event: Event) => {
      const el = event.target;
      if (!esCampo(el)) return;
      if (event.type === 'input' && !el.hasAttribute('aria-invalid')) return;
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    };

    // blur/invalid no burbujean: se escuchan en fase de captura.
    form.addEventListener('blur', sync, true);
    form.addEventListener('invalid', sync, true);
    form.addEventListener('input', sync);
    form.addEventListener('change', sync);
    return () => {
      form.removeEventListener('blur', sync, true);
      form.removeEventListener('invalid', sync, true);
      form.removeEventListener('input', sync);
      form.removeEventListener('change', sync);
    };
  }, [formRef]);
};
