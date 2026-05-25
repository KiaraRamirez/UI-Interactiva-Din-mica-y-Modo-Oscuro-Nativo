# ML Vision — Clasificador en Tiempo Real
## Exportación e Integración de Modelos de Machine Learning en la Web

---

## Estructura del proyecto

```
ml-app/
├── index.html   — Estructura HTML de la aplicación
├── style.css    — Estilos con CSS Variables y modo oscuro
├── app.js       — Lógica JS: inferencia, semáforo y dark mode
└── README.md    — Este archivo
```

---

## Cómo abrirlo en VS Code

### Opción A — Live Server (recomendado)
1. Abre la carpeta `ml-app/` en VS Code
2. Instala la extensión **Live Server** (ritwickdey.LiveServer)
3. Clic derecho en `index.html` → **Open with Live Server**
4. Se abre en `http://127.0.0.1:5500`

### Opción B — Servidor Python (sin instalar nada extra)
Si tienes Python instalado, desde la terminal:
```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```
Luego abre `http://localhost:5500` en el navegador.

> ⚠️ No abras el HTML directamente con doble clic (file://). La WebCam requiere un servidor HTTP.

---

## Cómo usar la aplicación

1. Ve a [Teachable Machine](https://teachablemachine.withgoogle.com/) y entrena un modelo de imágenes
2. Haz clic en **Export Model** → **Upload my model** → copia la URL
3. Pega la URL en el campo de la aplicación y haz clic en **Cargar**
4. Haz clic en **Iniciar cámara**
5. La aplicación clasifica en tiempo real mostrando el semáforo de confianza

---

## Funcionalidades implementadas

### Semáforo de Confianza
Los estilos CSS se modifican dinámicamente desde JavaScript según el nivel de confianza:
- 🟢 **Verde** (`--color-high`) → confianza ≥ 90%
- 🟡 **Amarillo** (`--color-mid`) → confianza entre 50% y 89%
- 🔴 **Rojo** (`--color-low`) → confianza < 50%

El color se aplica a las barras de progreso agregando clases CSS:
```javascript
row.classList.add(`confidence-${level}`); // high | mid | low
```

### Modo Oscuro con CSS Variables
El toggle cambia la clase `dark` en el `<body>`:
```javascript
document.body.classList.toggle('dark');
```

El CSS tiene dos sets de variables en `:root` y `body.dark`:
```css
:root          { --bg-primary: #f4f3ef; ... } /* Tema claro */
body.dark      { --bg-primary: #0f0f0e; ... } /* Tema oscuro */
```
Todos los elementos usan `var(--nombre-variable)`, por lo que el cambio es instantáneo y global.

---

## Tecnologías usadas
- TensorFlow.js 4.10
- Teachable Machine Image Library 0.8.5
- Vanilla JS (sin frameworks)
- CSS Variables nativas del navegador
