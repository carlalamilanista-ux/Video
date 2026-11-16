"""Modifica la receta de /editar dejando constancia en el historial.

Uso:
  python3 scripts/editar/receta.py <carpeta> ver
  python3 scripts/editar/receta.py <carpeta> aprobar c1 c2 ...|todos|alta
  python3 scripts/editar/receta.py <carpeta> rechazar c3 c4 ...|todos|pendientes
  python3 scripts/editar/receta.py <carpeta> titular "Texto del titular"
  python3 scripts/editar/receta.py <carpeta> poner <ruta.con.puntos> <valor-JSON>
  python3 scripts/editar/receta.py <carpeta> aprobar-final
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from comun import leer_receta, guardar_receta  # noqa: E402
from proponer_cortes import imprimir  # noqa: E402


def seleccionar(cortes, ids):
    if ids == ["todos"]:
        return cortes
    if ids == ["alta"]:
        return [c for c in cortes if c["confianza"] == "alta"]
    if ids == ["pendientes"]:
        return [c for c in cortes if c["aprobado"] is None]
    faltan = set(ids) - {c["id"] for c in cortes}
    if faltan:
        sys.exit(f"No existen estos cortes: {', '.join(sorted(faltan))}")
    return [c for c in cortes if c["id"] in ids]


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    carpeta, orden, resto = os.path.abspath(sys.argv[1]), sys.argv[2], sys.argv[3:]
    r = leer_receta(carpeta)

    if orden == "ver":
        print(json.dumps({k: r[k] for k in ("video", "titular", "subtitulos", "formato", "estado")}, ensure_ascii=False, indent=2))
        imprimir(r)
        return
    if orden in ("aprobar", "rechazar"):
        sel = seleccionar(r["propuestaCortes"], resto)
        for c in sel:
            c["aprobado"] = orden == "aprobar"
        if r["estado"] in ("borrador", "aprobado", "final"):
            r["estado"] = "propuesta"  # hay que volver a cortar
        guardar_receta(carpeta, r, f"cortes-{orden}", ", ".join(c["id"] for c in sel))
        imprimir(r)
        return
    if orden == "titular":
        r["titular"]["texto"] = " ".join(resto)
        guardar_receta(carpeta, r, "titular", r["titular"]["texto"])
        print("Titular:", r["titular"]["texto"])
        return
    if orden == "poner":
        ruta, valor = resto[0].split("."), json.loads(resto[1])
        nodo = r
        for k in ruta[:-1]:
            nodo = nodo.setdefault(k, {})
        nodo[ruta[-1]] = valor
        guardar_receta(carpeta, r, "cambio", f"{resto[0]} = {resto[1]}")
        print(f"{resto[0]} = {json.dumps(valor, ensure_ascii=False)}")
        return
    if orden == "aprobar-final":
        if r["estado"] != "borrador":
            sys.exit(f"Solo se aprueba tras ver un borrador (estado actual: {r['estado']}).")
        r["estado"] = "aprobado"
        guardar_receta(carpeta, r, "aprobado", "El usuario aprobó el borrador")
        print("Borrador aprobado: ya se puede exportar el final.")
        return
    sys.exit(__doc__)


if __name__ == "__main__":
    main()
