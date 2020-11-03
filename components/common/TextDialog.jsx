import { makeStyles } from "@material-ui/styles";
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
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
 * @callback confirmationCallback
 * @param {string} reason
 * */

/**
 * @param {object} props
 * @param {confirmationCallback} props.onConfirm
 * @param {boolean} props.open
 * @param {string} props.title
 */
export default function TextDialog({
  onConfirm,
  onClose,
  open,
  title,
}) {
  const classes = reasonDialogStyles();
  const [message, setMessage] = useState("");

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
        <DialogContentText>
          Justifique la razón de rechazo. (El solicitante recibirá un correo con
          esta justificación)
        </DialogContentText>
        <TextField
          fullWidth
          inputProps={{
            maxLength: "255",
          }}
          multiline
          rows="3"
          rowsMax="10"
          onChange={(event) => setMessage(event.target.value)}
          variant="outlined"
          value={message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={() => {
            onConfirm(message);
            onClose();
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
