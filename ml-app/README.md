
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
