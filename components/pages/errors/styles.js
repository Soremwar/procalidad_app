import { makeStyles } from "@material-ui/styles";

export default makeStyles((theme) => ({
  backButton: {
    boxShadow: theme.customShadows.widget,
    textTransform: "none",
    fontSize: 22,
  },
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.primary.light,
    position: "absolute",
    top: 0,
    left: 0,
  },
  errorCode: {
    fontSize: 148,
    fontWeight: 600,
  },
  logotypeContainer: {
    backgroundColor: theme.palette.primary.light,
    width: "60%",
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      width: "50%",
    },
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  logotypeImage: {
    width: 165,
    marginBottom: theme.spacing(4),
  },
  logotypeText: {
    color: "white",
    fontWeight: 500,
    fontSize: 84,
    [theme.breakpoints.down("md")]: {
      fontSize: 48,
    },
  },
  paperRoot: {
    boxShadow: theme.customShadows.widgetDark,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(3),
    maxWidth: 400,
  },
  safetyText: {
    fontWeight: 300,
    color: theme.palette.text.hint,
  },
  textRow: {
    marginBottom: theme.spacing(10),
    textAlign: "center",
  },
}));
