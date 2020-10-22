import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";

const ALREADY_REVIEWED_WARNING =
  "Esta información ya se encuentra aprobada por el equipo de recursos humanos.\n Al modificarla, esta será revisada nuevamente antes de ser incluida en su hoja de vida";
const TO_BE_REVIEWED_WARNING =
  "La información en este formulario será revisada por el equipo de recursos humanos antes de ser incluida en su hoja de vida";

/**
 * @callback voidCallback
 * @return {void}
 * */

/**
 * @param {object} props
 * @param {voidCallback} props.onClose Will be called when the dialog is cancelled or clicked outside
 * @param {voidCallback} props.onConfirm Will be called when the dialog is confirmed
 * @param {boolean} props.open
 * @param {boolean} props.reviewed This prop indicates if data was already reviewed, it will change the text displayed
 * */
export default function ReviewDialog({
  onClose,
  onConfirm,
  open,
  reviewed,
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
          {reviewed ? ALREADY_REVIEWED_WARNING : TO_BE_REVIEWED_WARNING}
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
