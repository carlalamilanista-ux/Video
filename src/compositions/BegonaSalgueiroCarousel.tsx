import React from "react";
import {AbsoluteFill, Series, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {FitImage} from "../components/media/FitImage";
import {FONT_FAMILIES, loadDefaultFonts} from "../presets/fonts";
import {secondsToFrames} from "../presets/dimensions";

// Marca: Begoña Salgueiro — blanco, rojo y gris, sin nombre ni membrete.
const DARK = "#1c1c1c";
const RED = "#c1121f";
const GRAY = "#b0b0b0";
const WHITE = "#f5f5f5";

const TOTAL_SLIDES = 5;
const SLIDE_SECONDS = 4;

const CAPTIONS = [
  "Aprendí a comunicarme antes con los animales que con las personas.",
  "Aunque siempre me apasionaron las artes, era tremendamente tímida.",
  "Jamás imaginé que algún día cumpliría mi sueño de convertirme en cantante profesional.",
  "La música me llevó a vivir experiencias que nunca habría imaginado, como trabajar junto a Plácido Domingo.",
  "Hoy, mi gran sueño es otro: ayudar a otros cantantes a convertirse en el artista que siempre han soñado ser.",
];

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({fps, frame: frame - delay, config: {damping: 16, stiffness: 110}});
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const translateY = interpolate(progress, [0, 1], [26, 0]);
  return {opacity, transform: `translateY(${translateY}px)`};
};

const PhotoSlide: React.FC<{index: number; photoSrc?: string; caption: string}> = ({index, photoSrc, caption}) => {
  loadDefaultFonts();
  const textAnim = useEnter(6);

  return (
    <AbsoluteFill style={{backgroundColor: DARK}}>
      {photoSrc ? (
        <FitImage src={staticFile(photoSrc)} fit="cover" kenBurns="zoomIn" kenBurnsIntensity={0.06} />
      ) : (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            border: `2px dashed ${RED}88`,
            margin: 24,
          }}
        >
          <p
            style={{
              fontFamily: FONT_FAMILIES.body,
              color: `${GRAY}`,
              fontSize: 26,
              textAlign: "center",
              maxWidth: "70%",
              lineHeight: 1.5,
            }}
          >
            Inserta aquí la foto {index} (recortada a 1080x1350)
          </p>
        </AbsoluteFill>
      )}

      {/* Scrim + texto legible abajo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "260px 70px 130px",
          background: `linear-gradient(to top, ${DARK} 25%, rgba(28,28,28,0.78) 55%, transparent 100%)`,
        }}
      >
        <div style={{...textAnim, textAlign: "center"}}>
          <div style={{width: 70, height: 3, background: RED, margin: "0 auto 26px"}} />
          <p
            style={{
              fontFamily: FONT_FAMILIES.heading,
              color: WHITE,
              fontSize: 46,
              fontWeight: 700,
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            {caption}
          </p>
        </div>
      </div>

      {/* Contador de diapositiva */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 70,
          fontFamily: FONT_FAMILIES.body,
          color: GRAY,
          fontSize: 24,
          letterSpacing: 2,
          fontWeight: 600,
        }}
      >
        {index}/{TOTAL_SLIDES}
      </div>
    </AbsoluteFill>
  );
};

export interface BegonaSalgueiroCarouselProps {
  /** rutas relativas a public/, p.ej. "assets/begona/foto-1.jpg" */
  photos?: [string?, string?, string?, string?, string?];
}

export const BegonaSalgueiroCarousel: React.FC<BegonaSalgueiroCarouselProps> = ({photos = []}) => {
  const {fps} = useVideoConfig();
  const slideDuration = secondsToFrames(SLIDE_SECONDS, fps);

  return (
    <Series>
      {CAPTIONS.map((caption, i) => (
        <Series.Sequence key={i} durationInFrames={slideDuration}>
          <PhotoSlide index={i + 1} photoSrc={photos[i]} caption={caption} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
