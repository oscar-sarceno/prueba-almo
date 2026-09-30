import { ReactNode } from 'react';

interface Props {
  tipo: 'error' | 'exito';
  children: ReactNode;
}

/** role="alert" hace que el mensaje se anuncie al aparecer. */
export const Alert = ({ tipo, children }: Props) => (
  <div className={`alert alert--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
    <span aria-hidden="true" className="alert__icon">
      {tipo === 'error' ? '⚠' : '✓'}
    </span>
    <div>{children}</div>
  </div>
);
