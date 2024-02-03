import React from "react";

import DaisyLogo from "./daisy-logo.svg"
import DaisyLogoWithWord from "./daisy-logo-with-word.svg";
import DaisyWord from "./daisy-word.svg";
import EllipsesGroup from './ellipses-group.svg'
import Microphone from "./microphone.svg"
import Stars from "./stars.svg"


type ImageProps = React.HTMLAttributes<HTMLImageElement>;

export const DaisyLogoImage = (props: ImageProps) => {
  return <img {...props} src={DaisyLogo} alt="" />;
};

export const DaisyLogoWithWordImage = (props: ImageProps) => {
  return <img {...props} src={DaisyLogoWithWord} alt="" />;
};

export const DaisyWordImage = (props: ImageProps) => {
  return <img {...props} src={DaisyWord} alt="" />;
};

export const EllipsesGroupImage = (props: ImageProps) => {
  return <img {...props} src={EllipsesGroup} alt="" />;
}

export const MicrophoneImage = (props: ImageProps) => {
  return <img {...props} src={Microphone} alt="" />;
}

export const StarsImage = (props: ImageProps) => {
  return <img {...props} src={Stars} alt="" />
}