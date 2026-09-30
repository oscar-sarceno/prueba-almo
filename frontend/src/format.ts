const formatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' });

export const formatearFecha = (iso: string) => formatter.format(new Date(iso));
