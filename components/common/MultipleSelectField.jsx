import React, {
  useState,
} from "react";
import {
  makeStyles,
} from "@material-ui/core/styles";
import {
  Chip,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import hashGenerator from "../../lib/hash_generator/mod.js";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

export default ({
  data,
  id = false,
  fullWidth = false,
  label = null,
  name,
  onChange = false,
  required = false,
  ...props
}) => {
  const classes = useStyles();
  const [values, setValues] = useState([]);
  const [label_id] = useState(hashGenerator(10));

  const handleChange = (event) => setValues(event.target.value);

  return (
    <div>
      <FormControl
        className={classes.formControl}
        fullWidth={fullWidth}
      >
        <InputLabel
          id={label_id}
          required={required}
        >
          {label}
        </InputLabel>
        <Select
          labelId={label_id}
          input={<Input name={name} />}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 224,
                width: 250,
              },
            },
          }}
          multiple
          onChange={(event) => (onChange
            ? onChange(event)
            : handleChange(event))}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {selected.map((id) => (
                <Chip
                  key={id}
                  label={data.find(([entry]) => entry == id)[1]}
                  className={classes.chip}
                />
              ))}
            </div>
          )}
          required={required}
          value={values}
          {...props}
        >
          {data.map(([value, text]) => (
            <MenuItem
              key={value}
              value={value}
            >
              {text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
