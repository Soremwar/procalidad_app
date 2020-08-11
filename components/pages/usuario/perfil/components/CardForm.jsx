import React, {
  useEffect,
  useState,
  Fragment,
} from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  card: {
    display: "flex",
    width: "100%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "100%",
  },
  form_content: {
    padding: "0 20px 0 20px",
  },
  title: {
    paddingBottom: "10px",
  },
}));

export default function CardForm({
  children,
  onSubmit,
  title,
  variant,
}) {
  const classes = useStyles();

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <Fragment>
      <Grid container spacing={3}>
        <Card
          className={classes.card}
          variant={variant}
        >
          <form
            className={classes.form}
            onSubmit={handleSubmit}
          >
            <CardContent>
              <Typography
                className={classes.title}
                component="h2"
                variant="h5"
              >
                {title}
              </Typography>
              <div className={classes.form_content}>
                {children}
              </div>
            </CardContent>
            <CardActions>
              <Button
                type="submit"
                color="primary"
                onClick={((event) => event.stopPropagation())}
              >
                Confirmar
              </Button>
            </CardActions>
          </form>
        </Card>
      </Grid>
    </Fragment>
  );
}
