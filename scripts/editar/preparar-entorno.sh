#!/usr/bin/env bash
# Comprueba lo que necesita /editar e instala SOLO lo que falte.
set -e
cd "$(dirname "$0")/../.."
MODELO="${WHISPER_MODEL_DIR:-/home/user/whisper-models/faster-whisper-small}"

command -v ffmpeg >/dev/null || { echo "FALTA ffmpeg (instálalo con el gestor de paquetes)"; exit 1; }
[ -d node_modules ] || npm install --no-audit --no-fund
python3 -c "import faster_whisper" 2>/dev/null || pip3 install -q faster-whisper
python3 -c "import av,sys; sys.exit(0 if int(av.__version__.split('.')[0])<17 else 1)" 2>/dev/null || pip3 install -q "av<17"
if [ ! -s "$MODELO/model.bin" ]; then
  mkdir -p "$MODELO"
  for f in config.json tokenizer.json vocabulary.txt model.bin; do
    curl -sSL --fail --retry 3 -o "$MODELO/$f" "https://huggingface.co/Systran/faster-whisper-small/resolve/main/$f"
  done
fi
echo "Entorno de /editar listo."
