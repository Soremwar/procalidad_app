import React, {
  useEffect,
  useState,
} from "react";
import {
  Button,
  TextField,
} from "@material-ui/core";
import {
  makeStyles,
} from "@material-ui/styles";
import {
  CloudUpload as UploadIcon,
} from "@material-ui/icons";

const useStyles = makeStyles(() => ({
  input: {
    display: "none",
  },
}));

/*
* This returns a FileList object on the onChange event
*/
export default function InputField({
  accept,
  disabled = false,
  multiple = false,
  onChange,
}) {
  const classes = useStyles();

  return (
    <label>
      <TextField
        accept={accept}
        className={classes.input}
        disabled={disabled}
        multiple={multiple}
        onChange={(event) => onChange(event.target.files)}
        type="file"
      />
      <Button
        disabled={disabled}
        color="primary"
        component="span"
        endIcon={<UploadIcon />}
        variant="contained"
      >
        Cargar Archivo
      </Button>
    </label>
  );
}
