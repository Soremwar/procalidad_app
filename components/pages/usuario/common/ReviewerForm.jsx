import React, { Fragment, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ObservationsDialog from "./ObservationsDialog.jsx";

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "100%",
  },
  loginLoader: {
    marginLeft: theme.spacing(4),
  },
}));

const DEFAULT_HELPER_TEXT = "No fue posible completar la solicitud";

/**
 * @callback reviewCallback
 * @param {boolean} approved
 * @param {string=} observations
 * */

/**
 * @param {object} props
 * @param {string | null | boolean} props.helper_text If false or null, no error will be displayed. If an string is passed, it will be displayed as an error. If true, display default error text
 * @param {boolean} props.loading
 * @param {voidCallback} props.onClose
 * @param {reviewCallback} props.onReview
 * @param {boolean} props.open
 * @param {"xs" | "sm" | "md" | "lg" | "xl"} props.size
 * */
export default function ReviewerForm({
  children,
  loading = false,
  helper_text: display_helper_text,
  onClose,
  onReview,
  open,
  size = "sm",
}) {
  const classes = useStyles();
  const [observations_modal_open, setObservationsModalOpen] = useState(false);

  const helper_text = display_helper_text === true
    ? DEFAULT_HELPER_TEXT
    : display_helper_text || null;

  const handleRejection = (event) => {
    event.preventDefault();
    setObservationsModalOpen(true);
  };

  const handleApproval = (event) => {
    event.preventDefault();
    onReview(true);
  };

  return (
    <Fragment>
      <Dialog
        fullWidth
        maxWidth={size}
        onClose={onClose}
        open={open}
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          Actualizar revisión
        </DialogTitle>
        <form
          className={classes.form}
          onSubmit={onReview}
        >
          <DialogContent>
            <fieldset disabled>
              {children}
            </fieldset>
            {helper_text && (
              <Typography
                align="right"
                color="error"
              >
                {helper_text}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            {loading
              ? (
                <CircularProgress
                  size={26}
                  className={classes.loginLoader}
                />
              )
              : (
                <Fragment>
                  <Button
                    color="primary"
                    onClick={handleRejection}
                  >
                    Rechazar
                  </Button>
                  <Button
                    color="primary"
                    onClick={handleApproval}
                  >
                    Aprobar
                  </Button>
                </Fragment>
              )}
          </DialogActions>
        </form>
      </Dialog>
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
