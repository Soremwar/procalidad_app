import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";

/**
 * @callback voidCallback
 * @return {void}
 * */

/**
 * @param {object} props
 * @param {voidCallback} props.onClose Will be called when the dialog is cancelled or clicked outside
 * @param {voidCallback} props.onConfirm Will be called when the dialog is confirmed
 * @param {boolean} props.open
 * */
export default function FileReviewDialog({
  onClose,
  onConfirm,
  open,
}) {
  const handleConfirm = () => {
    onClose();
    onConfirm();
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
    >
      <DialogContent>
        <DialogContentText style={{ whiteSpace: "pre-line" }}>
          Este formulario solo será revisado por recursos humanos después de que
          usted cargue el soporte correspondiente
          <br />
          <br />
          ¿Desea continuar?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
