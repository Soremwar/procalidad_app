import React, { Fragment, useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, TableRow, Tooltip } from "@material-ui/core";
import Heatmap, {
  CleanTableCell,
  DateParameters,
  DetailDot,
} from "./Heatmap.jsx";
import { ParameterContext } from "../recurso.jsx";
import SelectField from "../../../common/SelectField.jsx";

const AvailabilityCell = ({
  available,
  value = null,
}) => {
  let status;

  if (value === 9) {
    status = "error";
  } else if (value === 0) {
    status = "ok";
  } else if (value > 0 && value < 9) {
    status = "warning";
  } else {
    status = "invalid";
  }

  return (
    <CleanTableCell>
      <Tooltip title={`Horas: ${value ?? 9}\n Disponible: ${available}%`}>
        <div>
          <DetailDot status={status} />
        </div>
      </Tooltip>
    </CleanTableCell>
  );
};

const OcupationCell = ({
  assignation,
  value = null,
}) => {
  let status;

  if (value === 0) {
    status = "error";
  } else if (value === 9) {
    status = "ok";
  } else if (value > 0 && value < 9) {
    status = "warning";
  } else {
    status = "invalid";
  }

  return (
    <CleanTableCell>
      <Tooltip title={`Horas: ${value ?? 0}\n Asignacion: ${assignation}%`}>
        <div>
          <DetailDot status={status} />
        </div>
      </Tooltip>
    </CleanTableCell>
  );
};

const detailRowStyles = makeStyles({
  row: {
    height: "30px",
    margin: 0,
    padding: "0px",
  },
});

const DetailTableRow = ({ children, className = "", ...props }) => {
  const styles = detailRowStyles();
  return (
    <TableRow
      className={[styles.row, ...className.split(" ")].join(" ")}
      {...props}
    >
      {children}
    </TableRow>
  );
};

const HeatmapData = ({
  data,
  type,
}) => {
  const { calendar_dates } = useContext(DateParameters);

  return data.map(({ person_id, person, dates }) => (
    <DetailTableRow key={person_id}>
      <CleanTableCell>
        {person}
      </CleanTableCell>
      {calendar_dates.map((calendar_date) => {
        const activity = dates.find(({ date }) => calendar_date == date);
        if (type === "availability") {
          return (
            <AvailabilityCell
              available={activity ? Number(activity.assignation) : 100}
              key={calendar_date}
              value={activity ? Number(activity.hours) : 9}
            />
          );
        } else {
          return (
            <OcupationCell
              assignation={activity ? Number(activity.assignation) : 0}
              key={calendar_date}
              value={activity ? Number(activity.hours) : 0}
            />
          );
        }
      })}
    </DetailTableRow>
  ));
};

export default function ResourceHeatmap({
  blacklisted_dates,
  end_date,
  getSource,
  setShouldUpdate,
  should_update,
  start_date,
}) {
  const {
    positions,
    roles,
    sub_areas,
  } = useContext(ParameterContext);

  const [data, setData] = useState([]);
  const [parameters, setParameters] = useState({
    position: "",
    role: "",
    sub_area: "",
    type: "occupation",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setParameters((prev_state) => ({
      ...prev_state,
      [name]: value,
    }));
  };

  useEffect(() => {
    let active = true;

    if (should_update) {
      getSource(
        parameters.type,
        parameters.sub_area,
        parameters.position,
        parameters.role,
      )
        .then((res) => {
          if (active) {
            setData(res);
          }
        })
        .catch(() =>
          console.error("Couldn't load the resource heatmap information")
        )
        .finally(() => {
          setShouldUpdate(false);
        });
    }

    return () => {
      active = false;
    };
  }, [should_update]);

  useEffect(() => {
    setShouldUpdate(true);
  }, [parameters]);

  useEffect(() => {
    return () => {
      setShouldUpdate(false);
    };
  }, []);

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item md={3} xs={6}>
          <SelectField
            fullWidth
            label="Tipo de resumen"
            name="type"
            onChange={handleChange}
            value={parameters.type}
          >
            <option value="availability">Disponible</option>
            <option value="occupation">Ocupacion</option>
          </SelectField>
        </Grid>
        <Grid item md={3} xs={6}>
          <SelectField
            fullWidth
            label="Subárea"
            name="sub_area"
            onChange={handleChange}
            value={parameters.sub_area}
          >
            {sub_areas.map(({ pk_sub_area, nombre }) => (
              <option key={pk_sub_area} value={pk_sub_area}>{nombre}</option>
            ))}
          </SelectField>
        </Grid>
        <Grid item md={3} xs={6}>
          <SelectField
            fullWidth
            label="Cargo"
            name="position"
            onChange={handleChange}
            value={parameters.position}
          >
            {positions.map(({ pk_cargo, nombre }) => (
              <option key={pk_cargo} value={pk_cargo}>{nombre}</option>
            ))}
          </SelectField>
        </Grid>
        <Grid item md={3} xs={6}>
          <SelectField
            fullWidth
            label="Rol"
            name="role"
            onChange={handleChange}
            value={parameters.role}
          >
            {roles.map(({ pk_rol, nombre }) => (
              <option key={pk_rol} value={pk_rol}>{nombre}</option>
            ))}
          </SelectField>
        </Grid>
      </Grid>
      <Heatmap
        blacklisted_dates={blacklisted_dates}
        end_date={end_date}
        start_date={start_date}
      >
        <HeatmapData data={data} type={parameters.type} />
      </Heatmap>
    </Fragment>
  );
}
