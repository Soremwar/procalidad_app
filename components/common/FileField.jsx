import React from "react";
import {
  Button,
  CircularProgress,
  TextField,
} from "@material-ui/core";
import {
  makeStyles,
} from "@material-ui/styles";
import {
  Publish as UploadIcon,
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
  label,
  loading = false,
  multiple = false,
  onChange,
}) {
  const classes = useStyles();

  return (
    <label>
      <TextField
        className={classes.input}
        disabled={disabled}
        inputProps={{
          accept,
        }}
        multiple={multiple}
        onChange={(event) => onChange(event.target.files)}
        type="file"
      />
      <Button
        disabled={disabled}
        color="primary"
        component="span"
        endIcon={loading
          ? <CircularProgress
            color="secondary"
            size="1.5rem"
          />
          : <UploadIcon />}
        variant="contained"
      >
        {label}
      </Button>
    </label>
  );
}
