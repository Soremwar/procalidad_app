import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { Drawer, IconButton, List } from "@material-ui/core";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  AccountBox as AccountBoxIcon,
} from "@material-ui/icons";
import { useTheme } from "@material-ui/styles";
import { withRouter } from "react-router-dom";

// styles
import useStyles from "./styles.js";

// components
import SidebarLink from "./components/sidebar_link/SidebarLink.jsx";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/Layout.jsx";
import {
  UserContext,
} from "../../context/User.jsx";

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

//TODO
//Centralize links to component with virtual routing
const structure = [
  { label: "Inicio", link: "/home", icon: <HomeIcon /> },
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
        label: "Parametro",
        link: "/maestro/parametro",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
        ],
        label: "Acceso",
        link: "/maestro/acceso",
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
        label: "Sector",
        link: "/clientes/sector",
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
        label: "Cliente",
        link: "/clientes/cliente",
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
        label: "Contacto",
        link: "/clientes/contacto",
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
        label: "Tipo de Proyecto",
        link: "/operaciones/tipo_proyecto",
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
        label: "Proyecto",
        link: "/operaciones/proyecto",
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
        label: "Tipo de Presupuesto",
        link: "/operaciones/tipo_presupuesto",
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
        label: "Rol",
        link: "/operaciones/rol",
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
        label: "Presupuesto",
        link: "/operaciones/presupuesto",
      },
    ],
  },
  {
    label: "Organizacion",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        label: "Tipo de Area",
        link: "/organizacion/tipo_area",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        label: "Area",
        link: "/organizacion/area",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        label: "SubArea",
        link: "/organizacion/sub_area",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
        ],
        label: "Persona",
        link: "/organizacion/persona",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
        ],
        label: "Cargo",
        link: "/organizacion/cargo",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
          Profiles.PROYECT_MANAGER,
        ],
        label: "Asignacion de Cargo",
        link: "/organizacion/asignacion_cargo",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        label: "Computador",
        link: "/organizacion/computador",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        label: "Licencias",
        link: "/organizacion/licencia",
      },
      {
        allowed_profiles: [
          Profiles.ADMINISTRATOR,
          Profiles.AREA_MANAGER,
          Profiles.CONTROLLER,
          Profiles.HUMAN_RESOURCES,
        ],
        label: "Costo Empleado",
        link: "/organizacion/costo_empleado",
      },
    ],
  },
  {
    label: "Planeacion",
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
        label: "Por proyecto",
        link: "/planeacion/proyecto",
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
        label: "Por recurso",
        link: "/planeacion/recurso",
      },
    ],
  },
  {
    label: "Asignacion",
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
        label: "Asignacion",
        link: "/asignacion/asignacion",
      },
    ],
  },
  {
    label: "Registro",
    icon: <AccountBoxIcon />,
    children: [
      {
        allowed_profiles: [
          Profiles.CONSULTANT,
        ],
        label: "Registro",
        link: "/registro",
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
        label: "Soportes",
        link: "/humanos/soporte",
      },
    ],
  },
];

const Sidebar = ({ location }) => {
  const [context] = useContext(UserContext);

  const classes = useStyles();
  const theme = useTheme();

  const { isSidebarOpened } = useLayoutState();
  const layoutDispatch = useLayoutDispatch();
  const [showAlways, setShowAlways] = useState(true);

  function handleWindowWidthChange() {
    const window_width = window.innerWidth;
    const min_allowed_width = theme.breakpoints.values.md;
    const should_always_show = window_width > min_allowed_width;

    setShowAlways(should_always_show);
  }

  useEffect(function () {
    window.addEventListener("resize", handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  });

  return (
    <Drawer
      variant={showAlways ? "permanent" : "temporary"}
      className={[
        classes.drawer,
        isSidebarOpened ? classes.drawerOpen : classes.drawerClose,
      ].join(" ")}
      classes={{
        paper: [
          isSidebarOpened ? classes.drawerOpen : classes.drawerClose,
          classes.drawerContent,
        ].join(" "),
      }}
      open={isSidebarOpened}
    >
      <div className={classes.toolbar} />
      <div className={classes.mobileBackButton}>
        <IconButton onClick={() => toggleSidebar(layoutDispatch)}>
          <ArrowBackIcon
            classes={{
              root: [classes.headerIcon, classes.headerIconCollapse].join(" "),
            }}
          />
        </IconButton>
      </div>
      <List className={classes.sidebarList}>
        {structure
          .reduce((arr, category) => {
            if (category.children) {
              category.children = category.children.reduce((arr, module) => {
                if (
                  context.profiles.some((profile) =>
                    module.allowed_profiles.includes(profile)
                  )
                ) {
                  arr.push(module);
                }
                return arr;
              }, []);

              if (category.children.length) {
                arr.push(category);
              }
            }
            return arr;
          }, [])
          .map((link, index) => (
            <SidebarLink
              key={index}
              location={location}
              isSidebarOpened={isSidebarOpened}
              {...link}
            />
          ))}
      </List>
    </Drawer>
  );
};

export default withRouter(Sidebar);
