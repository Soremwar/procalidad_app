import React, {
  useEffect,
  useRef,
} from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

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

export default ({
  children,
  confirmButtonText = CONFIRM_BUTTON_TEXT,
  error = null,
  handleSubmit,
  is_loading = false,
  is_open,
  setIsOpen,
  size = "sm",
  title,
}) => {
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
            <Button onClick={() => setIsOpen(false)} color="primary">
              Cancelar
            </Button>
            {is_loading
              ? (
                <CircularProgress
                  size={26}
                  className={classes.loginLoader}
                />
              )
              : (
                <Button
                  type="submit"
                  color="primary"
                  onClick={((event) => event.stopPropagation())}
                >
                  {confirmButtonText}
                </Button>
              )}
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};
