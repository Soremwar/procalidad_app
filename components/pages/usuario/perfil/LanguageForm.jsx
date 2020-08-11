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
  fetchLanguageApi,
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import SelectField from "../../../common/SelectField.jsx";

const getLanguages = () => fetchLanguageApi().then((x) => x.json());

const getUserLanguages = () => fetchUserApi("idiomas/table");
const createUserLanguage = (
  language,
  listen_skill,
  read_skill,
  talk_skill,
  write_skill,
) =>
  fetchUserApi(`idiomas`, {
    body: JSON.stringify({
      language,
      listen_skill,
      read_skill,
      talk_skill,
      write_skill,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
const updateUserLanguage = (
  id,
  language,
  listen_skill,
  read_skill,
  talk_skill,
  write_skill,
) =>
  fetchUserApi(`idiomas/${id}`, {
    body: JSON.stringify({
      language,
      listen_skill,
      read_skill,
      talk_skill,
      write_skill,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
const deleteUserLanguage = async (id) =>
  fetchUserApi(`idiomas/${id}`, {
    method: "DELETE",
  });

const ParameterContext = createContext({
  languages: [],
});

const LanguageSkill = new Map([
  ["A", "Aceptable"],
  ["B", "Bueno"],
  ["D", "Deficiente"],
]);

const LanguageSelect = ({
  name,
  onChange,
  value,
}) => (
  <SelectField
    blank_value={false}
    name={name}
    onChange={onChange}
    value={value}
  >
    {Array.from(LanguageSkill).map(([value, text]) => (
      <option key={value} value={value}>{text}</option>
    ))}
  </SelectField>
);

const LanguageEditableRow = ({
  id,
  language,
  listen_skill,
  onCancel,
  onSubmit,
  read_skill,
  talk_skill,
  write_skill,
}) => {
  const { languages } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    language: "",
    listen_skill: "",
    read_skill: "",
    talk_skill: "",
    write_skill: "",
  });

  useEffect(() => {
    //Weird defaults, but needed to post
    setFields({
      language: language || languages[0].id,
      listen_skill: listen_skill || Array.from(LanguageSkill)[0][0],
      read_skill: read_skill || Array.from(LanguageSkill)[0][0],
      talk_skill: talk_skill || Array.from(LanguageSkill)[0][0],
      write_skill: write_skill || Array.from(LanguageSkill)[0][0],
    });
  }, []);

  const handleFieldChange = (event) => {
    const { value, name } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const confirmChange = () => {
    let request;
    if (id) {
      request = updateUserLanguage(
        id,
        fields.language,
        fields.listen_skill,
        fields.read_skill,
        fields.talk_skill,
        fields.write_skill,
      );
    } else {
      request = createUserLanguage(
        fields.language,
        fields.listen_skill,
        fields.read_skill,
        fields.talk_skill,
        fields.write_skill,
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
      <TableCell component="th" scope="row">
        <SelectField
          blank_value={false}
          name="language"
          onChange={handleFieldChange}
          value={fields.language}
        >
          {languages.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </SelectField>
      </TableCell>
      <TableCell align="center">
        <LanguageSelect
          name="read_skill"
          onChange={handleFieldChange}
          value={fields.read_skill}
        />
      </TableCell>
      <TableCell align="center">
        <LanguageSelect
          name="write_skill"
          onChange={handleFieldChange}
          value={fields.write_skill}
        />
      </TableCell>
      <TableCell align="center">
        <LanguageSelect
          name="talk_skill"
          onChange={handleFieldChange}
          value={fields.talk_skill}
        />
      </TableCell>
      <TableCell align="center">
        <LanguageSelect
          name="listen_skill"
          onChange={handleFieldChange}
          value={fields.listen_skill}
        />
      </TableCell>
    </TableRow>
  );
};

export default function LanguageForm() {
  const [languages, setLanguages] = useState([]);
  const [context_parameters, setContextParameters] = useState({
    languages: [],
  });

  const updateUserLanguages = (
    keep_not_saved = true,
  ) => {
    getUserLanguages()
      .then(async (response) => {
        if (response.ok) {
          const server_languages = await response.json();
          setLanguages((current_languages) => {
            return current_languages.reduce(
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
              server_languages.map((x) => {
                x.edit_mode = false;
                return x;
              }),
            );
          });
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        console.error("this should a call to the notification component");
      });
  };

  useEffect(() => {
    getLanguages().then((languages) =>
      setContextParameters((parameters) => ({ ...parameters, languages }))
    );
    updateUserLanguages();
  }, []);

  const setUpdateMode = (id) => {
    setLanguages((languages) =>
      languages.map((row) => {
        if (row.id === id) {
          row.edit_mode = true;
        }
        return row;
      })
    );
  };

  const setViewMode = (id) => {
    setLanguages((languages) =>
      languages.map((row) => {
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
    setLanguages((languages) => [...languages, {
      edit_mode: true,
    }]);
  };

  const deleteRow = (id) => {
    deleteUserLanguage(id)
      .then((request) => {
        if (request.ok) {
          updateUserLanguages();
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
    updateUserLanguages();
  };

  const onRowCancel = () => {
    updateUserLanguages(false);
  };

  return (
    <TableContainer component={Paper}>
      <Typography
        component="h2"
        variant="h5"
      >
        Idiomas
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
            <TableCell>Idioma</TableCell>
            <TableCell align="center">Lectura</TableCell>
            <TableCell align="center">Escritura</TableCell>
            <TableCell align="center">Habla</TableCell>
            <TableCell align="center">Escucha</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <ParameterContext.Provider value={context_parameters}>
            {languages.map(({
              id,
              edit_mode,
              language,
              language_id,
              read_skill,
              write_skill,
              talk_skill,
              listen_skill,
            }, index) =>
              edit_mode
                ? (
                  <LanguageEditableRow
                    id={id}
                    key={id || `_${index}`}
                    language={language_id}
                    listen_skill={listen_skill}
                    onCancel={onRowCancel}
                    onSubmit={(id) => onRowSubmit(id)}
                    read_skill={read_skill}
                    talk_skill={talk_skill}
                    write_skill={write_skill}
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
                      {language}
                    </TableCell>
                    <TableCell align="center">
                      {LanguageSkill.get(read_skill)}
                    </TableCell>
                    <TableCell align="center">
                      {LanguageSkill.get(write_skill)}
                    </TableCell>
                    <TableCell align="center">
                      {LanguageSkill.get(talk_skill)}
                    </TableCell>
                    <TableCell align="center">
                      {LanguageSkill.get(listen_skill)}
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
