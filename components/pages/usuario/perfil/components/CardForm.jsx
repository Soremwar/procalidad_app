import React, { Fragment } from "react";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  colors,
  Grid,
  Tooltip,
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
  loading_icon: {
    marginLeft: theme.spacing(4),
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
 * @param {boolean} [props.disabled = false]
 * @param {string} props.helper_text Comments to be displayed regarding the formularty data
 * @param {boolean} props.loading
 * @param {formSubmit} props.onSubmit
 * @param {string} [props.title=]
 */
export default function CardForm({
  approved,
  children,
  disabled = false,
  helper_text,
  loading,
  onSubmit,
  title,
}) {
  const classes = useStyles();
  const rejected = !approved && helper_text;

  const card_class_status = approved
    ? classes.container_approved
    : rejected
    ? classes.container_rejected
    : classes.container_pending;

  const icon_text = approved
    ? "Aprobado"
    : rejected
    ? "Rechazado"
    : "En revisión";

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
      <Grid
        container
        className={`${classes.container} ${card_class_status}`}
        spacing={3}
      >
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
                  <Tooltip title={icon_text}>
                    <Avatar className={icon_class_status}>
                      {approved
                        ? <ApprovedIcon />
                        : rejected
                        ? <RejectedIcon />
                        : <PendingIcon />}
                    </Avatar>
                  </Tooltip>
                </Grid>
              </Grid>
              <div className={classes.form_content}>
                <fieldset disabled={disabled}>
                  {children}
                </fieldset>
              </div>
            </CardContent>
            <CardActions>
              <Grid container>
                <Grid item md={4}>
                  {loading
                    ? (
                      <CircularProgress
                        className={classes.loading_icon}
                        size={26}
                      />
                    )
                    : (
                      <Button
                        color="primary"
                        onClick={(event) => event.stopPropagation()}
                        type="submit"
                      >
                        Confirmar
                      </Button>
                    )}
                </Grid>
                <Grid container item md={8} justify="flex-end">
                  <Typography className={classes.helper_text} variant="body2">
                    {helper_text}
                  </Typography>
                </Grid>
              </Grid>
            </CardActions>
          </form>
        </Card>
      </Grid>
    </Fragment>
  );
}
