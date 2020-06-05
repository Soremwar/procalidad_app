import React, {
  Fragment,
  useEffect,
  useState
} from "react";
import {
  DialogContentText,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";

import {
  formatResponseJson,
  requestGenerator,
} from "../../../lib/api/request.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";
import CurrencyField from '@unicef/material-ui-currency-textfield';

//TODO
//Add primary key as constant

const fetchSalaryApi = requestGenerator('organizacion/salario');
const fetchPeopleApi = requestGenerator('organizacion/persona');
const fetchComputerApi = requestGenerator('organizacion/computador');

const getPosition = (id) => fetchSalaryApi(id).then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getComputers = () => fetchComputerApi().then((x) => x.json());
const getResult = async (
  labour_cost,
  bonus_cost,
  license_cost,
  other,
  salary_type,
  computer,
) => fetchSalaryApi(`calculo?${
  new URLSearchParams({
    labour_cost, bonus_cost, license_cost, other, salary_type, computer,
  }).toString()
  }`)
  .then((x) => x.json());

const createSalary = async (form_data) => {
  return await fetchSalaryApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateSalary = async (id, form_data) => {
  return await fetchSalaryApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteSalary = async (id) => {
  return await fetchSalaryApi(id, {
    method: "DELETE",
  });
};

const headers = [
  { id: "person", numeric: false, disablePadding: false, label: "Persona" },
  { id: "salary_type", numeric: false, disablePadding: false, label: "Tipo de Salario" },
  { id: "computer", numeric: false, disablePadding: false, label: "Computador" },
];

const AddModal = ({
  computers,
  is_open,
  people,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    person: "",
    computer: "",
    labour_cost: 0,
    bonus_cost: 0,
    license_cost: 0,
    other: 0,
    salary_type: "",
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
        license_cost: 0,
        other: 0,
        salary_type: "",
      });
    }
  }, [is_open]);

  useEffect(() => {
    if (is_open && fields.computer, fields.salary_type) {
      getResult(
        fields.labour_cost,
        fields.bonus_cost,
        fields.license_cost,
        fields.other,
        fields.salary_type,
        fields.computer,
      ).then(({ costo, costo_total }) => setResult({
        cost: costo,
        total_cost: costo_total,
      }));
    } else {
      setResult(null);
    }
  }, [fields]);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const request = await createSalary(new URLSearchParams(fields));

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
      <SelectField
        fullWidth
        label="Persona"
        margin="dense"
        name="person"
        onChange={(event) => handleChange(event)}
        required
        value={fields.person}
      >
        {people.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Computador"
        margin="dense"
        name="computer"
        onChange={(event) => handleChange(event)}
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
        onChange={(_event, value) => setFields(fields => ({ ...fields, labour_cost: value }))}
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
        onChange={(_event, value) => setFields(fields => ({ ...fields, bonus_cost: value }))}
        outputFormat="number"
        required
        value={fields.bonus_cost}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Licencias"
        minimumValue="0"
        name="license_cost"
        onChange={(_event, value) => setFields(fields => ({ ...fields, license_cost: value }))}
        outputFormat="number"
        required
        value={fields.license_cost}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Otros"
        minimumValue="0"
        name="other"
        onChange={(_event, value) => setFields(fields => ({ ...fields, other: value }))}
        outputFormat="number"
        required
        value={fields.other}
      />
      <SelectField
        fullWidth
        label="Tipo de Salario"
        margin="dense"
        name="salary_type"
        onChange={(event) => handleChange(event)}
        required
        value={fields.salary_type}
      >
        <option value="I">Integral</option>
        <option value="O">Ordinario</option>
      </SelectField>
      <br /><br />
      {
        result
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
            </Fragment>)
          : (
            <Typography>Ingrese el modelo de computador y el tipo de salario para realizar el calculo</Typography>
          )
      }
    </DialogForm >
  );
};

const EditModal = ({
  computers,
  data,
  is_open,
  people,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    person: "",
    computer: "",
    labour_cost: 0,
    bonus_cost: 0,
    license_cost: 0,
    other: 0,
    salary_type: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (is_open) {
      setFields({
        person: data.fk_persona,
        computer: data.fk_computador,
        labour_cost: Number(data.valor_prestacional),
        bonus_cost: Number(data.valor_bonos),
        license_cost: Number(data.licencias),
        other: Number(data.otros),
        salary_type: data.tipo_salario,
      });
    }
  }, [is_open]);

  useEffect(() => {
    if (is_open && fields.computer && fields.salary_type) {
      getResult(
        fields.labour_cost,
        fields.bonus_cost,
        fields.license_cost,
        fields.other,
        fields.salary_type,
        fields.computer,
      ).then(({ costo, costo_total }) => setResult({
        cost: costo,
        total_cost: costo_total,
      }));
    } else {
      setResult(null);
    }
  }, [fields]);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const id = data.pk_salario;
    const request = await updateSalary(id, new URLSearchParams(fields));

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
      <SelectField
        fullWidth
        label="Persona"
        margin="dense"
        name="person"
        onChange={(event) => handleChange(event)}
        required
        value={fields.person}
      >
        {people.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Computador"
        margin="dense"
        name="computer"
        onChange={(event) => handleChange(event)}
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
        onChange={(_event, value) => setFields(fields => ({ ...fields, labour_cost: value }))}
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
        onChange={(_event, value) => setFields(fields => ({ ...fields, bonus_cost: value }))}
        outputFormat="number"
        required
        value={fields.bonus_cost}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Licencias"
        minimumValue="0"
        name="license_cost"
        onChange={(_event, value) => setFields(fields => ({ ...fields, license_cost: value }))}
        outputFormat="number"
        required
        value={fields.license_cost}
      />
      <CurrencyField
        currencySymbol="$"
        fullWidth
        label="Otros"
        minimumValue="0"
        name="other"
        onChange={(_event, value) => setFields(fields => ({ ...fields, other: value }))}
        outputFormat="number"
        required
        value={fields.other}
      />
      <SelectField
        fullWidth
        label="Tipo de Salario"
        margin="dense"
        name="salary_type"
        onChange={(event) => handleChange(event)}
        required
        value={fields.salary_type}
      >
        <option value="I">Integral</option>
        <option value="O">Ordinario</option>
      </SelectField>
      <br /><br />
      {
        result
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
            </Fragment>)
          : (
            <Typography>Ingrese el modelo de computador y el tipo de salario para realizar el calculo</Typography>
          )
      }
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
      .then((results) => results.reduce(async (total, result) => {
        if (result.status == 'rejected') {
          total.push(result.reason.message);
        } else if (!result.value.ok) {
          total.push(await formatResponseJson(result.value));
        }
        return total;
      }, []))
      .then(errors => {
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
        Esta operacion no se puede deshacer.
        ¿Esta seguro que desea eliminar estos <b>{selected.length}</b>
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default () => {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_project_type, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [computers, setComputers] = useState([]);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    getComputers().then(computers => setComputers(computers));
    getPeople().then(people => setPeople(people));
  }, []);

  const handleEditModalOpen = async (id) => {
    const data = await getPosition(id);
    setSelectedArea(data);
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
      <AddModal
        computers={computers}
        is_open={is_add_modal_open}
        people={people}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        computers={computers}
        data={selected_project_type}
        is_open={is_edit_modal_open}
        people={people}
        setModalOpen={setEditModalOpen}
        updateTable={updateTable}
      />
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
              data_index={"NA"}
              data_source={"organizacion/salario/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Costes personales"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
