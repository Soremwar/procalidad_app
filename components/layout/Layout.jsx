import React, {
  Fragment,
  useContext,
} from "react";
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from "react-router-dom";

import useStyles from "./styles";
import Header from "./header/Header.jsx";
import Sidebar from "./sidebar/Sidebar.jsx";

import { UserContext } from "../context/User.jsx";
import { useLayoutState } from "../context/Layout.jsx";

import Acceso from "../pages/maestro/acceso.jsx";
import Area from "../pages/organizacion/Area.jsx";
import Asignacion from "../pages/asignacion.jsx";
import AsignacionCargo from "../pages/organizacion/asignacion_cargo.jsx";
import Cargo from "../pages/organizacion/cargo.jsx";
import Cliente from "../pages/clientes/Cliente.jsx";
import Computador from "../pages/organizacion/computador.jsx";
import Contacto from "../pages/clientes/Contacto.jsx";
import CostoEmpleado from "../pages/organizacion/costo_empleado.jsx";
import Formato from "../pages/maestro/formato.jsx";
import Idioma from "../pages/maestro/idioma.jsx";
import Licencia from "../pages/organizacion/licencia.jsx";
import Parametro from "../pages/maestro/parametro.jsx";
import Perfil from "../pages/usuario/perfil.jsx";
import Persona from "../pages/organizacion/persona.jsx";
import PlaneacionProyecto from "../pages/planeacion/proyecto.jsx";
import PlaneacionRecurso from "../pages/planeacion/recurso.jsx";
import Plantilla from "../pages/maestro/plantilla.jsx";
import Presupuesto from "../pages/operaciones/Presupuesto.jsx";
import Proyecto from "../pages/operaciones/proyecto.jsx";
import Registro from "../pages/registro.jsx";
import Rol from "../pages/operaciones/Rol.jsx";
import Sector from "../pages/clientes/Sector.jsx";
import SubArea from "../pages/organizacion/sub_area.jsx";
import TipoArea from "../pages/organizacion/TipoArea.jsx";
import TipoPresupuesto from "../pages/operaciones/TipoPresupuesto.jsx";
import TipoProyecto from "../pages/operaciones/TipoProyecto.jsx";
import { Router } from "@material-ui/icons";

//TODO
//Make profiles constant (shared?)
const Profiles = {
  ADMINISTRATOR: 1,
  CONTROLLER: 2,
  AREA_MANAGER: 3,
  PROYECT_MANAGER: 4,
  HUMAN_RESOURCES: 5,
  SALES: 6,
  CONSULTANT: 7,
};

const ProfiledRoute = ({
  allowed_profiles,
  component,
  ...props
}) => {
  const [context] = useContext(UserContext);
  const { profiles } = context;

  return (
    <Route
      {...props}
      render={(children_props) =>
        profiles.some((profile) => allowed_profiles.includes(profile))
          ? React.createElement(component, children_props)
          : <Redirect to={"/"} />}
    />
  );
};

const Layout = (props) => {
  const classes = useStyles();
  const layout_context = useLayoutState();

  return (
    <div className={classes.root}>
      <Fragment>
        <Header history={props.history} />
        <Sidebar />
        <div
          className={[
            classes.content,
            ...(layout_context.isSidebarOpened ? [classes.contentShift] : []),
          ].join(" ")}
        >
          <div className={classes.fakeToolbar} />
          {/*
            TODO
            Find a way to encapsulate routes over section
          */}
          <Switch>
            <Route component={Perfil} path="/usuario/perfil" />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={Parametro}
              path="/maestro/parametro"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
              ]}
              component={Acceso}
              path="/maestro/acceso"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
              ]}
              component={Formato}
              path="/maestro/formato"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
              ]}
              component={Plantilla}
              path="/maestro/plantilla"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
              ]}
              component={Idioma}
              path="/maestro/idioma"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={Sector}
              path="/clientes/sector"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={Cliente}
              path="/clientes/cliente"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={Contacto}
              path="/clientes/contacto"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
              ]}
              component={TipoProyecto}
              path="/operaciones/tipo_proyecto"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={Proyecto}
              path="/operaciones/proyecto"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={TipoPresupuesto}
              path="/operaciones/tipo_presupuesto"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={Rol}
              path="/operaciones/rol"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={Presupuesto}
              path="/operaciones/presupuesto"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={TipoArea}
              path="/organizacion/tipo_area"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={Area}
              path="/organizacion/area"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={SubArea}
              path="/organizacion/sub_area"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
              ]}
              component={Persona}
              path="/organizacion/persona"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
              ]}
              component={Cargo}
              path="/organizacion/cargo"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
              ]}
              component={AsignacionCargo}
              path="/organizacion/asignacion_cargo"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={Computador}
              path="/organizacion/computador"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={Licencia}
              path="/organizacion/licencia"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={CostoEmpleado}
              path="/organizacion/costo_empleado"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={PlaneacionProyecto}
              path="/planeacion/proyecto"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={PlaneacionRecurso}
              path="/planeacion/recurso"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.AREA_MANAGER,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
                Profiles.PROYECT_MANAGER,
                Profiles.SALES,
              ]}
              component={Asignacion}
              path="/asignacion/asignacion"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.CONSULTANT,
              ]}
              component={Registro}
              path="/registro"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.CONSULTANT,
              ]}
              component={Perfil}
              path="/usuario/perfil"
            />
            <Route exact={true} path="/" />
            <Redirect from="*" to="/404" />
          </Switch>
        </div>
      </Fragment>
    </div>
  );
};

export default withRouter(Layout);
