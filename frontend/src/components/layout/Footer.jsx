/**
 * ═══════════════════════════════════════════════════════════════
 * FOOTER COMPONENT
 * Подвал сайта
 * ═══════════════════════════════════════════════════════════════
 */

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer>
      Site-01 © {year}
    </footer>
  );
}
