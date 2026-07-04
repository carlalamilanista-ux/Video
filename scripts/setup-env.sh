#!/bin/bash
# Setup environment: FFmpeg, Chromium headless, Whisper.cpp
set -e

echo "✦ Setting up Editor Pro Max environment..."

# FFmpeg
if [ -f /opt/pw-browsers/ffmpeg-1011/ffmpeg-linux ]; then
  ln -sf /opt/pw-browsers/ffmpeg-1011/ffmpeg-linux /usr/local/bin/ffmpeg
  ln -sf /opt/pw-browsers/ffmpeg-1011/ffmpeg-linux /usr/local/bin/ffprobe
  echo "✓ FFmpeg linked"
else
  echo "✗ FFmpeg not found at /opt/pw-browsers"
fi

# Chromium headless shell
CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
if [ -f "$CHROME_PATH" ]; then
  echo "✓ Chromium headless shell found at $CHROME_PATH"
  echo "  Use: npx remotion render <id> out/video.mp4 --browser-executable=$CHROME_PATH"
else
  echo "✗ Chromium headless shell not found"
fi

# Whisper.cpp
if [ -f ./whisper.cpp/main ]; then
  echo "✓ Whisper.cpp already installed"
else
  echo "Installing Whisper.cpp..."
  npx tsx -e "
import {installWhisperCpp, downloadWhisperModel} from '@remotion/install-whisper-cpp';
async function run() {
  await installWhisperCpp({to: './whisper.cpp', version: '1.5.5'});
  await downloadWhisperModel({folder: './whisper.cpp', model: 'small'});
}
run().catch(console.error);
"
fi

echo ""
echo "✦ Environment ready!"
echo ""
echo "RENDER COMMAND:"
echo "  npx remotion render <CompositionId> out/video.mp4 --browser-executable=$CHROME_PATH"
