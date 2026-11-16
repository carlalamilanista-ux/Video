"""Paso 3 de /editar: aplica con FFmpeg SOLO los cortes aprobados.

Uso: python3 scripts/editar/cortar.py <carpeta-edicion>

Lee el original (sin modificarlo) y escribe:
  - cortado.mp4                (vídeo sin los tramos aprobados)
  - transcripcion-cortada.json (palabras con los tiempos ya desplazados)
"""
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from comun import RAIZ, leer_json, escribir_json, leer_receta, guardar_receta, proteger_original  # noqa: E402

FUNDIDO = 0.012  # segundos de fundido de audio en cada unión para evitar chasquidos


def fusionar(rangos):
    out = []
    for a, b in sorted(rangos):
        if out and a <= out[-1][1] + 0.02:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def conservados(cortes, duracion):
    segs, t = [], 0.0
    for a, b in cortes:
        if a - t > 0.05:
            segs.append([round(t, 3), round(a, 3)])
        t = max(t, b)
    if duracion - t > 0.05:
        segs.append([round(t, 3), round(duracion, 3)])
    return segs


def remapear(palabras, segs):
    out, desplazado = [], 0.0
    for a, b in segs:
        for p in palabras:
            centro = (p["inicio"] + p["fin"]) / 2
            if a <= centro < b:
                out.append({**p, "inicio": round(max(p["inicio"], a) - a + desplazado, 3),
                            "fin": round(min(p["fin"], b) - a + desplazado, 3)})
        desplazado += b - a
    return out, desplazado


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    carpeta = os.path.abspath(sys.argv[1])
    r = leer_receta(carpeta)
    pendientes = [c["id"] for c in r["propuestaCortes"] if c["aprobado"] is None]
    if pendientes:
        sys.exit(f"Hay cortes sin decidir: {', '.join(pendientes)}. Apruébalos o recházalos antes de cortar.")

    original = os.path.join(RAIZ, r["video"]["original"])
    salida = os.path.join(RAIZ, r["archivos"]["videoCortado"])
    proteger_original(r, salida)

    duracion = r["video"]["duracion"]
    cortes = fusionar([[c["inicio"], c["fin"]] for c in r["propuestaCortes"] if c["aprobado"]])
    segs = conservados(cortes, duracion)

    filtros, etiquetas = [], []
    for k, (a, b) in enumerate(segs):
        d = b - a
        filtros.append(f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS[v{k}]")
        filtros.append(f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,"
                       f"afade=t=in:d={FUNDIDO},afade=t=out:st={max(0, d - FUNDIDO):.3f}:d={FUNDIDO}[a{k}]")
        etiquetas.append(f"[v{k}][a{k}]")
    filtros.append(f"{''.join(etiquetas)}concat=n={len(segs)}:v=1:a=1[v][a]")
    script = os.path.join(carpeta, "ffmpeg-filtros.txt")
    with open(script, "w") as f:
        f.write(";\n".join(filtros))

    tmp = salida + ".tmp.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", original, "-filter_complex_script", script,
                    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp], check=True)
    os.replace(tmp, salida)

    tr = leer_json(os.path.join(RAIZ, r["archivos"]["transcripcion"]))
    palabras, nueva = remapear(tr["palabras"], segs)
    escribir_json(os.path.join(RAIZ, r["archivos"]["transcripcionCortada"]),
                  {"duracion": round(nueva, 3), "palabras": palabras})

    r["segmentosConservados"] = segs
    r["duracionCortada"] = round(nueva, 3)
    r["estado"] = "cortado"
    guardar_receta(carpeta, r, "cortado", f"{len(cortes)} cortes aplicados: {duracion:.1f}s -> {nueva:.1f}s")
    print(f"Cortado: {duracion:.1f}s -> {nueva:.1f}s ({len(cortes)} cortes) -> {os.path.relpath(salida, RAIZ)}")


if __name__ == "__main__":
    main()
