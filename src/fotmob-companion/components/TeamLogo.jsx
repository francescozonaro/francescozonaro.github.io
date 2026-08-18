import { useState } from "react";
import { DEFAULT_TEAM_LOGO } from "../constants";

export function TeamLogo({ url, alt = "", customCss }) {
  const [imgUrl, setImgUrl] = useState(url || DEFAULT_TEAM_LOGO);
  return (
    <img
      src={imgUrl}
      alt={alt}
      className={customCss ? customCss : "w-6 h-6"}
      onError={() => setImgUrl(DEFAULT_TEAM_LOGO)}
    ></img>
  );
}
