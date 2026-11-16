"""Pasos 4-5 de /editar: prepara los datos para Remotion y renderiza.

Uso: python3 scripts/editar/render.py <carpeta-edicion> borrador|final

- borrador: 540x960, rápido, con marca «BORRADOR». Pone estado = borrador.
- final:    MP4 vertical 1080x1920. Solo si la receta está en estado «aprobado».
"""
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from comun import RAIZ, SALIDAS, leer_json, escribir_json, leer_receta, guardar_receta, proteger_original  # noqa: E402

PAUSA_CORTE = 0.35  # una pausa mayor separa bloques de subtítulos


def agrupar(palabras, minimo, maximo, correcciones):
    grupos, actual = [], []
    for k, p in enumerate(palabras):
        texto = correcciones.get(str(p.get("i")), correcciones.get(p["texto"], p["texto"]))
        if not texto:
            continue
        actual.append({"texto": texto, "inicio": p["inicio"], "fin": p["fin"]})
        sig = palabras[k + 1] if k + 1 < len(palabras) else None
        fin_frase = bool(re.search(r"[.!?…,;:]$", texto))
        pausa = sig is not None and sig["inicio"] - p["fin"] > PAUSA_CORTE
        if len(actual) >= maximo or ((fin_frase or pausa) and len(actual) >= minimo) or sig is None:
            grupos.append(actual)
            actual = []
    if actual:
        grupos.append(actual)
    out = []
    for g in grupos:
        out.append({"texto": " ".join(w["texto"] for w in g), "inicio": g[0]["inicio"], "fin": g[-1]["fin"],
                    "palabras": g})
    # Cada bloque se mantiene hasta que empieza el siguiente (máx. 0.6s extra)
    for a, b in zip(out, out[1:]):
        a["fin"] = min(b["inicio"], a["fin"] + 0.6)
    return out


def main():
    if len(sys.argv) < 3 or sys.argv[2] not in ("borrador", "final"):
        sys.exit(__doc__)
    carpeta, modo = os.path.abspath(sys.argv[1]), sys.argv[2]
    r = leer_receta(carpeta)
    if r["estado"] in ("transcrito", "propuesta"):
        sys.exit("Primero hay que aplicar los cortes aprobados (cortar.py).")
    if modo == "final" and r["estado"] not in ("aprobado", "final"):
        sys.exit("El final solo se exporta cuando el usuario aprueba el borrador (receta.py aprobar-final).")
    if not r["titular"]["texto"]:
        sys.exit("Falta el titular en la receta (receta.py titular \"...\").")

    tr = leer_json(os.path.join(RAIZ, r["archivos"]["transcripcionCortada"]))
    st, fm = r["subtitulos"], r["formato"]
    fps = fm["fps"]
    props = {
        "video": os.path.relpath(os.path.join(RAIZ, r["archivos"]["videoCortado"]), os.path.join(RAIZ, "public")),
        "duracion": tr["duracion"],
        "fps": fps,
        "anchoOriginal": r["video"]["ancho"],
        "altoOriginal": r["video"]["alto"],
        "encuadre": fm["encuadre"],
        "enfoqueX": fm.get("enfoqueX", 0.5),
        "titular": r["titular"],
        "subtitulos": agrupar(tr["palabras"], st["minPalabras"], st["maxPalabras"], st.get("correcciones", {})),
        "borrador": modo == "borrador",
    }
    ruta_props = os.path.join(RAIZ, r["archivos"]["props"])
    escribir_json(ruta_props, props)

    nombre = os.path.basename(carpeta)
    os.makedirs(os.path.join(SALIDAS, nombre), exist_ok=True)
    salida = os.path.join(SALIDAS, nombre, f"{modo}.mp4")
    proteger_original(r, salida)
    cmd = ["npx", "remotion", "render", "EditarVideo", salida, f"--props={ruta_props}", "--codec=h264"]
    cmd += ["--scale=0.5", "--crf=28"] if modo == "borrador" else ["--crf=16"]
    subprocess.run(cmd, cwd=RAIZ, check=True)

    r["estado"] = "borrador" if modo == "borrador" else "final"
    r.setdefault("salidas", {})[modo] = os.path.relpath(salida, RAIZ)
    guardar_receta(carpeta, r, modo, os.path.relpath(salida, RAIZ))
    print(f"{modo.upper()}: {os.path.relpath(salida, RAIZ)}")


if __name__ == "__main__":
    main()
