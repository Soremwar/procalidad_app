import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";

const reasonDialogStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  title: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
  },
}));

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 */
export default function ConfirmDialog({
  children,
  onConfirm,
  onClose,
  open,
  title,
}) {
  const classes = reasonDialogStyles();

  return (
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <DialogTitle className={classes.title} disableTypography>
        <Typography variant="h6">{title}</Typography>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
