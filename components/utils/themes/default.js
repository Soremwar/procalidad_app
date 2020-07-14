import tinycolor from "tinycolor2";

const primary = "#A6001A";
const secondary = "#DBDAD5";
const warning = "#FFC260";
const success = "#3096a9";
const info = "#B2D9FF";
const error = "#FF4C4C";

const lightenRate = 7.5;
const darkenRate = 15;

export default {
  palette: {
    primary: {
      main: primary,
      light: tinycolor(primary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(primary)
        .darken(darkenRate)
        .toHexString(),
    },
    secondary: {
      main: secondary,
      light: tinycolor(secondary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(secondary)
        .darken(darkenRate)
        .toHexString(),
      contrastText: "#FFFFFF",
    },
    warning: {
      main: warning,
      light: tinycolor(warning)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(warning)
        .darken(darkenRate)
        .toHexString(),
    },
    success: {
      main: success,
      light: tinycolor(success)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(success)
        .darken(darkenRate)
        .toHexString(),
    },
    info: {
      main: info,
      light: tinycolor(info)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(info)
        .darken(darkenRate)
        .toHexString(),
    },
    error: {
      main: error,
      light: tinycolor(error)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(error)
        .darken(darkenRate)
        .toHexString(),
    },
    text: {
      primary: "#4A4A4A",
      secondary: "#6E6E6E",
      hint: "#B9B9B9",
    },
    background: {
      default: "#FFF",
      light: "#F3F5FF",
    },
  },
  customShadows: {
    widget:
      "0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
    widgetDark:
      "0px 3px 18px 0px #4558A3B3, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
    widgetWide:
      "0px 12px 33px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
  },
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: "#4A4A4A1A",
      },
    },
    MuiCheckbox: {
      colorSecondary: {
        color: "#6e6e6e",
        "&$checked": {
          color: "#6e6e6e",
        },
      },
    },
    MuiMenu: {
      paper: {
        boxShadow:
          "0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
      },
    },
    MuiSelect: {
      icon: {
        color: "#B9B9B9",
      },
    },
    MuiListItem: {
      root: {
        "&$selected": {
          backgroundColor: "#F3F5FF !important",
          "&:focus": {
            backgroundColor: "#F3F5FF",
          },
        },
      },
      button: {
        "&:hover, &:focus": {
          backgroundColor: "#F3F5FF",
        },
      },
    },
    MuiTouchRipple: {
      child: {
        backgroundColor: "white",
      },
    },
    MuiTableRow: {
      root: {
        height: 56,
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: "1px solid rgba(224, 224, 224, .5)",
      },
      head: {
        fontSize: "0.95rem",
      },
      body: {
        fontSize: "0.95rem",
      },
    },
  },
};
