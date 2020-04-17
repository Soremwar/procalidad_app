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
import TipoPresupuesto from "../pages/operaciones/TipoPresupuesto.jsx";

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
            <Route path="/operaciones/tipo_presupuesto" component={TipoPresupuesto} />
          </Switch>
        </div>
      </Fragment>
    </div>
  );
};

export default withRouter(Layout);
