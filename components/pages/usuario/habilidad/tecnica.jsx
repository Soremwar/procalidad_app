import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText } from "@material-ui/core";
import { formatResponseJson } from "../../../../lib/api/request.js";
import {
  fetchToolApi,
  fetchUserTecnicalSkill,
} from "../../../../lib/api/generator.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import Title from "../../../common/Title.jsx";
import SelectField from "../../../common/SelectField.jsx";

const getSkills = () => fetchToolApi();

const getTecnicalSkill = (id) => fetchUserTecnicalSkill(id);

const createTecnicalSkill = async (
  administration,
  development,
  installation,
  skill,
) =>
  fetchUserTecnicalSkill("", {
    body: JSON.stringify({
      administration,
      development,
      installation,
      skill,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateTecnicalSkill = async (
  id,
  administration,
  development,
  installation,
) =>
  fetchUserTecnicalSkill(id, {
    body: JSON.stringify({
      administration,
      development,
      installation,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteTecnicalSkill = async (id) =>
  fetchUserTecnicalSkill(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "skill",
    numeric: false,
    disablePadding: false,
    label: "Herramienta",
    searchable: true,
  },
  {
    displayAs: (_i, value) => value ? "Sí" : "No",
    id: "installation",
    numeric: false,
    disablePadding: false,
    label: "Instalación",
    searchable: true,
  },
  {
    displayAs: (_i, value) => value ? "Sí" : "No",
    id: "administration",
    numeric: false,
    disablePadding: false,
    label: "Administración",
    searchable: true,
  },
  {
    id: "development",
    numeric: false,
    disablePadding: false,
    label: "Desarrollo",
    searchable: true,
  },
];

const SKILL_LEVEL = new Map([
  ["No", "No"],
  ["Basico", "Básico"],
  ["Intermedio", "Intermedio"],
  ["Avanzado", "Avanzado"],
]);

const ParameterContext = createContext({
  skills: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    skills,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    administration: false,
    development: SKILL_LEVEL.get("No"),
    installation: false,
    skill: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createTecnicalSkill(
      fields.administration,
      fields.development,
      fields.installation,
      fields.skill,
    );

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (is_open) {
      setFields({
        administration: false,
        development: SKILL_LEVEL.get("No"),
        installation: false,
        skill: "",
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Crear Nuevo"}
    >
      <SelectField
        fullWidth
        label="Herramienta"
        name="skill"
        onChange={handleChange}
        required
        value={fields.skill}
      >
        {skills.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
      <SelectField
        blank_value={false}
        fullWidth
        label="Instalación"
        name="installation"
        onChange={(e) => {
          const installation = Boolean(Number(e.target.value));
          setFields((prev_state) => ({ ...prev_state, installation }));
        }}
        required
        value={Number(fields.installation)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      <SelectField
        blank_value={false}
        fullWidth
        label="Administración"
        name="administration"
        onChange={(e) => {
          const administration = Boolean(Number(e.target.value));
          setFields((prev_state) => ({ ...prev_state, administration }));
        }}
        required
        value={Number(fields.administration)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      <SelectField
        blank_value={false}
        fullWidth
        label="Desarrollo"
        name="development"
        onChange={handleChange}
        required
        value={fields.development}
      >
        {Array.from(SKILL_LEVEL)
          .map(([value, text]) => (
            <option key={value} value={value}>{text}</option>
          ))}
      </SelectField>
    </DialogForm>
  );
};

const EditModal = ({
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    skills,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    administration: false,
    development: SKILL_LEVEL.get("No"),
    installation: false,
    skill: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateTecnicalSkill(
      data.id,
      fields.administration,
      fields.development,
      fields.installation,
    );

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (is_open) {
      setFields({
        administration: data.administration,
        development: data.development,
        installation: data.installation,
        skill: data.skill,
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Editar"}
    >
      <SelectField
        disabled
        fullWidth
        label="Herramienta"
        name="skill"
        value={fields.skill}
      >
        {skills.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
      <SelectField
        blank_value={false}
        fullWidth
        label="Instalación"
        name="installation"
        onChange={(e) => {
          const installation = Boolean(Number(e.target.value));
          setFields((prev_state) => ({ ...prev_state, installation }));
        }}
        required
        value={Number(fields.installation)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      <SelectField
        blank_value={false}
        fullWidth
        label="Administración"
        name="administration"
        onChange={(e) => {
          const administration = Boolean(Number(e.target.value));
          setFields((prev_state) => ({ ...prev_state, administration }));
        }}
        required
        value={Number(fields.administration)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      <SelectField
        blank_value={false}
        fullWidth
        label="Desarrollo"
        name="development"
        onChange={handleChange}
        required
        value={fields.development}
      >
        {Array.from(SKILL_LEVEL)
          .map(([value, text]) => (
            <option key={value} value={value}>{text}</option>
          ))}
      </SelectField>
    </DialogForm>
  );
};

const DeleteModal = ({
  is_open,
  selected,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteTecnicalSkill(id));

    Promise.allSettled(delete_progress)
      .then((results) =>
        results.reduce(async (total, result) => {
          if (result.status == "rejected") {
            total.push(result.reason.message);
          } else if (!result.value.ok) {
            total.push(await formatResponseJson(result.value));
          }
          return total;
        }, [])
      )
      .then((errors) => {
        if (errors.length) {
          setError(errors[0]);
        } else {
          setModalOpen(false);
        }
        setLoading(false);
        updateTable();
      });
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Eliminar Elementos"}
      confirmButtonText={"Confirmar"}
    >
      <DialogContentText>
        Esta operacion no se puede deshacer. ¿Esta seguro que desea eliminar
        estos <b>{selected.length}</b>
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default () => {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_tecnical_skill, setSelectedTecnicalSkill] = useState({});
  const [parameters, setParameters] = useState({
    skills: [],
  });
  const [selected, setSelected] = useState([]);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getTecnicalSkill(id)
      .then(async (response) => {
        if (response.ok) {
          setSelectedTecnicalSkill(await response.json());
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch((e) => console.error("Couldnt load the tecnical skill"));
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    getSkills()
      .then(async (response) => {
        if (response.ok) {
          /** @type Array<{id: number, name: string}> */
          const skills = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            skills: skills.sort(({ name: x }, { name: y }) =>
              x.localeCompare(y)
            ),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the skills"));
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Habilidades técnicas"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_tecnical_skill}
          is_open={is_edit_modal_open}
          setModalOpen={setEditModalOpen}
          updateTable={updateTable}
        />
      </ParameterContext.Provider>
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
        updateTable={updateTable}
      />
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setTableShouldUpdate(false)}
        update_table={tableShouldUpdate}
        url={"usuario/habilidad/tecnica/table"}
      />
    </Fragment>
  );
};
