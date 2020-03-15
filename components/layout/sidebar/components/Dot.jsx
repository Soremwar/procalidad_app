import React from "react";
import { makeStyles, useTheme } from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
  dotBase: {
    width: 5,
    height: 5,
    backgroundColor: theme.palette.text.hint,
    borderRadius: "50%",
    transition: theme.transitions.create("background-color")
  },
  dotLarge: {
    width: 8,
    height: 8
  }
})
);

export default function Dot({ size, color }) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div
      className={[
        classes.dotBase,
        ...(size === "large" ? [classes.dotLarge] : [])
      ].join(" ")}
      style={{
        backgroundColor: color && theme.palette[color]?.main
      }}
    />
  );
}
