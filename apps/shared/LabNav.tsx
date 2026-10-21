// Navegación común del Laboratorio de Trama. Cada experimento es una página propia.
export type LabPage = 'temas' | 'deshacer' | 'confianza';
const PAGES: { id: LabPage; label: string; href: string }[] = [
  { id: 'temas', label: 'Generador de temas', href: '../temas/' },
  { id: 'deshacer', label: 'Deshacer o confirmar', href: '../deshacer/' },
  { id: 'confianza', label: 'Confianza de la IA', href: '../confianza/' },
];

export function LabNav({ current }: { current: LabPage }) {
  return (
    <nav className="labnav" aria-label="Experimentos del Laboratorio">
      <a href="../../" className="labnav__home">Laboratorio</a>
      <ul>
        {PAGES.map((p) => (
          <li key={p.id}>
            <a href={p.href} aria-current={p.id === current ? 'page' : undefined}>{p.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
