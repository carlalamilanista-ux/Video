"""Paso 1 de /editar: transcribe un vídeo con Whisper y crea la receta.

Uso: python3 scripts/editar/transcribir.py <ruta-del-video> [--rehacer]

Genera en public/ediciones/<nombre>/:
  - transcripcion.json  (cada palabra con su inicio y fin en segundos)
  - receta.json         (decisiones de edición; se conserva si ya existe)
El vídeo original solo se lee.
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(__file__))
from comun import RAIZ, carpeta_edicion, escribir_json, guardar_receta, ruta_receta, leer_json  # noqa: E402

MODELO_LOCAL = os.environ.get("WHISPER_MODEL_DIR", "/home/user/whisper-models/faster-whisper-small")
# Pista para que Whisper NO omita las muletillas (por defecto tiende a borrarlas).
PISTA = "Eh, mmm... bueno, o sea, este, pues eso. Em, a ver, ¿vale? En plan, ¿sabes?"


def info_video(ruta):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate:stream_tags=rotate:format=duration", "-of", "json", ruta],
        capture_output=True, text=True, check=True).stdout
    d = json.loads(out)
    s = d["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    ancho, alto = s["width"], s["height"]
    rot = int(s.get("tags", {}).get("rotate", 0) or 0)
    if abs(rot) in (90, 270):
        ancho, alto = alto, ancho
    return {"duracion": float(d["format"]["duration"]), "ancho": ancho, "alto": alto,
            "fps": round(float(num) / float(den), 3)}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    video = os.path.abspath(args[0])
    if not os.path.exists(video):
        sys.exit(f"No encuentro el vídeo: {video}")
    rehacer = "--rehacer" in sys.argv

    carpeta = carpeta_edicion(video)
    os.makedirs(carpeta, exist_ok=True)
    salida = os.path.join(carpeta, "transcripcion.json")
    if os.path.exists(salida) and not rehacer:
        print(f"Ya existe la transcripción: {os.path.relpath(salida, RAIZ)} (usa --rehacer para repetirla)")
    else:
        from faster_whisper import WhisperModel
        modelo = MODELO_LOCAL if os.path.isdir(MODELO_LOCAL) else "small"
        m = WhisperModel(modelo, device="cpu", compute_type="int8")
        with tempfile.TemporaryDirectory() as tmp:
            wav = os.path.join(tmp, "audio.wav")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
            segs, info = m.transcribe(wav, language="es", word_timestamps=True, initial_prompt=PISTA,
                                      vad_filter=False, condition_on_previous_text=False)
            palabras, segmentos = [], []
            for s in segs:
                segmentos.append({"texto": s.text.strip(), "inicio": round(s.start, 3), "fin": round(s.end, 3)})
                for w in s.words or []:
                    t = w.word.strip()
                    if t:
                        palabras.append({"i": len(palabras), "texto": t, "inicio": round(w.start, 3),
                                         "fin": round(w.end, 3), "confianza": round(w.probability, 3)})
        escribir_json(salida, {"idioma": info.language, "modelo": "faster-whisper small",
                               "duracion": round(info.duration, 3), "palabras": palabras, "segmentos": segmentos})
        print(f"Transcripción: {len(palabras)} palabras -> {os.path.relpath(salida, RAIZ)}")

    rec_path = ruta_receta(carpeta)
    if os.path.exists(rec_path):
        receta = leer_json(rec_path)
        receta["video"]["original"] = os.path.relpath(video, RAIZ)
        guardar_receta(carpeta, receta, "transcripcion", "Transcripción actualizada" if rehacer else "Receta existente reutilizada")
    else:
        receta = {
            "version": 1,
            "video": {"nombre": os.path.basename(video), "original": os.path.relpath(video, RAIZ), **info_video(video)},
            "archivos": {
                "transcripcion": os.path.relpath(salida, RAIZ),
                "transcripcionCortada": os.path.relpath(os.path.join(carpeta, "transcripcion-cortada.json"), RAIZ),
                "videoCortado": os.path.relpath(os.path.join(carpeta, "cortado.mp4"), RAIZ),
                "props": os.path.relpath(os.path.join(carpeta, "props.json"), RAIZ),
            },
            "ajustes": {"silencioMinimo": 0.7, "margen": 0.12, "repeticionVentana": 15},
            "propuestaCortes": [],
            "titular": {"texto": "", "inicio": 0, "duracion": None},
            "subtitulos": {"minPalabras": 2, "maxPalabras": 3, "correcciones": {}},
            "formato": {"ancho": 1080, "alto": 1920, "fps": 30, "encuadre": "cover", "enfoqueX": 0.5},
            "estado": "transcrito",
            "historial": [],
        }
        guardar_receta(carpeta, receta, "creada", f"Receta creada para {receta['video']['nombre']}")
    print(f"Receta: {os.path.relpath(rec_path, RAIZ)}")


if __name__ == "__main__":
    main()
