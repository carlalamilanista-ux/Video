import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import tokens from "../../../public/sistema-de-diseno/tokens.json";

type Palabra = {texto: string; inicio: number; fin: number};
type Grupo = {texto: string; inicio: number; fin: number; palabras: Palabra[]};

export type EditarVideoProps = {
  video: string;
  duracion: number;
  fps: number;
  anchoOriginal: number;
  altoOriginal: number;
  encuadre: "cover" | "desenfoque";
  enfoqueX: number;
  titular: {texto: string; inicio: number; duracion: number | null};
  subtitulos: Grupo[];
  borrador: boolean;
};

type Fuente = {familia: string; archivo: string | null; peso: number};

const useFuentes = () => {
  const [handle] = useState(() => delayRender("Cargando fuentes del sistema de diseño"));
  useEffect(() => {
    const fuentes = Object.values(tokens.fuentes) as Fuente[];
    Promise.all(
      fuentes
        .filter((f) => f.archivo)
        .map((f) => {
          const face = new FontFace(f.familia, `url(${staticFile(`sistema-de-diseno/${f.archivo}`)})`, {
            weight: String(f.peso),
          });
          return face.load().then((l) => document.fonts.add(l));
        }),
    )
      .catch((e) => console.error("Fuente no cargada", e))
      .finally(() => continueRender(handle));
  }, [handle]);
};

const Fondo: React.FC<Pick<EditarVideoProps, "video" | "encuadre" | "enfoqueX">> = ({video, encuadre, enfoqueX}) => {
  if (!video) return null;
  const src = staticFile(video);
  const pos = `${Math.round(enfoqueX * 100)}% 50%`;
  if (encuadre === "desenfoque") {
    return (
      <AbsoluteFill style={{backgroundColor: "#000"}}>
        <OffthreadVideo src={src} muted style={{width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.6)", transform: "scale(1.15)"}} />
        <AbsoluteFill style={{justifyContent: "center"}}>
          <OffthreadVideo src={src} style={{width: "100%", objectFit: "contain"}} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return <OffthreadVideo src={src} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: pos}} />;
};

const Titular: React.FC<{texto: string; inicio: number; duracion: number | null}> = ({texto, inicio, duracion}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width} = useVideoConfig();
  const t = tokens.titular;
  const a = Math.round(inicio * fps);
  const b = duracion == null ? durationInFrames : a + Math.round(duracion * fps);
  if (frame < a || frame >= b) return null;
  const entrada = spring({frame: frame - a, fps, config: {damping: 16, stiffness: 140}});
  const salida = duracion == null ? 1 : interpolate(frame, [b - 8, b], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const s = width / 1080;
  return (
    <AbsoluteFill style={{alignItems: "center", top: `${t.posicionY * 100}%`}}>
      <div
        style={{
          maxWidth: `${t.anchoMax * 100}%`,
          background: tokens.colores.fondoTitular,
          color: tokens.colores.textoTitular,
          fontFamily: `'${tokens.fuentes.titular.familia}', Inter, sans-serif`,
          fontWeight: tokens.fuentes.titular.peso,
          fontSize: t.tamano * s,
          lineHeight: t.interlineado,
          textTransform: t.mayusculas ? "uppercase" : "none",
          textAlign: "center",
          borderRadius: t.radio * s,
          padding: `${t.relleno[0] * s}px ${t.relleno[1] * s}px`,
          opacity: entrada * salida,
          transform: `translateY(${interpolate(entrada, [0, 1], [-30 * s, 0])}px)`,
          letterSpacing: "-0.02em",
          textWrap: "balance",
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

const Subtitulos: React.FC<{grupos: Grupo[]}> = ({grupos}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = frame / fps;
  const g = grupos.find((x) => t >= x.inicio && t < x.fin);
  if (!g) return null;
  const st = tokens.subtitulos;
  const s = width / 1080;
  const local = frame - Math.round(g.inicio * fps);
  const pop = interpolate(local, [0, tokens.animacion.entradaFrames], [tokens.animacion.escalaInicial, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const op = interpolate(local, [0, 3], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{alignItems: "center", top: `${st.posicionY * 100}%`}}>
      <div
        style={{
          maxWidth: `${st.anchoMax * 100}%`,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: `'${tokens.fuentes.subtitulos.familia}', Inter, sans-serif`,
          fontWeight: tokens.fuentes.subtitulos.peso,
          fontSize: st.tamano * s,
          lineHeight: st.interlineado,
          textTransform: st.mayusculas ? "uppercase" : "none",
          textShadow: st.sombra,
          WebkitTextStroke: st.grosorContorno ? `${st.grosorContorno * s}px ${tokens.colores.contornoSubtitulo}` : undefined,
          background: tokens.colores.fondoSubtitulo,
          borderRadius: st.radio * s,
          padding: `${8 * s}px ${18 * s}px`,
          transform: `scale(${pop})`,
          opacity: op,
        }}
      >
        {g.palabras.map((p, i) => {
          const activa = st.resaltarPalabraActiva && t >= p.inicio && (t < p.fin || i === g.palabras.length - 1);
          return (
            <span key={i} style={{color: activa ? tokens.colores.resaltado : tokens.colores.texto}}>
              {p.texto}
              {i < g.palabras.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const EditarVideo: React.FC<EditarVideoProps> = (p) => {
  useFuentes();
  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <Fondo video={p.video} encuadre={p.encuadre} enfoqueX={p.enfoqueX} />
      <Titular {...p.titular} />
      <Subtitulos grupos={p.subtitulos} />
      {p.borrador ? (
        <AbsoluteFill style={{alignItems: "flex-end", justifyContent: "flex-start", padding: 24}}>
          <div style={{background: "rgba(220,38,38,0.85)", color: "#fff", fontFamily: "Inter", fontWeight: 800, fontSize: 28, padding: "6px 14px", borderRadius: 8}}>
            BORRADOR
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const calcularMetadatosEditar: CalculateMetadataFunction<EditarVideoProps> = ({props}) => ({
  durationInFrames: Math.max(1, Math.round(props.duracion * props.fps)),
  fps: props.fps,
});

export const propsEjemploEditar: EditarVideoProps = {
  video: "",
  duracion: 3,
  fps: 30,
  anchoOriginal: 1080,
  altoOriginal: 1920,
  encuadre: "cover",
  enfoqueX: 0.5,
  titular: {texto: "Titular de ejemplo", inicio: 0, duracion: null},
  subtitulos: [],
  borrador: true,
};
