"""Utilidades compartidas por los scripts de /editar."""
import datetime
import json
import os
import re
import sys
import unicodedata

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EDICIONES = os.path.join(RAIZ, "public", "ediciones")
SALIDAS = os.path.join(RAIZ, "out", "ediciones")
EXTENSIONES_VIDEO = (".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi")


def slug(texto):
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t or "video"


def carpeta_edicion(nombre):
    return os.path.join(EDICIONES, slug(os.path.splitext(os.path.basename(nombre))[0]))


def ruta_receta(carpeta):
    return os.path.join(carpeta, "receta.json")


def leer_json(ruta):
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def escribir_json(ruta, datos):
    tmp = ruta + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)
    os.replace(tmp, ruta)


def leer_receta(carpeta):
    ruta = ruta_receta(carpeta)
    if not os.path.exists(ruta):
        sys.exit(f"No existe la receta: {ruta}. Ejecuta primero transcribir.py")
    return leer_json(ruta)


def guardar_receta(carpeta, receta, accion=None, detalle=None):
    if accion:
        receta.setdefault("historial", []).append({
            "fecha": datetime.datetime.now().isoformat(timespec="seconds"),
            "accion": accion,
            "detalle": detalle or "",
        })
    escribir_json(ruta_receta(carpeta), receta)


def normalizar(palabra):
    p = unicodedata.normalize("NFKD", palabra.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", p)


def proteger_original(receta, ruta_salida):
    """Aborta si una salida apuntara al vídeo original."""
    original = os.path.realpath(os.path.join(RAIZ, receta["video"]["original"]))
    if os.path.realpath(ruta_salida) == original:
        sys.exit("ABORTADO: la salida coincide con el vídeo original. El original nunca se modifica.")
