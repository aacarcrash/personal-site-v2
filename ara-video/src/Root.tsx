import React from "react";
import { Composition } from "remotion";
import { Pitch, PITCH_DURATION, FPS } from "./Pitch";

export const Root: React.FC = () => (
  <Composition
    id="main"
    component={Pitch}
    durationInFrames={PITCH_DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
