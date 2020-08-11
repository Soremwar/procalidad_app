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
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import SelectField from "../../../common/SelectField.jsx";

const relationships = [
  "Madre",
  "Padre",
  "Conyuge",
  "Hij@",
  "Herman@",
  "Otro",
];

const getUserContacts = () => fetchUserApi("contacto/table");
const createUserContact = (
  cellphone,
  name,
  relationship,
) =>
  fetchUserApi("contacto", {
    body: JSON.stringify({
      cellphone,
      employee_relationship: relationship,
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
const updateUserContact = (
  id,
  cellphone,
  name,
  relationship,
) =>
  fetchUserApi(`contacto/${id}`, {
    body: JSON.stringify({
      cellphone,
      employee_relationship: relationship,
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
const deleteUserChildren = async (id) =>
  fetchUserApi(`contacto/${id}`, {
    method: "DELETE",
  });

const ContactEditableRow = ({
  id,
  cellphone,
  name,
  onCancel,
  onSubmit,
  relationship,
}) => {
  const [fields, setFields] = useState({
    cellphone: "",
    name: "",
    relationship: "",
  });

  useEffect(() => {
    setFields({
      cellphone: cellphone || "",
      name: name || "",
      relationship: relationship || "",
    });
  }, []);

  const handleFieldChange = (event) => {
    const { value, name } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const confirmChange = () => {
    let request;
    if (id) {
      request = updateUserContact(
        id,
        fields.cellphone,
        fields.name,
        fields.relationship,
      );
    } else {
      request = createUserContact(
        fields.cellphone,
        fields.name,
        fields.relationship,
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
        console.error("couldnt store/update");
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
          fullWidth
          InputProps={{
            inputProps: {
              maxLength: "255",
            },
          }}
          name="name"
          onChange={handleFieldChange}
          value={fields.name}
        />
      </TableCell>
      <TableCell>
        <TextField
          fullWidth
          InputProps={{
            inputProps: {
              min: "1000000000",
              max: "9999999999",
            },
          }}
          name="cellphone"
          onChange={handleFieldChange}
          type="number"
          value={fields.cellphone}
        />
      </TableCell>
      <TableCell>
        <SelectField
          fullWidth
          name="relationship"
          onChange={handleFieldChange}
          value={fields.relationship}
        >
          {relationships.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </SelectField>
      </TableCell>
    </TableRow>
  );
};

export default function ContactForm() {
  const [contacts, setContacts] = useState([]);

  const updateContactTable = (
    keep_not_saved = true,
  ) => {
    getUserContacts()
      .then(async (response) => {
        if (response.ok) {
          const server_contacts = await response.json();
          setContacts((current_contacts) => {
            return current_contacts.reduce(
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
              server_contacts.map((x) => {
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
        console.error("the table of contacts couldnt be loaded");
      });
  };

  useEffect(() => {
    updateContactTable();
  }, []);

  const setUpdateMode = (id) => {
    setContacts((contacts) =>
      contacts.map((row) => {
        if (row.id === id) {
          row.edit_mode = true;
        }
        return row;
      })
    );
  };

  const setViewMode = (id) => {
    setContacts((contacts) =>
      contacts.map((row) => {
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
    setContacts((contacts) => [...contacts, {
      edit_mode: true,
    }]);
  };

  const deleteRow = (id) => {
    deleteUserChildren(id)
      .then((request) => {
        if (request.ok) {
          updateContactTable();
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
    updateContactTable();
  };

  const onRowCancel = () => {
    updateContactTable(false);
  };

  return (
    <TableContainer component={Paper}>
      <Typography
        component="h2"
        variant="h5"
      >
        Contactos
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
            <TableCell align="center">Telefono</TableCell>
            <TableCell align="center">Parentesco</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.map(({
            cellphone,
            edit_mode,
            employee_relationship,
            id,
            name,
          }, index) =>
            edit_mode
              ? (
                <ContactEditableRow
                  cellphone={cellphone}
                  id={id}
                  key={id || `_${index}`}
                  name={name}
                  onCancel={onRowCancel}
                  onSubmit={(id) => onRowSubmit(id)}
                  relationship={employee_relationship}
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
                    {cellphone}
                  </TableCell>
                  <TableCell align="center">
                    {employee_relationship}
                  </TableCell>
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
