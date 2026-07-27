import React from "react";
import {AbsoluteFill, Series, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {GradientBackground} from "../components/backgrounds/GradientBackground";
import {VideoClip} from "../components/media/VideoClip";
import {FitImage} from "../components/media/FitImage";
import {FONT_FAMILIES, loadDefaultFonts} from "../presets/fonts";
import {secondsToFrames} from "../presets/dimensions";

// Palette: elegant opera/cinema — dark navy with gold, white and celeste accents.
const NAVY: readonly [string, string] = ["#050912", "#0d1a3a"];
const GOLD = "#d4af37";
const CELESTE = "#8ecae6";
const WHITE = "#f5f5f5";

const TOTAL_SLIDES = 7;
const SLIDE_SECONDS = 4;

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({fps, frame: frame - delay, config: {damping: 16, stiffness: 110}});
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const translateY = interpolate(progress, [0, 1], [30, 0]);
  return {opacity, transform: `translateY(${translateY}px)`};
};

const SlideChrome: React.FC<{
  index: number;
  showSwipe?: boolean;
  children: React.ReactNode;
}> = ({index, showSwipe = true, children}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={NAVY} angle={135} type="linear" />

      {/* Inset gold frame */}
      <div
        style={{
          position: "absolute",
          inset: 36,
          border: `1px solid ${GOLD}55`,
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill style={{padding: "90px 80px", justifyContent: "center", alignItems: "center"}}>
        {children}
      </AbsoluteFill>

      {/* Footer: slide counter + swipe indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: FONT_FAMILIES.body,
        }}
      >
        <span style={{color: GOLD, fontSize: 26, letterSpacing: 2, fontWeight: 600}}>
          {index}/{TOTAL_SLIDES}
        </span>
        {showSwipe ? (
          <span style={{color: CELESTE, fontSize: 26, letterSpacing: 2, fontWeight: 600}}>
            Desliza ➔
          </span>
        ) : (
          <span style={{color: CELESTE, fontSize: 26}}>❤</span>
        )}
      </div>
    </AbsoluteFill>
  );
};

const TextSlide: React.FC<{
  eyebrow?: string;
  lines: string[];
  fontSize?: number;
  emphasisColor?: string;
}> = ({eyebrow, lines, fontSize = 56, emphasisColor = GOLD}) => {
  const anim = useEnter(5);

  return (
    <div style={{...anim, textAlign: "center", maxWidth: "88%"}}>
      {eyebrow ? (
        <div
          style={{
            fontFamily: FONT_FAMILIES.body,
            color: emphasisColor,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      {lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily: FONT_FAMILIES.elegant,
            color: WHITE,
            fontSize,
            lineHeight: 1.35,
            margin: i === 0 ? 0 : "20px 0 0",
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
};

// Slide 1 — video hook
const HookSlide: React.FC<{videoSrc?: string}> = ({videoSrc}) => {
  const anim = useEnter(0);

  return (
    <AbsoluteFill style={{justifyContent: "flex-end"}}>
      <AbsoluteFill style={{margin: 36, overflow: "hidden"}}>
        {videoSrc ? (
          // Recorte a partir del minuto 3:34 del aria "The Diva Dance" (El Quinto Elemento)
          <VideoClip src={staticFile(videoSrc)} trimStartSeconds={214} fit="cover" />
        ) : (
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              background: "#0a1428",
              border: `2px dashed ${GOLD}88`,
            }}
          >
            <p
              style={{
                fontFamily: FONT_FAMILIES.body,
                color: `${GOLD}cc`,
                fontSize: 28,
                textAlign: "center",
                maxWidth: "70%",
                lineHeight: 1.5,
              }}
            >
              Inserta aquí el clip de vídeo{"\n"}("The Diva Dance", min. 3:34)
            </p>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      <div
        style={{
          ...anim,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "220px 80px 160px",
          background: "linear-gradient(to top, #050912 20%, rgba(5,9,18,0.75) 55%, transparent 100%)",
        }}
      >
        <p
          style={{
            fontFamily: FONT_FAMILIES.elegant,
            color: WHITE,
            fontSize: 50,
            lineHeight: 1.35,
            textAlign: "center",
            margin: 0,
          }}
        >
          ¿Sabías que la mítica <span style={{color: GOLD}}>"Diva Dance"</span> de{" "}
          <em>El Quinto Elemento</em> no es solo una pieza de ciencia ficción?
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Slide 7 — real photo
const PhotoSlide: React.FC<{photoSrc?: string}> = ({photoSrc}) => {
  const anim = useEnter(5);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{margin: 36, overflow: "hidden"}}>
        {photoSrc ? (
          <FitImage src={staticFile(photoSrc)} fit="cover" />
        ) : (
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              background: "#0a1428",
              border: `2px dashed ${GOLD}88`,
            }}
          >
            <p
              style={{
                fontFamily: FONT_FAMILIES.body,
                color: `${GOLD}cc`,
                fontSize: 28,
                textAlign: "center",
                maxWidth: "70%",
              }}
            >
              Inserta aquí la fotografía original (JPG intacto, sin generar rostros por IA)
            </p>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      <div
        style={{
          ...anim,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "220px 70px 150px",
          background: "linear-gradient(to top, #050912 25%, rgba(5,9,18,0.7) 55%, transparent 100%)",
        }}
      >
        <p
          style={{
            fontFamily: FONT_FAMILIES.elegant,
            color: WHITE,
            fontSize: 42,
            lineHeight: 1.4,
            textAlign: "center",
            margin: 0,
          }}
        >
          Hay encuentros que te recuerdan por qué merece la pena dedicar una vida a la música.
          {"\n"}
          <span style={{color: GOLD}}>Gracias, Inva Mula. ❤️</span>
        </p>
      </div>
    </AbsoluteFill>
  );
};

export interface InvaMulaCarouselProps {
  /** e.g. "assets/diva-dance-clip.mp4" — clip trimmed from 3:34 of "The Diva Dance" */
  videoSrc?: string;
  /** e.g. "assets/inva-mula-encuentro.jpg" — the original photo, untouched */
  photoSrc?: string;
}

export const InvaMulaCarousel: React.FC<InvaMulaCarouselProps> = ({videoSrc, photoSrc}) => {
  const {fps} = useVideoConfig();
  const slideDuration = secondsToFrames(SLIDE_SECONDS, fps);

  return (
    <Series>
      <Series.Sequence durationInFrames={slideDuration}>
        <SlideChrome index={1}>
          <HookSlide videoSrc={videoSrc} />
        </SlideChrome>
      </Series.Sequence>

      <Series.Sequence durationInFrames={slideDuration}>
        <SlideChrome index={2}>
          <TextSlide
            eyebrow="La interpretación se divide en dos partes"
            lines={["🎭 Un aria de inspiración operística.", "🎧 Y una parte de pop electrónico moderna llamada 'The Diva Dance'."]}
            fontSize={50}
          />
        </SlideChrome>
      </Series.Sequence>

      <Series.Sequence durationInFrames={slideDuration}>
        <SlideChrome index={3}>
          <TextSlide
            lines={[
              "La película fue dirigida por Luc Besson, y el personaje de la Diva Plavalaguna fue interpretado en pantalla por la actriz Maïwenn.",
            ]}
            fontSize={54}
          />
        </SlideChrome>
      </Series.Sequence>

      <Series.Sequence durationInFrames={slideDuration}>
        <SlideChrome index={4}>
          <TextSlide
            lines={["Pero la voz que hizo historia fue la de la extraordinaria soprano", "Inva Mula."]}
            fontSize={58}
          />
        </SlideChrome>
      </Series.Sequence>

      <Series.Sequence durationInFrames={slideDuration}>
        <SlideChrome index={5}>
          <TextSlide lines={["Y aquí viene lo más especial para mí…"]} fontSize={64} emphasisColor={CELESTE} />
        </SlideChrome>
      </Series.Sequence>

      <Series.Sequence durationInFrames={slideDuration}>
        <SlideChrome index={6}>
          <TextSlide
            lines={[
              "❤️ Tuve el enorme privilegio de trabajar con Inva Mula.",
              "Además de ser una artista impresionante, es una persona cercana, elegante y tremendamente generosa.",
              "Son esos regalos que me ha dado la música y que siempre guardaré con muchísimo cariño.",
            ]}
            fontSize={44}
          />
        </SlideChrome>
      </Series.Sequence>

      <Series.Sequence durationInFrames={slideDuration}>
        <SlideChrome index={7} showSwipe={false}>
          <PhotoSlide photoSrc={photoSrc} />
        </SlideChrome>
      </Series.Sequence>
    </Series>
  );
};
