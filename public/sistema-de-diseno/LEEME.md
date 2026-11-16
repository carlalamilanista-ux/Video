# Sistema de diseño

Carpeta única del sistema de diseño que usan `/editar` (Remotion) y `/hyperframes`.

- `original/` → contenido del ZIP del sistema de diseño, descomprimido tal cual. No se edita.
- `fuentes/` → archivos de fuentes (.woff2, .woff, .ttf, .otf) copiados del ZIP.
- `tokens.json` → traducción del sistema de diseño a valores que leen las plantillas:
  colores, fuentes, tamaños, posiciones y animación de titular y subtítulos.

Estado: **pendiente del ZIP**. `tokens.json` contiene valores provisionales (`_estado`).
Cuando llegue el ZIP: descomprimir en `original/`, copiar fuentes a `fuentes/`,
rellenar `tokens.json` con los valores reales (en `archivo` va la ruta relativa a esta
carpeta, p. ej. `fuentes/MiFuente-Bold.woff2`) y borrar la clave `_estado`.
