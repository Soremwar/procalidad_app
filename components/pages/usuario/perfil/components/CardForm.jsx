import React, { Fragment } from "react";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  colors,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  Block as RejectedIcon,
  DoneOutline as ApprovedIcon,
  Timer as PendingIcon,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  card: {
    display: "flex",
    width: "100%",
  },
  container: {
    borderRadius: "5px",
    padding: "1px 1.5px 0px 1.5px",
  },
  container_approved: {
    backgroundImage: "linear-gradient(to bottom, #47B410, #fff)",
  },
  container_pending: {
    backgroundImage: "linear-gradient(to bottom, #ffdb00, #fff)",
  },
  container_rejected: {
    backgroundImage: "linear-gradient(to bottom, #e21835, #fff)",
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
  helper_text: {
    color: colors.red[500],

  },
  icon_approved: {
    backgroundColor: colors.green[500],
    color: "white",
  },
  icon_pending: {
    backgroundColor: colors.yellow[500],
    color: "black",
  },
  icon_rejected: {
    backgroundColor: colors.red[500],
    color: "white",
  },
  title: {
    paddingBottom: "10px",
  },
}));

/**
 * @callback formSubmit
 * @param {React.FormEvent} event
 * */

/**@param {object} props
 * @param {boolean} props.approved
 * @param {string} props.helper_text Conne
 * @param {formSubmit} props.onSubmit
 * @param {string} [props.title=]
 */
export default function CardForm({
  approved,
  children,
 helper_text,
  onSubmit,
  title,
}) {
  const classes = useStyles();
  const rejected = !approved  && helper_text;

  const card_class_status = approved
    ? classes.container_approved
    : rejected
      ? classes.container_rejected
      : classes.container_pending;

  const icon_class_status = approved
    ? classes.icon_approved
    : rejected
      ? classes.icon_rejected
      : classes.icon_pending;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <Fragment>
      <Grid container className={`${classes.container} ${card_class_status}`} spacing={3}>
        <Card
          className={classes.card}
        >
          <form
            className={classes.form}
            onSubmit={handleSubmit}
          >
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6}>
                  <Typography
                    className={classes.title}
                    component="h2"
                    variant="h5"
                  >
                    {title}
                  </Typography>
                </Grid>
                <Grid container item md={6} justify="flex-end">
                  <Avatar className={icon_class_status}>
                    {
                      approved
                        ? <ApprovedIcon/>
                        : rejected
                          ? <RejectedIcon/>
                          : <PendingIcon/>
                    }
                  </Avatar>
                </Grid>
              </Grid>
              <div className={classes.form_content}>
                {children}
              </div>
            </CardContent>
            <CardActions>
              <Grid container>
                <Grid item md={4}>
                  <Button
                    type="submit"
                    color="primary"
                    onClick={((event) => event.stopPropagation())}
                  >
                    Confirmar
                  </Button>
                </Grid>
                <Grid container item md={8} justify="flex-end">
                  <Typography className={classes.helper_text} variant="body2">{helper_text}</Typography>
                </Grid>
              </Grid>
            </CardActions>
          </form>
        </Card>
      </Grid>
    </Fragment>
  );
}
