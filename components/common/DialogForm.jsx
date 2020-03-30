import React from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  loginLoader: {
    marginLeft: theme.spacing(4),
  },
})
);

const CONFIRM_BUTTON_TEXT = "Guardar";

export default ({
  children,
  confirmButtonText = CONFIRM_BUTTON_TEXT,
  error,
  handleSubmit,
  is_loading,
  is_open,
  setIsOpen,
  title,
}) => {
  const classes = useStyles();

  const submitForm = (event) => {
    event.preventDefault();
    handleSubmit(event);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
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
        open={is_open}
        onClose={() => setIsOpen(false)}
        scroll={"paper"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <form onSubmit={submitForm}>
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
                <Button type="submit" color="primary">
                  {confirmButtonText}
                </Button>
              )}
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};
