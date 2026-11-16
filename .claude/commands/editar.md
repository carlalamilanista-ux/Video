---
description: Edita un vídeo en español - transcribe, propone cortes, corta, añade titular y subtítulos con el sistema de diseño y exporta en 9:16
argument-hint: <nombre-del-video>
---

Edita el vídeo: **$ARGUMENTS**

La usuaria no programa: explica cada paso en una frase, sin mostrar código ni comandos. Habla en español.

## Reglas que no se rompen
- **El vídeo original nunca se borra, mueve, renombra ni sobrescribe.** Solo se lee.
- **No se corta nada sin aprobación explícita** de la usuaria.
- **El MP4 final solo se exporta cuando ella aprueba el borrador.**
- Toda decisión se guarda en la **receta** (`public/ediciones/<nombre>/receta.json`) mediante `scripts/editar/receta.py`, para poder pedir cambios sin empezar de cero.
- Diseño: siempre `public/sistema-de-diseno/tokens.json`. Si su `_estado` dice PROVISIONAL, avisa de que aún falta el ZIP del sistema de diseño.

## Paso 0 — Preparar
1. Ejecuta `bash scripts/editar/preparar-entorno.sh` (solo instala lo que falte).
2. Localiza el vídeo: busca `$ARGUMENTS` (con o sin extensión, sin distinguir mayúsculas) en `public/assets/`, la raíz del proyecto y subcarpetas, excluyendo `node_modules`, `out` y `public/ediciones`. Si hay varias coincidencias, pregunta cuál. Si no existe, pide que lo suba a `public/assets/`.
3. Si ya existe `public/ediciones/<nombre>/receta.json`, **no empieces de cero**: lee la receta (`receta.py <carpeta> ver`), resume en qué estado está y continúa desde ahí o aplica el cambio pedido.

## Paso 1 — Transcribir
`python3 scripts/editar/transcribir.py <ruta-del-video>` → crea `transcripcion.json` (cada palabra con inicio y fin) y la receta.

## Paso 2 — Proponer cortes (sin cortar)
1. `python3 scripts/editar/proponer_cortes.py <carpeta>`.
2. Revisa la lista con criterio: descarta falsos positivos evidentes (p. ej. «pues» o «bueno» que sí aportan sentido) rechazándolos, y añade repeticiones que el detector no vea editando `propuestaCortes` con `receta.py poner`.
3. Presenta una tabla corta agrupada por tipo (silencios / muletillas / repeticiones) con: id, minuto:segundo, qué se oye con su contexto y segundos que ahorra. Indica el total que se recortaría.
4. **Para y espera.** Ella puede responder «todos», «solo los seguros», «todos menos c4 y c9», etc. Registra su decisión con `receta.py <carpeta> aprobar …` y `receta.py <carpeta> rechazar …`. Ningún corte puede quedar pendiente.

## Paso 3 — Cortar
`python3 scripts/editar/cortar.py <carpeta>` → `cortado.mp4` y `transcripcion-cortada.json`. Informa de la duración antes y después.

## Paso 4 — Titular y subtítulos
1. Propón un titular-gancho corto (máx. 8 palabras) basado en la transcripción y guárdalo con `receta.py <carpeta> titular "…"`. Si ella ya dio uno, usa el suyo.
2. Subtítulos de 2 a 3 palabras (`subtitulos.minPalabras` / `maxPalabras` en la receta). Si Whisper transcribió mal una palabra, corrígela en `subtitulos.correcciones` (clave = índice `i` de la palabra o el texto original).
3. Si el vídeo original es horizontal, decide `formato.encuadre`: `cover` (recorta al centro, ajustable con `formato.enfoqueX` de 0 a 1) o `desenfoque` (vídeo completo sobre fondo desenfocado).

## Paso 5 — Borrador y final
1. `python3 scripts/editar/render.py <carpeta> borrador` → `out/ediciones/<nombre>/borrador.mp4` (baja resolución, marca BORRADOR). Envíaselo con SendUserFile y saca 2-3 fotogramas para revisar tú antes que nadie que titular y subtítulos se leen bien.
2. **Para y espera.** Si pide cambios, modifica solo lo necesario en la receta y vuelve al paso que corresponda (cortes → paso 3; texto o diseño → paso 5).
3. Cuando apruebe: `receta.py <carpeta> aprobar-final` y `python3 scripts/editar/render.py <carpeta> final` → `out/ediciones/<nombre>/final.mp4` (1080x1920, 9:16). Envíaselo.
4. Termina recordándole: «Si quieres animar este reel, escribe `/hyperframes Anima mi reel.`»

## Cambios posteriores
Con «/editar <nombre>» + un cambio («quita el corte c5», «cambia el titular», «subtítulos más grandes»), lee la receta, cambia solo eso (los tamaños de diseño van en `tokens.json` solo si el cambio es para todos los vídeos; si es solo para este, díselo) y rehaz desde el paso afectado. El historial de la receta queda como registro.
