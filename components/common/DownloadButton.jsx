import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { GetApp as DownloadIcon } from "@material-ui/icons";

/**
 * @param {object} params
 * @param {"inherit" | "primary" | "secondary" | "default"} [params.color = "primary"]\
 * @param {boolean} params.disabled
 * @param {string} params.href
 * */
export default function DownloadButton({
  color = "primary",
  disabled = false,
  href,
}) {
  return (
    <Tooltip title="Descargar">
      <IconButton
        color="primary"
        component="a"
        disabled={disabled}
        href={href}
        target={"_blank"}
        variant="contained"
      >
        <DownloadIcon />
      </IconButton>
    </Tooltip>
  );
}
