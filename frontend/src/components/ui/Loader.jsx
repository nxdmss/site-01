/**
 * ═══════════════════════════════════════════════════════════════
 * LOADER COMPONENT
 * Индикатор загрузки
 * ═══════════════════════════════════════════════════════════════
 */

export default function Loader({ text = 'Загрузка...' }) {
  return (
    <h2 style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
      {text}
    </h2>
  );
}
