import React from "react";
import { Grid, Paper, Typography, Button } from "@material-ui/core";
import { Link } from "react-router-dom";

// styles
import createStyles from "./styles.js";

export default () => {
  const classes = createStyles();

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img
          src={"/resources/img/login_icon.png"}
          alt="PROCALIDAD_APP_LOGO"
          className={classes.logotypeImage}
        />
        <Typography
          variant="h3"
          color="textPrimary"
          className={classes.logotypeText}
        >
          {/*TODO rename to app name*/}
          Procalidad APP
        </Typography>
      </div>
      <Paper classes={{ root: classes.paperRoot }}>
        <Typography
          variant="h1"
          color="primary"
          className={[classes.textRow, classes.errorCode].join(" ")}
        >
          404
        </Typography>
        <Typography variant="h5" color="primary" className={classes.textRow}>
          La página a la que intentas acceder no existe!
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          className={[classes.textRow, classes.safetyText].join(" ")}
        >
          Pero estamos aqui para llevarte de vuelta a nuestra aplicación
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          size="large"
          className={classes.backButton}
        >
          Volver al Inicio
        </Button>
      </Paper>
    </Grid>
  );
};
