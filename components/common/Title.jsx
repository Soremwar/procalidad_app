import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "./Wrappers.jsx";

const useStyles = makeStyles((theme) => ({
  pageTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(5),
  },
  typo: {
    color: theme.palette.text.hint,
  },
  button: {
    boxShadow: theme.customShadows.widget,
    textTransform: "none",
    "&:active": {
      boxShadow: theme.customShadows.widgetWide,
    },
  },
}));

export default ({ title, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.pageTitleContainer}>
      <Typography className={classes.typo} variant="h1" size="sm">
        {title}
      </Typography>
      {children}
    </div>
  );
};
