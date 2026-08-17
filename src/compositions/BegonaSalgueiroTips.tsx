import React from "react";
import {AbsoluteFill, Series, staticFile, Img, useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {GridPattern} from "../components/backgrounds/GridPattern";
import {FONT_FAMILIES, loadDefaultFonts} from "../presets/fonts";
import {secondsToFrames} from "../presets/dimensions";

// Plantilla "tip numerado" para Begoña Salgueiro — fondo crema con grid,
// barra roja lateral, número gigante, titular y frase de impacto en rojo.
const CREAM = "#f0ece3";
const RED = "#cc1f28";
const INK = "#161311";

export interface BegonaTipSlideProps {
  number: number;
  eyebrow: string[];
  headline: string;
  body: string[];
  emphasis: string;
  signature?: string;
  logoSrc?: string;
}

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({fps, frame: frame - delay, config: {damping: 18, stiffness: 120}});
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const translateY = interpolate(progress, [0, 1], [20, 0]);
  return {opacity, transform: `translateY(${translateY}px)`};
};

export const BegonaTipSlide: React.FC<BegonaTipSlideProps> = ({
  number,
  eyebrow,
  headline,
  body,
  emphasis,
  signature = "BEGOÑA SALGUEIRO",
  logoSrc,
}) => {
  loadDefaultFonts();
  const headerAnim = useEnter(0);
  const bodyAnim = useEnter(8);
  const emphasisAnim = useEnter(16);

  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <GridPattern type="lines" spacing={42} size={1} color="rgba(22,19,17,0.06)" />

      {/* Barra roja lateral */}
      <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 16, background: RED}} />

      <AbsoluteFill style={{padding: "70px 64px 60px 92px"}}>
        {/* Cabecera: número + eyebrow */}
        <div style={{...headerAnim, display: "flex", alignItems: "flex-start", gap: 24}}>
          <span
            style={{
              fontFamily: FONT_FAMILIES.heading,
              fontWeight: 800,
              color: RED,
              fontSize: 220,
              lineHeight: 0.8,
              margin: 0,
            }}
          >
            {number}
          </span>
          <span
            style={{
              fontFamily: FONT_FAMILIES.heading,
              fontWeight: 800,
              color: INK,
              fontSize: 52,
              lineHeight: 1.05,
              textTransform: "uppercase",
              marginTop: 14,
            }}
          >
            {eyebrow.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </span>
        </div>

        {/* Titular principal */}
        <div style={{...headerAnim, textAlign: "center", marginTop: 34}}>
          <p
            style={{
              fontFamily: FONT_FAMILIES.heading,
              fontWeight: 700,
              color: INK,
              fontSize: 58,
              lineHeight: 1.22,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {headline}
          </p>
        </div>

        {/* Cuerpo */}
        <div style={{...bodyAnim, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34}}>
          {body.map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontFamily: FONT_FAMILIES.body,
                fontWeight: 600,
                color: INK,
                fontSize: 33,
                lineHeight: 1.4,
                textAlign: "center",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Frase de impacto en rojo */}
        <div style={{...emphasisAnim, textAlign: "center", marginBottom: 40}}>
          <p
            style={{
              fontFamily: FONT_FAMILIES.heading,
              fontWeight: 800,
              color: RED,
              fontSize: 40,
              lineHeight: 1.3,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {emphasis}
          </p>
        </div>

        {/* Pie: firma + logo */}
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end"}}>
          <span
            style={{
              fontFamily: FONT_FAMILIES.heading,
              fontWeight: 800,
              color: INK,
              fontSize: 28,
              textTransform: "uppercase",
            }}
          >
            {signature}
          </span>

          {logoSrc ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 12,
                padding: 10,
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              }}
            >
              <Img src={staticFile(logoSrc)} style={{width: 90, height: "auto", display: "block"}} />
            </div>
          ) : (
            <div
              style={{
                width: 96,
                height: 110,
                border: `2px dashed ${RED}88`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <span style={{fontFamily: FONT_FAMILIES.body, color: RED, fontSize: 13}}>LOGO</span>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export interface BegonaSalgueiroTipsProps {
  slides?: BegonaTipSlideProps[];
  logoSrc?: string;
}

const DEFAULT_SLIDES: BegonaTipSlideProps[] = [
  {
    number: 5,
    eyebrow: ["APRENDE A", "ENTRENAR"],
    headline: "Repetir ejercicios no significa entrenar bien.",
    body: [
      "Primero tienes que empezar a entender tu cuerpo y reconocer qué estás haciendo.",
      "Si entrenas desde la rigidez, repites la rigidez.",
      "Y ahí aparecen los resultados lentos, el estancamiento y la frustración.",
    ],
    emphasis: "Entrenar bien es saber qué estás entrenando y para qué.",
  },
];

export const BegonaSalgueiroTips: React.FC<BegonaSalgueiroTipsProps> = ({slides = DEFAULT_SLIDES, logoSrc}) => {
  const {fps} = useVideoConfig();
  const slideDuration = secondsToFrames(5, fps);

  return (
    <Series>
      {slides.map((slide, i) => (
        <Series.Sequence key={i} durationInFrames={slideDuration}>
          <BegonaTipSlide {...slide} logoSrc={slide.logoSrc ?? logoSrc} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
