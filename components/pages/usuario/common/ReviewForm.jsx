import React, { Fragment, useState } from "react";
import {
  Button,
  CircularProgress,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import ReviewDialog from "./ReviewDialog.jsx";

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "100%",
  },
  helper_text: {
    color: colors.red[500],
  },
  loginLoader: {
    marginLeft: theme.spacing(4),
  },
}));

const LOCKED_FORM_WARNING =
  "Esta información se encuentra en revisión por parte del equipo de recursos humanos. No podrá realizar modificaciones hasta que este proceso finalice";

/**
 * @callback voidCallback
 * @return {void}
 * */

/**
 * @callback beforeSubmit
 * @param {voidCallback} callback
 * @return {void}
 * */

/**
 * Default value, simply skips all operations and directly calls the main function
 * */
const DEFAULT_BEFORE_SUBMIT = (call_me) => {
  call_me();
};

/**
 * @callback formHandler
 * @param {React.FormEvent} event
 * @return {void}
 * */

/**
 * @param {object} props
 * @param {boolean} props.approved
 * @param {string} props.comments
 * @param {string} props.helper_text
 * @param {boolean} props.loading
 * @param {beforeSubmit} props.onBeforeSubmit This function will be called once the formulary has been validated and right before the approval dialog is shown
 * @param {voidCallback} props.onClose
 * @param {formHandler} props.onSubmit This function will be called after the approval dialog is shown and confirmed
 * @param {boolean} props.open
 * @param {"xs" | "sm" | "md" | "lg" | "xl"} props.size
 * */
export default function ReviewForm({
  approved,
  children,
  comments,
  helper_text,
  loading = false,
  onBeforeSubmit = DEFAULT_BEFORE_SUBMIT,
  onClose,
  onSubmit,
  open,
  size = "sm",
  title,
}) {
  const classes = useStyles();
  const [review_modal_open, setReviewModalOpen] = useState(false);
  const [form_event, setFormEvent] = useState(null);

  const pending = !approved && !comments;

  /**
   * @param {React.FormEvent} event
   * */
  const handleSubmit = (event) => {
    event.preventDefault();
    onBeforeSubmit(() => {
      setFormEvent(event);
      setReviewModalOpen(true);
    });
  };

  return (
    <Fragment>
      <Dialog
        fullWidth
        maxWidth={size}
        onClose={onClose}
        open={open}
        scroll={"paper"}
      >
        <DialogTitle id="form-dialog-title">
          <Grid container spacing={3}>
            <Grid item md={4}>{title}</Grid>
            <Grid container item md={8} justify="flex-end">
              <Typography className={classes.helper_text} variant="body2">
                {pending ? LOCKED_FORM_WARNING : comments}
              </Typography>
            </Grid>
          </Grid>
        </DialogTitle>
        <form
          className={classes.form}
          onSubmit={handleSubmit}
        >
          <DialogContent>
            {children}
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
            <Button onClick={onClose} color="primary">
              Cancelar
            </Button>
            {loading
              ? (
                <CircularProgress
                  size={26}
                  className={classes.loginLoader}
                />
              )
              : (
                <Button
                  color="primary"
                  disabled={pending}
                  onClick={(event) => event.stopPropagation()}
                  type="submit"
                >
                  Guardar
                </Button>
              )}
          </DialogActions>
        </form>
      </Dialog>
      <ReviewDialog
        approved={approved}
        onClose={() => setReviewModalOpen(false)}
        onConfirm={() => onSubmit(form_event)}
        open={review_modal_open}
      />
    </Fragment>
  );
}
