import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Grid,
  TableRow,
  Tooltip,
} from "@material-ui/core";
import getRandomColor from "randomcolor";
import Heatmap, {
  CleanTableCell,
  DateParameters,
  DetailDot,
} from "./Heatmap.jsx";
import {
  ParameterContext,
} from "../recurso.jsx";
import SelectField from "../../../common/SelectField.jsx";

const DetailCell = ({
  assignation,
  color = null,
  value = null,
}) => (
  <CleanTableCell>
    <Tooltip title={`Horas: ${value || 0}\n Asignacion: ${assignation}%`}>
      <div>
        <DetailDot
          color={color}
          status={value && color ? null : "invalid"}
        />
      </div>
    </Tooltip>
  </CleanTableCell>
);

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

const colors = [
  "blue",
  "green",
  "orange",
  "pink",
  "purple",
  "yellow",
];

const getRandomHue = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const HeatmapData = ({
  data,
}) => {
  const { calendar_dates } = useContext(DateParameters);
  const color = getRandomColor({
    format: "hex",
    hue: getRandomHue(),
    luminosity: "dark",
  });

  return data.map(({ project_id, project, dates }) => (
    <DetailTableRow key={project_id}>
      <CleanTableCell>
        {project}
      </CleanTableCell>
      {calendar_dates.map((calendar_date) => {
        const activity = dates.find(({ date }) => calendar_date == date);
        return (
          <DetailCell
            assignation={activity ? Number(activity.assignation) : 0}
            color={activity ? color : null}
            key={calendar_date}
            value={activity ? Number(activity.hours) : 0}
          />
        );
      })}
    </DetailTableRow>
  ));
};

export default ({
  blacklisted_dates,
  end_date,
  getSource,
  onUpdate,
  should_update,
  start_date,
}) => {
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
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setParameters((prev_state) => ({
      ...prev_state,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (should_update) {
      getSource(
        parameters.sub_area,
        parameters.position,
        parameters.role,
      ).then((res) => setData(res));
    }
  }, [should_update, parameters]);

  useEffect(() => {
    return function cleanUp() {
      onUpdate();
    };
  }, []);

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item md={4} xs={12}>
          <SelectField
            fullWidth
            label="SubArea"
            name="sub_area"
            onChange={handleChange}
            value={parameters.sub_area}
          >
            {sub_areas.map(({ pk_sub_area, nombre }) => (
              <option key={pk_sub_area} value={pk_sub_area}>{nombre}</option>
            ))}
          </SelectField>
        </Grid>
        <Grid item md={4} xs={12}>
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
        <Grid item md={4} xs={12}>
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
        <HeatmapData data={data} />
      </Heatmap>
    </Fragment>
  );
};
