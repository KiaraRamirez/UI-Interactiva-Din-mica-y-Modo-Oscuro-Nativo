
## Estructura del proyecto

```
ml-app/
├── index.html   — Estructura HTML de la aplicación
├── style.css    — Estilos con CSS Variables y modo oscuro
├── app.js       — Lógica JS: inferencia, semáforo y dark mode
└── README.md    — Este archivo
```## Funcionalidades implementadas

### Semáforo de Confianza
Los estilos CSS se modifican dinámicamente desde JavaScript según el nivel de confianza:
- 🟢 **Verde** (`--color-high`) → confianza ≥ 90%
- 🟡 **Amarillo** (`--color-mid`) → confianza entre 50% y 89%
- 🔴 **Rojo** (`--color-low`) → confianza < 50%
Prefuntas a responder
¿Qué opción eligieron?
porque el diseño cyberpunk tiene un tema oscuro fijo. Mantener el botón sin funcionalidad sería inconsistente con la interfaz.
¿Cuáles fueron las funciones o selectores principales que crearon en JavaScript para resolver este reto?
Para el semáforo de confianza:// Función que evalúa el nivel según probabilidad
function getConfidenceClass(probability) {
  const pct = probability * 100;
  if (pct >= 90) return 'high';
  if (pct >= 50) return 'mid';
  return 'low';
}

// Selector que aplica la clase al row del DOM
row.classList.remove('confidence-high', 'confidence-mid', 'confidence-low');
row.classList.add(`confidence-${level}`);

Para el modo oscuro (mientras estuvo implementado):
javascript// Función del toggle — manipula clase en body
darkToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
});

// Selector CSS que activaba el tema
// body.dark { --bg-primary: #0f0f0e; ... }
