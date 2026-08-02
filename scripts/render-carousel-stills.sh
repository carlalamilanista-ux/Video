#!/bin/bash
# Editor Pro Max - Instagram Carousel Still Export
# Renders each carousel slide as a standalone PNG (1080x1350)
# ready to upload as an Instagram carousel post.
#
# Usage: ./scripts/render-carousel-stills.sh [composition-id] [slide-count] [output-subdir]
#
# Examples:
#   ./scripts/render-carousel-stills.sh InvaMulaCarousel 7 invamula
#   ./scripts/render-carousel-stills.sh BegonaSalgueiroCarousel 5 begona

COMP_ID=${1:-"InvaMulaCarousel"}
SLIDE_COUNT=${2:-7}
OUTPUT_SUBDIR=${3:-""}
SLIDE_FRAMES=120   # 4s per slide at 30fps
OFFSET=70          # frame within each slide's hold, past the enter animation

OUTPUT_DIR="out/carousel"
[ -n "$OUTPUT_SUBDIR" ] && OUTPUT_DIR="out/carousel/${OUTPUT_SUBDIR}"
mkdir -p "$OUTPUT_DIR"

echo "=== Carousel Still Export: ${COMP_ID} ==="

for ((i=0; i<SLIDE_COUNT; i++)); do
  SLIDE_NUM=$((i + 1))
  FRAME=$((i * SLIDE_FRAMES + OFFSET))
  OUTPUT_FILE="${OUTPUT_DIR}/slide-${SLIDE_NUM}.png"
  echo "--- Slide ${SLIDE_NUM}/${SLIDE_COUNT} (frame ${FRAME}) ---"
  npx remotion still "${COMP_ID}" "${OUTPUT_FILE}" --frame="${FRAME}"
done

echo "=== Done. Slides saved to ${OUTPUT_DIR}/ ==="
