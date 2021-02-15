import React, { Fragment, useContext } from "react";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";

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
import Certificacion from "../pages/usuario/certificacion.jsx";
import Cliente from "../pages/clientes/Cliente.jsx";
import Computador from "../pages/organizacion/computador";
import Contacto from "../pages/clientes/Contacto.jsx";
import CostoEmpleado from "../pages/organizacion/costo_empleado.tsx";
import ExperienciaLaboral from "../pages/usuario/experiencia/laboral.jsx";
import ExperienciaProyecto from "../pages/usuario/experiencia/proyecto.jsx";
import FormacionAcademica from "../pages/usuario/formacion/academica.jsx";
import FormacionCapacitacion from "../pages/usuario/formacion/capacitacion.jsx";
import FormacionContinuada from "../pages/usuario/formacion/continuada.jsx";
import Formato from "../pages/maestro/formato.jsx";
import HabilidadTecnica from "../pages/usuario/habilidad/tecnica.jsx";
import Herramienta from "../pages/maestro/herramienta.jsx";
import Idioma from "../pages/maestro/idioma.jsx";
import Licencia from "../pages/organizacion/licencia";
import NivelFormacion from "../pages/maestro/nivel_formacion.jsx";
import Parametro from "../pages/maestro/parametro.jsx";
import Perfil from "../pages/usuario/perfil.jsx";
import Persona from "../pages/organizacion/persona.jsx";
import PlaneacionProyecto from "../pages/planeacion/proyecto.jsx";
import PlaneacionRecurso from "../pages/planeacion/recurso.jsx";
import Plantilla from "../pages/maestro/plantilla.jsx";
import PlantillaCertificacion from "../pages/maestro/certificacion/plantilla.jsx";
import Presupuesto from "../pages/operaciones/Presupuesto.jsx";
import ProveedorCertificacion from "../pages/maestro/certificacion/proveedor.jsx";
import Proyecto from "../pages/operaciones/proyecto.jsx";
import Registro from "../pages/registro.jsx";
import Rol from "../pages/operaciones/Rol.jsx";
import Sector from "../pages/clientes/Sector.jsx";
import SubArea from "../pages/organizacion/sub_area.jsx";
import TipoArea from "../pages/organizacion/TipoArea.jsx";
import TipoCertificacion from "../pages/maestro/certificacion/tipo.jsx";
import TipoPresupuesto from "../pages/operaciones/TipoPresupuesto.jsx";
import TipoProyecto from "../pages/operaciones/TipoProyecto.jsx";

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

/**
 * @param {number[]} user_profiles
 * @param {number[]} profiles
 * */
const hasProfile = (user_profiles, profiles) => {
  return user_profiles.some((profile) => profiles.includes(profile));
};

/**
 * This component will render the component if no profiles are passed to it
 * or one of the profiles matches those of the user
 *
 * @param {Object} props
 * @param {number[]} props.allowed_profiles
 * */
const ProfiledRoute = ({
  allowed_profiles,
  component,
  ...props
}) => {
  const [context] = useContext(UserContext);

  return (
    <Route
      {...props}
      render={(children_props) =>
        (!allowed_profiles?.length ||
            hasProfile(context.profiles, allowed_profiles))
          ? React.createElement(component, children_props)
          : <Redirect to={"/"} />}
    />
  );
};

const Layout = (props) => {
  const [context] = useContext(UserContext);
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
          {
            /*
            TODO
            Find a way to encapsulate routes over section
          */
          }
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
                Profiles.CONTROLLER,
              ]}
              component={NivelFormacion}
              path="/maestro/nivel_formacion"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
              ]}
              component={Herramienta}
              path="/maestro/herramienta"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
              ]}
              component={TipoCertificacion}
              path="/maestro/certificacion/tipo"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
              ]}
              component={ProveedorCertificacion}
              path="/maestro/certificacion/proveedor"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
              ]}
              component={PlantillaCertificacion}
              path="/maestro/certificacion/plantilla"
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
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.CONSULTANT,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() =>
                <Registro
                  admin_access={hasProfile(context.profiles, [
                    Profiles.ADMINISTRATOR,
                    Profiles.CONTROLLER,
                    Profiles.HUMAN_RESOURCES,
                  ])}
                />}
              path="/registro"
            />
            <ProfiledRoute
              component={Perfil}
              path="/usuario/perfil"
            />
            <ProfiledRoute
              component={FormacionAcademica}
              path="/usuario/formacion/academica"
            />
            <ProfiledRoute
              component={FormacionContinuada}
              path="/usuario/formacion/continuada"
            />
            <ProfiledRoute
              component={FormacionCapacitacion}
              path="/usuario/formacion/capacitacion"
            />
            <ProfiledRoute
              component={ExperienciaLaboral}
              path="/usuario/experiencia/laboral"
            />
            <ProfiledRoute
              component={ExperienciaProyecto}
              path="/usuario/experiencia/proyecto"
            />
            <ProfiledRoute
              component={HabilidadTecnica}
              path="/usuario/habilidad/tecnica"
            />
            <ProfiledRoute
              component={Certificacion}
              path="/usuario/certificacion"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() => <Perfil review_mode={true} />}
              path="/humanos/perfil"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() => <FormacionAcademica review_mode={true} />}
              path="/humanos/formacion/academica"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() => <FormacionContinuada review_mode={true} />}
              path="/humanos/formacion/continuada"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() => <FormacionCapacitacion review_mode={true} />}
              path="/humanos/formacion/capacitacion"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() => <ExperienciaLaboral review_mode={true} />}
              path="/humanos/experiencia/laboral"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() => <ExperienciaProyecto review_mode={true} />}
              path="/humanos/experiencia/proyecto"
            />
            <ProfiledRoute
              allowed_profiles={[
                Profiles.ADMINISTRATOR,
                Profiles.CONTROLLER,
                Profiles.HUMAN_RESOURCES,
              ]}
              component={() => <Certificacion review_mode={true} />}
              path="/humanos/certificacion"
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
