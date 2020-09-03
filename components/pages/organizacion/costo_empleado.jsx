import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DialogContentText,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";

import {
  formatResponseJson,
} from "../../../lib/api/request.js";
import {
  fetchComputerApi,
  fetchLicenseApi,
  fetchPersonCostApi,
  fetchPeopleApi,
} from "../../../lib/api/generator.js";
import {
  formatDateToStandardString,
} from "../../../lib/date/mod.js";

import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import CurrencyField from "@unicef/material-ui-currency-textfield";
import DialogForm from "../../common/DialogForm.jsx";
import MultipleSelectField from "../../common/MultipleSelectField.jsx";
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

const getPersonCost = (id) => fetchPersonCostApi(id).then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getComputers = () => fetchComputerApi().then((x) => x.json());
const getLicenses = () => fetchLicenseApi().then((x) => x.json());

const getResult = async (
  labour_cost,
  bonus_cost,
  licenses,
  other,
  salary_type,
  computer,
) =>
  fetchPersonCostApi("calculo", {
    body: JSON.stringify(
      { labour_cost, bonus_cost, licenses, other, salary_type, computer },
    ),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).then((x) => x.json());

const createSalary = async (form_data) =>
  fetchPersonCostApi("", {
    body: form_data,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateSalary = async (id, form_data) =>
  fetchPersonCostApi(id, {
    body: form_data,
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteSalary = async (id) =>
  fetchPersonCostApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "person",
    numeric: false,
    disablePadding: false,
    label: "Persona",
    searchable: true,
  },
  {
    id: "salary_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de Salario",
    searchable: true,
  },
  {
    id: "computer",
    numeric: false,
    disablePadding: false,
    label: "Computador",
    searchable: true,
  },
];

const ParameterContext = createContext({
  computers: [],
  licenses: [],
  people: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    computers,
    licenses,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
    computer: "",
    labour_cost: 0,
    bonus_cost: 0,
    licenses: [],
    other: 0,
    salary_type: "",
    validity: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: "",
        computer: "",
        labour_cost: 0,
        bonus_cost: 0,
        licenses: [],
        other: 0,
        salary_type: "",
        validity: "",
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  useEffect(() => {
    if (is_open && fields.computer, fields.salary_type) {
      getResult(
        fields.labour_cost,
        fields.bonus_cost,
        fields.licenses,
        fields.other,
        fields.salary_type,
        fields.computer,
      ).then(({ costo, costo_total }) =>
        setResult({
          cost: costo,
          total_cost: costo_total,
        })
      );
    } else {
      setResult(null);
    }
  }, [fields]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createSalary(JSON.stringify(fields));

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Crear Nuevo"}
      size="md"
    >
      <AdvancedSelectField
        fullWidth
        label="Persona"
        name="person"
        options={people}
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, person: value }))}
        required
        value={fields.person}
      />
      <SelectField
        fullWidth
        label="Computador"
        name="computer"
        onChange={handleChange}
        required
        value={fields.computer}
      >
        {computers.map(({ pk_computador, nombre }) => (
          <option key={pk_computador} value={pk_computador}>{nombre}</option>
        ))}
      </SelectField>
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Valor Prestacional"
        minimumValue="0"
        name="labour_cost"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, labour_cost: value }))}
        outputFormat="number"
        required
        value={fields.labour_cost}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Valor de Bonos"
        minimumValue="0"
        name="bonus_cost"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, bonus_cost: value }))}
        outputFormat="number"
        required
        value={fields.bonus_cost}
      />
      <MultipleSelectField
        data={licenses}
        fullWidth
        label="Licencias"
        name="licenses"
        onChange={handleChange}
        value={fields.licenses}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Otros"
        minimumValue="0"
        name="other"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, other: value }))}
        outputFormat="number"
        required
        value={fields.other}
      />
      <SelectField
        fullWidth
        label="Tipo de Salario"
        name="salary_type"
        onChange={handleChange}
        required
        value={fields.salary_type}
      >
        <option value="I">Integral</option>
        <option value="O">Ordinario</option>
      </SelectField>
      <TextField
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        label="Inicio de vigencia"
        margin="dense"
        name="validity"
        onChange={handleChange}
        required
        type="date"
        value={fields.validity}
      />
      <br />
      <br />
      {result
        ? (
          <Fragment>
            <CurrencyField
              currencySymbol="$"
              disabled
              fullWidth
              label="Costo"
              value={result.cost}
            />
            <CurrencyField
              currencySymbol="$"
              disabled
              fullWidth
              label="Costo Total"
              value={result.total_cost}
            />
          </Fragment>
        )
        : (
          <Typography>
            Ingrese el modelo de computador y el tipo de salario para realizar
            el calculo
          </Typography>
        )}
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
    computers,
    licenses,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
    computer: "",
    labour_cost: 0,
    bonus_cost: 0,
    licenses: [],
    other: 0,
    salary_type: "",
    validity: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: data.fk_persona,
        computer: data.fk_computador,
        labour_cost: Number(data.valor_prestacional),
        bonus_cost: Number(data.valor_bonos),
        licenses: data.licencias,
        other: Number(data.otros),
        salary_type: data.tipo_salario,
        validity: formatDateToStandardString(new Date(data.fec_vigencia)),
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  useEffect(() => {
    if (is_open && fields.computer && fields.salary_type) {
      getResult(
        fields.labour_cost,
        fields.bonus_cost,
        fields.licenses,
        fields.other,
        fields.salary_type,
        fields.computer,
      ).then(({ costo, costo_total }) =>
        setResult({
          cost: costo,
          total_cost: costo_total,
        })
      );
    } else {
      setResult(null);
    }
  }, [fields]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateSalary(data.pk_salario, JSON.stringify(fields));

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Editar"}
      size="md"
    >
      <AdvancedSelectField
        disabled
        fullWidth
        label="Persona"
        name="person"
        options={people}
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, person: value }))}
        requireds
        value={fields.person}
      />
      <SelectField
        fullWidth
        label="Computador"
        name="computer"
        onChange={handleChange}
        required
        value={fields.computer}
      >
        {computers.map(({ pk_computador, nombre }) => (
          <option key={pk_computador} value={pk_computador}>{nombre}</option>
        ))}
      </SelectField>
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Valor Prestacional"
        minimumValue="0"
        name="labour_cost"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, labour_cost: value }))}
        outputFormat="number"
        required
        value={fields.labour_cost}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Valor de Bonos"
        minimumValue="0"
        name="bonus_cost"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, bonus_cost: value }))}
        outputFormat="number"
        required
        value={fields.bonus_cost}
      />
      <MultipleSelectField
        data={licenses}
        fullWidth
        label="Licencias"
        name="licenses"
        onChange={handleChange}
        value={fields.licenses}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Otros"
        minimumValue="0"
        name="other"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, other: value }))}
        outputFormat="number"
        required
        value={fields.other}
      />
      <SelectField
        fullWidth
        label="Tipo de Salario"
        name="salary_type"
        onChange={handleChange}
        required
        value={fields.salary_type}
      >
        <option value="I">Integral</option>
        <option value="O">Ordinario</option>
      </SelectField>
      <TextField
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        label="Inicio de vigencia"
        margin="dense"
        name="validity"
        onChange={handleChange}
        required
        type="date"
        value={fields.validity}
      />
      <br />
      <br />
      {result
        ? (
          <Fragment>
            <CurrencyField
              currencySymbol="$"
              disabled
              fullWidth
              label="Costo"
              value={result.cost}
            />
            <CurrencyField
              currencySymbol="$"
              disabled
              fullWidth
              label="Costo Total"
              value={result.total_cost}
            />
          </Fragment>
        )
        : (
          <Typography>
            Ingrese el modelo de computador y el tipo de salario para realizar
            el calculo
          </Typography>
        )}
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

    const delete_progress = selected.map((id) => deleteSalary(id));

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
  const [selected, setSelected] = useState([]);
  const [selected_person_cost, setSelectedPersonCost] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);
  const [parameters, setParameters] = useState({
    computers: [],
    licenses: [],
    people: [],
  });

  useEffect(() => {
    getComputers().then((computers) =>
      setParameters((prev_state) => ({ ...prev_state, computers }))
    );
    getLicenses().then((licenses) => {
      setParameters((prev_state) => ({
        ...prev_state,
        licenses: licenses.map((
          { pk_licencia, nombre },
        ) => [pk_licencia, nombre]),
      }));
    });
    getPeople().then((people) =>
      setParameters((prev_state) => ({
        ...prev_state,
        people: people.map(({ pk_persona, nombre }) => [pk_persona, nombre]),
      }))
    );
    updateTable();
  }, []);

  const handleEditModalOpen = async (id) => {
    const data = await getPersonCost(id);
    setSelectedPersonCost(data);
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  return (
    <Fragment>
      <Title title={"Costo de Empleado"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_person_cost}
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
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget noBodyPadding>
            <AsyncTable
              columns={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              onTableUpdate={() => setTableShouldUpdate(false)}
              update_table={tableShouldUpdate}
              url={"organizacion/salario/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
