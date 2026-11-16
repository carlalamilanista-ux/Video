"""Paso 2 de /editar: propone cortes (NO corta nada).

Uso: python3 scripts/editar/proponer_cortes.py <carpeta-edicion> [--rehacer]

Detecta silencios largos, muletillas y frases repetidas en la transcripción
y los guarda en receta.propuestaCortes con "aprobado": null (pendiente).
Si ya hay propuesta, conserva las decisiones existentes salvo --rehacer.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from comun import leer_json, leer_receta, guardar_receta, normalizar, RAIZ  # noqa: E402

# Muletillas casi siempre prescindibles
MULETILLAS_SEGURAS = {"eh", "ehh", "ehhh", "em", "emm", "emmm", "mm", "mmm", "mmmm", "hm", "hmm", "aah", "uh", "um"}
# Muletillas que dependen del contexto (se marcan para revisar)
# Muletillas que dependen del contexto: solo se proponen si suenan sueltas (pausa o coma alrededor)
MULETILLAS_REVISAR = {"este", "bueno", "pues", "vale", "osea", "digamos", "sabes", "entonces", "tipo", "ah"}
FRASES_MULETILLA = [("o", "sea"), ("en", "plan"), ("a", "ver"), ("es", "decir"), ("pues", "nada"), ("o", "sea", "que")]


def texto_rango(palabras, a, b):
    return " ".join(p["texto"] for p in palabras[a:b + 1])


def contexto(palabras, a, b, n=4):
    antes = " ".join(p["texto"] for p in palabras[max(0, a - n):a])
    despues = " ".join(p["texto"] for p in palabras[b + 1:b + 1 + n])
    return f"…{antes} [{texto_rango(palabras, a, b)}] {despues}…"


def suelta(palabras, i, pausa=0.25):
    """La palabra va aislada: pausa antes/después, o coma/puntos suspensivos pegados."""
    p = palabras[i]
    if re.search(r"[,…]|\.\.\.$", p["texto"]):
        return True
    antes = i == 0 or p["inicio"] - palabras[i - 1]["fin"] > pausa or re.search(r"[.,…?!]$", palabras[i - 1]["texto"])
    despues = i + 1 == len(palabras) or palabras[i + 1]["inicio"] - p["fin"] > pausa
    return bool(antes and despues)


def detectar(palabras, duracion, aj):
    cortes = []
    margen, sil_min = aj["margen"], aj["silencioMinimo"]
    norm = [normalizar(p["texto"]) for p in palabras]

    # 1) Silencios largos (incluye inicio y final del vídeo)
    puntos = [(0.0, palabras[0]["inicio"] if palabras else duracion, "al inicio")]
    for a, b in zip(palabras, palabras[1:]):
        puntos.append((a["fin"], b["inicio"], f"entre «{a['texto']}» y «{b['texto']}»"))
    if palabras:
        puntos.append((palabras[-1]["fin"], duracion, "al final"))
    for ini, fin, donde in puntos:
        if fin - ini >= sil_min:
            ci = ini + (margen if ini > 0 else 0)
            cf = fin - (margen if fin < duracion else 0)
            if cf - ci > 0.2:
                cortes.append({"tipo": "silencio", "inicio": ci, "fin": cf, "texto": "",
                               "motivo": f"Silencio de {fin - ini:.1f}s {donde}", "confianza": "alta"})

    # 2) Muletillas (palabras sueltas y frases de 2-3 palabras)
    usados = set()
    for frase in sorted(FRASES_MULETILLA, key=len, reverse=True):
        n = len(frase)
        for i in range(len(norm) - n + 1):
            if tuple(norm[i:i + n]) == frase and not usados.intersection(range(i, i + n)):
                usados.update(range(i, i + n))
                cortes.append(_corte_palabras(palabras, i, i + n - 1, "muletilla", "revisar", margen))
    for i, w in enumerate(norm):
        if i in usados:
            continue
        if w in MULETILLAS_SEGURAS:
            cortes.append(_corte_palabras(palabras, i, i, "muletilla", "alta", margen))
        elif w in MULETILLAS_REVISAR and suelta(palabras, i):
            cortes.append(_corte_palabras(palabras, i, i, "muletilla", "revisar", margen))

    # 3) Frases repetidas / arranques en falso: se propone quitar la PRIMERA toma
    ventana = aj.get("repeticionVentana", 15)
    i = 0
    while i < len(norm):
        mejor = None
        for n in range(8, 1, -1):  # frases de 2 a 8 palabras
            if i + n > len(norm):
                continue
            frase = norm[i:i + n]
            if not all(frase) or (n == 2 and len("".join(frase)) < 6):
                continue
            for j in range(i + n, min(len(norm) - n + 1, i + n + ventana)):
                if norm[j:j + n] == frase:
                    mejor = (n, j)
                    break
            if mejor:
                break
        if mejor:
            n, j = mejor
            c = _corte_palabras(palabras, i, j - 1, "repeticion", "alta" if j == i + n else "revisar", margen)
            c["motivo"] = f"Repite «{texto_rango(palabras, i, i + n - 1)}»: se quita la primera toma y se queda la segunda"
            cortes.append(c)
            i = j
        else:
            i += 1

    # Ordenar y numerar
    cortes.sort(key=lambda c: (c["inicio"], c["fin"]))
    for k, c in enumerate(cortes, 1):
        c["id"] = f"c{k}"
        c["inicio"], c["fin"] = round(c["inicio"], 3), round(c["fin"], 3)
        c["aprobado"] = None
    return cortes


def _corte_palabras(palabras, a, b, tipo, confianza, margen):
    ini = palabras[a]["inicio"]
    fin = palabras[b]["fin"]
    # Extiende hasta la mitad del hueco con la palabra vecina para no dejar respiraciones a medias
    if a > 0:
        ini = max(palabras[a - 1]["fin"] + margen / 2, ini - 0.08)
    if b + 1 < len(palabras):
        fin = min(palabras[b + 1]["inicio"] - margen / 2, fin + 0.08)
    motivo = "Muletilla" if tipo == "muletilla" else "Repetición"
    if confianza == "revisar":
        motivo += " (revisar: puede ser parte de la frase)"
    return {"tipo": tipo, "inicio": ini, "fin": max(fin, ini + 0.05), "texto": texto_rango(palabras, a, b),
            "contexto": contexto(palabras, a, b), "motivo": motivo, "confianza": confianza, "palabras": [a, b]}


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    carpeta = os.path.abspath(sys.argv[1])
    receta = leer_receta(carpeta)
    if receta.get("propuestaCortes") and "--rehacer" not in sys.argv:
        print("Ya hay una propuesta en la receta (usa --rehacer para regenerarla).")
    else:
        tr = leer_json(os.path.join(RAIZ, receta["archivos"]["transcripcion"]))
        receta["propuestaCortes"] = detectar(tr["palabras"], receta["video"]["duracion"], receta["ajustes"])
        receta["estado"] = "propuesta"
        guardar_receta(carpeta, receta, "propuesta", f"{len(receta['propuestaCortes'])} cortes propuestos")
    imprimir(receta)


def imprimir(receta):
    cortes = receta["propuestaCortes"]
    total = sum(c["fin"] - c["inicio"] for c in cortes)
    print(f"\nPROPUESTA: {len(cortes)} cortes, {total:.1f}s de {receta['video']['duracion']:.1f}s")
    for c in cortes:
        estado = {None: "pendiente", True: "APROBADO", False: "rechazado"}[c["aprobado"]]
        txt = c.get("contexto") or c["motivo"]
        print(f"{c['id']:>4} | {c['tipo']:<10} | {c['inicio']:7.2f}-{c['fin']:7.2f}s | {c['confianza']:<7} | {estado:<9} | {txt}")


if __name__ == "__main__":
    main()
