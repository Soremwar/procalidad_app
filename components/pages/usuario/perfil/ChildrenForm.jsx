import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Close as CancelIcon,
  Check as ConfirmIcon,
  Create as EditIcon,
  Remove as RemoveIcon,
} from "@material-ui/icons";
import {
  fetchGenderApi,
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import {
  parseStandardString,
} from "../../../../lib/date/mod.js";
import SelectField from "../../../common/SelectField.jsx";

const getGenders = () => fetchGenderApi().then((x) => x.json());

const getUserChildren = () => fetchUserApi("hijos/table");
const createUserChildren = (
  gender,
  name,
  born_date,
) =>
  fetchUserApi(`hijos`, {
    body: JSON.stringify({
      gender,
      name,
      born_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
const updateUserChildren = (
  id,
  gender,
  name,
  born_date,
) =>
  fetchUserApi(`hijos/${id}`, {
    body: JSON.stringify({
      gender,
      name,
      born_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
const deleteUserChildren = async (id) =>
  fetchUserApi(`hijos/${id}`, {
    method: "DELETE",
  });

const ParameterContext = createContext({
  genders: [],
});

const ChildrenEditableRow = ({
  born_date,
  id,
  gender,
  name,
  onCancel,
  onSubmit,
}) => {
  const { genders } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    gender: "",
    name: "",
    born_date: "",
  });

  useEffect(() => {
    //Weird defaults, but needed to post
    setFields({
      gender: gender || genders?.[0]?.id || "",
      name,
      born_date,
    });
  }, []);

  const handleFieldChange = (event) => {
    const { value, name } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const confirmChange = () => {
    let request;
    if (id) {
      request = updateUserChildren(
        id,
        fields.gender,
        fields.name,
        fields.born_date,
      );
    } else {
      request = createUserChildren(
        fields.gender,
        fields.name,
        fields.born_date,
      );
    }

    request
      .then((request) => {
        if (request.ok) {
          onSubmit(id);
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        onCancel();
        console.error("cant confirm");
      });
  };

  return (
    <TableRow>
      <TableCell align="center">
        <IconButton
          color="primary"
          onClick={onCancel}
        >
          <CancelIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={confirmChange}
        >
          <ConfirmIcon />
        </IconButton>
      </TableCell>
      <TableCell>
        <TextField
          name="name"
          onChange={handleFieldChange}
          value={fields.name}
        />
      </TableCell>
      <TableCell align="center" component="th" scope="row">
        <SelectField
          blank_value={false}
          name="gender"
          onChange={handleFieldChange}
          value={fields.gender}
        >
          {genders.length
            ? (
              genders.map(({ id, name }, index) => (
                <option key={id} value={id} defaultValue={index === 0}>
                  {name}
                </option>
              ))
            )
            : <option disabled>No hay generos configurados</option>}
        </SelectField>
      </TableCell>
      <TableCell align="center">
        <TextField
          name="born_date"
          onChange={handleFieldChange}
          type="date"
          value={fields.born_date}
        />
      </TableCell>
    </TableRow>
  );
};

export default function ChildrenForm() {
  const [children, setChildren] = useState([]);
  const [context_parameters, setContextParameters] = useState({
    genders: [],
  });

  const updateUserChildren = (
    keep_not_saved = true,
  ) => {
    getUserChildren()
      .then(async (response) => {
        if (response.ok) {
          const server_children = await response.json();
          setChildren((current_children) => {
            return current_children.reduce(
              (rows, x) => {
                const match = rows.findIndex((row) =>
                  row.id === x.id && x.edit_mode
                );
                if (match) {
                  rows[match] = x;
                }
                if (keep_not_saved && !x.id && x.edit_mode) {
                  rows.push(x);
                }
                return rows;
              },
              server_children.map((x) => {
                x.edit_mode = false;
                return x;
              }),
            );
          });
        } else {
          throw new Error();
        }
      })
      .catch((e) => {
        console.error("this should call to the notification component");
      });
  };

  useEffect(() => {
    getGenders().then((genders) =>
      setContextParameters((parameters) => ({ ...parameters, genders }))
    );
    updateUserChildren();
  }, []);

  const setUpdateMode = (id) => {
    setChildren((children) =>
      children.map((row) => {
        if (row.id === id) {
          row.edit_mode = true;
        }
        return row;
      })
    );
  };

  const setViewMode = (id) => {
    setChildren((children) =>
      children.map((row) => {
        if (row.id === id) {
          row.edit_mode = false;
        }
        return row;
      })
    );
  };

  /*
  * Seems ugly, but works perfectly
  */
  const createRow = () => {
    setChildren((children) => [...children, {
      edit_mode: true,
    }]);
  };

  const deleteRow = (id) => {
    deleteUserChildren(id)
      .then((request) => {
        if (request.ok) {
          updateUserChildren();
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        console.error("Couldnt delete");
      });
  };

  const onRowSubmit = (row) => {
    setViewMode(row);
    updateUserChildren();
  };

  const onRowCancel = () => {
    updateUserChildren(false);
  };

  const getAgeFromBirthDate = (birth_date) => {
    const diff_ms = Date.now() - birth_date.getTime();
    const diff_in_years = new Date(diff_ms);
    return Math.abs(diff_in_years.getUTCFullYear() - 1970);
  };

  return (
    <TableContainer component={Paper}>
      <Typography
        component="h2"
        variant="h5"
      >
        Hijos
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <IconButton
                color="primary"
                component="span"
                onClick={createRow}
              >
                <AddIcon />
              </IconButton>
            </TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell align="center">Genero</TableCell>
            <TableCell align="center">Edad</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <ParameterContext.Provider value={context_parameters}>
            {children.map(({
              born_date,
              id,
              edit_mode,
              gender,
              gender_id,
              name,
            }, index) =>
              edit_mode
                ? (
                  <ChildrenEditableRow
                    born_date={born_date}
                    id={id}
                    key={id || `_${index}`}
                    gender={gender_id}
                    name={name}
                    onCancel={onRowCancel}
                    onSubmit={(id) => onRowSubmit(id)}
                  />
                )
                : (
                  <TableRow key={id}>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => setUpdateMode(id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => deleteRow(id)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {name}
                    </TableCell>
                    <TableCell align="center">
                      {gender}
                    </TableCell>
                    <TableCell align="center">
                      {getAgeFromBirthDate(parseStandardString(born_date))}
                    </TableCell>
                  </TableRow>
                )
            )}
          </ParameterContext.Provider>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
