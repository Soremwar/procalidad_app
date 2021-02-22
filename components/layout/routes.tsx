import { AccountBox as AccountBoxIcon } from "@material-ui/icons";
import React from "react";
import { Profiles } from "../../api/models/enums";

import Acceso from "../pages/maestro/acceso.jsx";
import Area from "../pages/organizacion/Area.jsx";
import Asignacion from "../pages/asignacion.jsx";
import AsignacionCargo from "../pages/organizacion/asignacion_cargo.jsx";
import Cargo from "../pages/organizacion/cargo.jsx";
import Certificacion from "../pages/usuario/certificacion.jsx";
import Cliente from "../pages/clientes/Cliente.jsx";
import Computador from "../pages/organizacion/computador";
import Contacto from "../pages/clientes/Contacto.jsx";
import CostoEmpleado from "../pages/organizacion/costo_empleado";
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

export const hasProfile = (user_profiles: number[], profiles: Profiles[]) => {
  return user_profiles.some((profile) => profiles.includes(profile));
};

interface SidebarLink {
  allowed_profiles?: Profiles[];
  component: Element;
  label: string;
  path: string;
}

interface SidebarSection {
  label: string;
  icon: Element;
  children: SidebarLink[];
}

export const getRoutes = (user_profiles: number[]): SidebarSection[] => [
  {
    label: "Sistema",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <Parametro />,
        label: "Parámetros",
        path: "/maestro/parametro",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
        ],
        component: () => <Acceso />,
        label: "Acceso",
        path: "/maestro/acceso",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <Formato />,
        label: "Formato",
        path: "/maestro/formato",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <Plantilla />,
        label: "Plantillas",
        path: "/maestro/plantilla",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <Idioma />,
        label: "Idiomas",
        path: "/maestro/idioma",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <NivelFormacion />,
        label: "Nivel de formación",
        path: "/maestro/nivel_formacion",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <Herramienta />,
        label: "Herramientas",
        path: "/maestro/herramienta",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <TipoCertificacion />,
        label: "Tipo de certificación",
        path: "/maestro/certificacion/tipo",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <ProveedorCertificacion />,
        label: "Proveedor de certificación",
        path: "/maestro/certificacion/proveedor",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ],
        component: () => <PlantillaCertificacion />,
        label: "Certificaciones",
        path: "/maestro/certificacion/plantilla",
      },
    ],
  },
  {
    label: "Clientes",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <Sector />,
        label: "Sector",
        path: "/clientes/sector",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <Cliente />,
        label: "Cliente",
        path: "/clientes/cliente",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <Contacto />,
        label: "Contacto",
        path: "/clientes/contacto",
      },
    ],
  },
  {
    label: "Operaciones",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
        ],
        component: () => <TipoProyecto />,
        label: "Tipo de proyecto",
        path: "/operaciones/tipo_proyecto",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <Proyecto />,
        label: "Proyecto",
        path: "/operaciones/proyecto",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <TipoPresupuesto />,
        label: "Tipo de presupuesto",
        path: "/operaciones/tipo_presupuesto",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <Rol />,
        label: "Rol",
        path: "/operaciones/rol",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <Presupuesto />,
        label: "Presupuesto",
        path: "/operaciones/presupuesto",
      },
    ],
  },
  {
    label: "Organización",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <TipoArea />,
        label: "Tipo de área",
        path: "/organizacion/tipo_area",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <Area />,
        label: "Área",
        path: "/organizacion/area",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <SubArea />,
        label: "Subárea",
        path: "/organizacion/sub_area",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
        ],
        component: () => <Persona />,
        label: "Persona",
        path: "/organizacion/persona",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
        ],
        component: () => <Cargo />,
        label: "Cargo",
        path: "/organizacion/cargo",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
        ],
        component: () => <AsignacionCargo />,
        label: "Asignación de cargo",
        path: "/organizacion/asignacion_cargo",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <Computador />,
        label: "Computador",
        path: "/organizacion/computador",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <Licencia />,
        label: "Licencias",
        path: "/organizacion/licencia",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <CostoEmpleado />,
        label: "Costo por empleado",
        path: "/organizacion/costo_empleado",
      },
    ],
  },
  {
    label: "Planeación",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <PlaneacionProyecto />,
        label: "Por proyecto",
        path: "/planeacion/proyecto",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <PlaneacionRecurso />,
        label: "Por recurso",
        path: "/planeacion/recurso",
      },
    ],
  },
  {
    label: "Asignación",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
          Profiles.SALES,
        ],
        component: () => <Asignacion />,
        label: "Asignación",
        path: "/asignacion/asignacion",
      },
    ],
  },
  {
    label: "Registro",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.CONSULTANT,
        ],
        component: () =>
          <Registro
            admin_access={hasProfile(user_profiles, [
              Profiles.ADMINISTRATOR,
              Profiles.CONTROLLER,
              Profiles.HUMAN_RESOURCES,
            ])}
          />,
        label: "Registro",
        path: "/registro",
      },
    ],
  },
  {
    label: "Hoja de vida",
    icon: <AccountBoxIcon />,
    children: [
      {
        component: () => <Perfil />,
        label: "Datos personales",
        path: "/usuario/perfil",
      },
      {
        component: () => <FormacionAcademica />,
        label: "Formación académica",
        path: "/usuario/formacion/academica",
      },
      {
        component: () => <FormacionContinuada />,
        label: "Formación continuada",
        path: "/usuario/formacion/continuada",
      },
      {
        component: () => <FormacionCapacitacion />,
        label: "Capacitaciones internas",
        path: "/usuario/formacion/capacitacion",
      },
      {
        component: () => <ExperienciaLaboral />,
        label: "Experiencia laboral",
        path: "/usuario/experiencia/laboral",
      },
      {
        component: () => <ExperienciaLaboral />,
        label: "Experiencia en proyecto",
        path: "/usuario/experiencia/proyecto",
      },
      {
        component: () => <HabilidadTecnica />,
        label: "Habilidades técnicas",
        path: "/usuario/habilidad/tecnica",
      },
      {
        component: () => <Certificacion />,
        label: "Certificaciones",
        path: "/usuario/certificacion",
      },
    ],
  },
  {
    label: "Recursos humanos",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <Perfil review_mode={true} />,
        label: "Datos personales",
        path: "/humanos/perfil",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <FormacionAcademica review_mode={true} />,
        label: "Formación académica",
        path: "/humanos/formacion/academica",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <FormacionContinuada review_mode={true} />,
        label: "Formación continuada",
        path: "/humanos/formacion/continuada",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <FormacionCapacitacion review_mode={true} />,
        label: "Capacitaciones internas",
        path: "/humanos/formacion/capacitacion",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <ExperienciaLaboral review_mode={true} />,
        label: "Experiencia laboral",
        path: "/humanos/experiencia/laboral",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <ExperienciaProyecto review_mode={true} />,
        label: "Experiencia en proyecto",
        path: "/humanos/experiencia/proyecto",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        component: () => <Certificacion review_mode={true} />,
        label: "Certificaciones",
        path: "/humanos/certificacion",
      },
    ],
  },
];
