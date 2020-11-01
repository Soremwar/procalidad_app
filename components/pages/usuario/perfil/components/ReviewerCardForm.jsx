import React, { Fragment, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import ObservationsDialog from "../../common/ObservationsDialog.jsx";

const useStyles = makeStyles((theme) => ({
  card: {
    display: "flex",
    width: "100%",
  },
  container: {
    borderRadius: "5px",
    padding: "1px 1.5px 0px 1.5px",
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
  title: {
    paddingBottom: "10px",
  },
}));

const DEFAULT_HELPER_TEXT = "No fue posible completar la solicitud";

/**
 * @callback formReview
 * @param {boolean} approved
 * @param {string=} observations
 * */

/**
 * @param {object} props
 * @param {string | boolean | null} props.helper_text Comments to be displayed regarding the formularty data
 * @param {boolean} props.loading
 * @param {formReview} props.onReview
 * @param {string} props.title
 */
export default function ReviewerCardForm({
  children,
  disabled,
  helper_text: warning,
  loading,
  onReview,
  title,
}) {
  const classes = useStyles();
  const [observations_modal_open, setObservationsModalOpen] = useState(false);

  const helper_text = warning === true ? DEFAULT_HELPER_TEXT : warning || null;

  const handleRejection = () => {
    setObservationsModalOpen(true);
  };

  const handleApproval = () => {
    onReview(true);
  };

  return (
    <Fragment>
      <Grid
        container
        className={classes.container}
        spacing={3}
      >
        <Card
          className={classes.card}
          variant="outlined"
        >
          <form className={classes.form}>
            <CardContent>
              <Typography
                className={classes.title}
                component="h2"
                variant="h5"
              >
                {title}
              </Typography>
              <div className={classes.form_content}>
                <fieldset disabled>
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
                      <Grid container>
                        <Button
                          color="primary"
                          disabled={disabled}
                          onClick={handleRejection}
                        >
                          Rechazar
                        </Button>
                        <Button
                          color="primary"
                          disabled={disabled}
                          onClick={handleApproval}
                        >
                          Aprobar
                        </Button>
                      </Grid>
                    )}
                </Grid>
                <Grid container item md={8} justify="flex-end">
                  {helper_text
                    ? (
                      <Typography
                        className={classes.helper_text}
                        variant="body2"
                      >
                        {helper_text}
                      </Typography>
                    )
                    : null}
                </Grid>
              </Grid>
            </CardActions>
          </form>
        </Card>
      </Grid>
      <ObservationsDialog
        onClose={() => setObservationsModalOpen(false)}
        onConfirm={(observations) => {
          onReview(false, observations);
          setObservationsModalOpen(false);
        }}
        open={observations_modal_open}
      />
    </Fragment>
  );
}
