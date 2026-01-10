/**
 * ═══════════════════════════════════════════════════════════════
 * FLY ANIMATION COMPONENT
 * Анимация добавления товара в корзину
 * ═══════════════════════════════════════════════════════════════
 */

export default function FlyAnimation({ show, imageSrc }) {
  if (!show) return null;

  return (
    <div className="animation-overlay">
      <img src={imageSrc} className="fly-image" alt="animation" />
    </div>
  );
}
