import React, { Fragment, useEffect, useRef } from "react";
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

const CONFIRM_BUTTON_TEXT = "Guardar";

/**
 * @param {Object} props
 * @param props.disabled This property disables the submit button when set to true
 * */
export default function DialogForm({
  children,
  disabled = false,
  confirmButtonText = CONFIRM_BUTTON_TEXT,
  error = null,
  handleSubmit,
  is_loading = false,
  is_open,
  setIsOpen,
  size = "sm",
  title,
}) {
  const classes = useStyles();

  const submitForm = (event) => {
    event.preventDefault();
    handleSubmit(event);
  };

  const descriptionElementRef = useRef(null);
  useEffect(() => {
    if (is_open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [is_open]);

  return (
    <div>
      <Dialog
        aria-describedby="scroll-dialog-description"
        aria-labelledby="scroll-dialog-title"
        fullWidth
        maxWidth={size}
        onClose={() => setIsOpen(false)}
        open={is_open}
        scroll={"paper"}
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <form
          className={classes.form}
          onSubmit={submitForm}
        >
          <DialogContent>
            {children}
            {error && (
              <Typography
                align="right"
                color="error"
              >
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            {is_loading
              ? (
                <CircularProgress
                  size={26}
                  className={classes.loginLoader}
                />
              )
              : (
                <Fragment>
                  <Button onClick={() => setIsOpen(false)} color="primary">
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    disabled={disabled}
                    type="submit"
                    onClick={((event) => event.stopPropagation())}
                  >
                    {confirmButtonText}
                  </Button>
                </Fragment>
              )}
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
