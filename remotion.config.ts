import {Config} from "@remotion/cli/config";
import {existsSync} from "fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// En el servidor en la nube, usar el navegador preinstalado (no se puede descargar otro).
if (existsSync("/opt/pw-browsers/chromium")) {
  Config.setBrowserExecutable("/opt/pw-browsers/chromium");
}
