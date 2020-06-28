import React, {
  useEffect,
  useState,
} from "react";
import {
  FormControl,
  TextField,
} from "@material-ui/core";
import {
  makeStyles,
} from "@material-ui/styles";
import {
  Autocomplete,
} from "@material-ui/lab";

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 120,
  },
}));

export default ({
  fullWidth = false,
  onChange,
  options = [],
  variant = "standard",
}) => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [search_string, setSearchString] = useState("");
  const [value, setValue] = useState("");

  //Dont open on input click
  const handleOpen = ({ type }) => type === "click" && setOpen(true);

  //Dont close on input click
  const handleClose = ({ type }) => {
    if (["blur", "click", "keydown"].includes(type)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    setSearchString("");
  }, [value]);

  useEffect(() => {
    onChange({ [value]: search_string });
  }, [search_string, value]);

  return (
    <FormControl className={classes.formControl} fullWidth={fullWidth}>
      <Autocomplete
        disabled={!options.length}
        getOptionLabel={() => search_string}
        getOptionSelected={(option) => option.id === value}
        onChange={(_event, option) => setValue(option?.id || "")}
        onClose={handleClose}
        onInputChange={(_event, value) => setSearchString(value)}
        onOpen={handleOpen}
        open={open}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            label={options.find(({ id }) => id === value)?.label || ""}
            variant={variant}
          />
        )}
        renderOption={(option) => option.label}
        value={value === "" ? null : value}
      />
    </FormControl>
  );
};
