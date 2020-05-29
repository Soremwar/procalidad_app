import React, { Fragment } from "react";
import {
  Route,
  Switch,
  withRouter,
} from "react-router-dom";

import useStyles from "./styles";
import Header from "./header/Header.jsx";
import Sidebar from "./sidebar/Sidebar.jsx";

import { useLayoutState } from "../context/Layout.jsx";

import Sector from "../pages/clientes/Sector.jsx";
import Cliente from "../pages/clientes/Cliente.jsx";
import Contacto from "../pages/clientes/Contacto.jsx";
import Proyecto from "../pages/operaciones/Proyecto.jsx";
import TipoProyecto from "../pages/operaciones/TipoProyecto.jsx";
import TipoArea from "../pages/organizacion/TipoArea.jsx";
import Area from "../pages/organizacion/Area.jsx";
import SubArea from "../pages/organizacion/sub_area.jsx";
import Persona from "../pages/organizacion/persona.jsx";
import Cargo from "../pages/organizacion/cargo.jsx";
import Computador from "../pages/organizacion/computador.jsx";
import CostoEmpleado from "../pages/organizacion/costo_empleado.jsx";
import TipoPresupuesto from "../pages/operaciones/TipoPresupuesto.jsx";
import Rol from "../pages/operaciones/Rol.jsx";
import Presupuesto from "../pages/operaciones/Presupuesto.jsx";
import Parametro from "../pages/maestro/parametro.jsx";

const Layout = (props) => {
  const classes = useStyles();
  const layout_context = useLayoutState();

  return (
    <div className={classes.root}>
      <Fragment>
        <Header history={props.history} />
        <Sidebar />
        <div className={[
          classes.content,
          ...(layout_context.isSidebarOpened ? [classes.contentShift] : []),
        ].join(" ")}>
          <div className={classes.fakeToolbar} />
          {/*
            TODO
            Find a way to encapsulate routes over section
          */}
          <Switch>
            <Route path="/clientes/sector" component={Sector} />
            <Route path="/clientes/cliente" component={Cliente} />
            <Route path="/clientes/contacto" component={Contacto} />
            <Route path="/operaciones/tipo_proyecto" component={TipoProyecto} />
            <Route path="/operaciones/proyecto" component={Proyecto} />
            <Route path="/organizacion/tipo_area" component={TipoArea} />
            <Route path="/organizacion/area" component={Area} />
            <Route path="/organizacion/sub_area" component={SubArea} />
            <Route path="/organizacion/persona" component={Persona} />
            <Route path="/organizacion/cargo" component={Cargo} />
            <Route path="/organizacion/computador" component={Computador} />
            <Route path="/organizacion/costo_empleado" component={CostoEmpleado} />
            <Route path="/operaciones/tipo_presupuesto" component={TipoPresupuesto} />
            <Route path="/operaciones/rol" component={Rol} />
            <Route path="/operaciones/presupuesto" component={Presupuesto} />
            <Route path="/maestro/parametro" component={Parametro} />
          </Switch>
        </div>
      </Fragment>
    </div>
  );
};

export default withRouter(Layout);
