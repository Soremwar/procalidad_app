import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";

/**
 * @callback confirmCallback
 * @param {string} observations
 * */

/**
 * @param {object} props
 * @param {confirmCallback} props.onConfirm
 * */
export default function ObservationsDialog({
  onClose,
  onConfirm,
  open,
}) {
  const [observations, setObservations] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    onConfirm(observations);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      scroll="paper"
    >
      <form
        onSubmit={handleSubmit}
      >
        <DialogTitle>
          Razón de rechazo
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            inputProps={{
              max: 255,
            }}
            multiline
            onChange={(event) => {
              const value = event.target.value;
              setObservations(value);
            }}
            required
            rows={3}
            rowsMax={5}
            value={observations}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            type="submit"
          >
            Enviar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
