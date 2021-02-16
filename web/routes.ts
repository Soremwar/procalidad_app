import { Router } from "oak";
import { checkUserAccess } from "./middleware.ts";
import { Profiles } from "../api/common/profiles.ts";
import { createSession } from "./handlers/auth.ts";
import * as user_profile from "./handlers/usuario/perfil.ts";
import * as user_academic_title from "./handlers/usuario/formacion/academica.ts";
import * as user_continuous_title from "./handlers/usuario/formacion/continuada.ts";
import * as user_training_title from "./handlers/usuario/formacion/capacitacion.ts";
import * as user_laboral_experience from "./handlers/usuario/experiencia/laboral.ts";
import * as user_project_experience from "./handlers/usuario/experiencia/proyecto.ts";
import * as user_technical_skill from "./handlers/usuario/habilidad/tecnica.ts";
import * as user_certification from "./handlers/usuario/certificacion.ts";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  getContactsTable,
  updateContact,
} from "./handlers/clientes/contacto.ts";
import {
  createSector,
  deleteSector,
  getSector,
  getSectors,
  getSectorsTable,
  updateSector,
} from "./handlers/clientes/sector.ts";
import {
  getCountries,
  getCountry,
  searchCountry,
} from "./handlers/maestro/pais.ts";
import { getState, getStates, searchState } from "./handlers/maestro/estado.ts";
import { getCities, getCity, searchCity } from "./handlers/maestro/ciudad.ts";
import * as language from "./handlers/maestro/idioma.ts";
import * as gender from "./handlers/maestro/genero.ts";
import * as marital_status from "./handlers/maestro/estado_civil.ts";
import * as file_formats from "./handlers/maestro/formato.ts";
import * as formation_level from "./handlers/maestro/nivel_formacion.ts";
import * as tool from "./handlers/maestro/herramienta.ts";
import * as certification_type from "./handlers/maestro/certificacion/tipo.ts";
import * as certification_provider from "./handlers/maestro/certificacion/proveedor.ts";
import * as certification_template from "./handlers/maestro/certificacion/plantilla.ts";
import * as clients from "./handlers/clientes/cliente.ts";
import {
  createProjectType,
  deleteProjectType,
  getProjectType,
  getProjectTypes,
  getProjectTypesTable,
  updateProjectType,
} from "./handlers/operaciones/tipo_proyecto.ts";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  getProjectsTable,
  searchProject,
  updateProject,
} from "./handlers/operaciones/proyecto.ts";
import * as person from "./handlers/organizacion/persona.ts";
import {
  createAreaType,
  deleteAreaType,
  getAreaType,
  getAreaTypes,
  getAreaTypesTable,
  updateAreaType,
} from "./handlers/organizacion/tipo_area.ts";
import {
  createArea,
  deleteArea,
  getArea,
  getAreas,
  getAreasTable,
  updateArea,
} from "./handlers/organizacion/area.ts";
import {
  createSubArea,
  deleteSubArea,
  getSubArea,
  getSubAreas,
  getSubAreasTable,
  updateSubArea,
} from "./handlers/organizacion/sub_area.ts";
import {
  createPosition,
  deletePosition,
  getPosition,
  getPositions,
  getPositionsTable,
  updatePosition,
} from "./handlers/organizacion/cargo.ts";
import * as computers from "./handlers/organizacion/computador.ts";
import * as licences from "./handlers/organizacion/licencia.ts";
import * as hourly_cost from "./handlers/organizacion/costo_interno.ts";
import * as external_cost from "./handlers/organizacion/costo_externo.ts";
import {
  createAssignation as createPositionAssignation,
  deleteAssignation as deletePositionAssignation,
  getAssignation as getPositionAssignation,
  getAssignations as getPositionAssignations,
  getAssignationsTable as getPositionAssignationsTable,
  updateAssignation as updatePositionAssignation,
} from "./handlers/organizacion/asignacion_cargo.ts";
import {
  createBudgetType,
  deleteBudgetType,
  getBudgetType,
  getBudgetTypes,
  getBudgetTypesTable,
  updateBudgetType,
} from "./handlers/operaciones/tipo_presupuesto.ts";
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  getRolesTable,
  searchRoles,
  updateRole,
} from "./handlers/operaciones/rol.ts";
import * as budget from "./handlers/operaciones/presupuesto.ts";
import { searchBudgetDetails } from "./handlers/operaciones/presupuesto_detalle.ts";
import * as parameter from "./handlers/maestro/parametro.ts";
import * as parameter_definition from "./handlers/maestro/parametro_definicion.ts";
import { getBlacklistedDays } from "./handlers/maestro/tiempo.ts";
import { getProfile, getProfiles } from "./handlers/maestro/permiso.ts";
import {
  createAccess,
  deleteAccess,
  getAccess,
  getAccesses,
  getAccessesTable,
  updateAccess,
} from "./handlers/maestro/access.ts";
import {
  createResource,
  deleteResource,
  getResource,
  getResources,
  getResourcesGantt,
  getResourcesHeatmap,
  getResourcesTable,
  updateResource,
} from "./handlers/planeacion/recurso.ts";
import {
  createAssignation,
  deleteAssignation,
  getAssignation,
  getAssignations,
  getAssignationsTable,
  getAssignationWeeks,
  updateAssignation,
} from "./handlers/asignacion.ts";
import * as registry from "./handlers/registro.ts";
import {
  createAssignationRequest,
  getAssignationRequestTable,
  updateAssignationRequest,
} from "./handlers/asignacion_solicitud.ts";
import * as people_supports from "./handlers/maestro/plantilla.ts";
import * as file from "./handlers/archivo.ts";
import * as hr_person from "./handlers/humanos/persona.ts";
import * as hr_academic_formation from "./handlers/humanos/formacion/academica.ts";
import * as hr_continuous_formation from "./handlers/humanos/formacion/continuada.ts";
import * as hr_training_formation from "./handlers/humanos/formacion/capacitacion.ts";
import * as hr_laboral_experience from "./handlers/humanos/experiencia/laboral.ts";
import * as hr_project_experience from "./handlers/humanos/experiencia/proyecto.ts";
import * as hr_certification from "./handlers/humanos/certificacion.ts";
import * as week_close_request from "./handlers/solicitud/cierre.ts";

const main_router = new Router();

// TODO Should be wrapped inside api_router
// It should be called inside main router
// Definetely find a shorter version for permission grant (inherit?)
main_router
  .post("/api/auth", createSession);

main_router
  .get("/api/usuario/contacto", checkUserAccess(), user_profile.getContacts)
  .get(
    "/api/usuario/contacto/table",
    checkUserAccess(),
    user_profile.getContactsTable,
  )
  .post(
    "/api/usuario/contacto",
    checkUserAccess(),
    user_profile.createContact,
  )
  .put<{ id: string }>(
    "/api/usuario/contacto/:id",
    checkUserAccess(),
    user_profile.updateContact,
  )
  .delete<{ id: string }>(
    "/api/usuario/contacto/:id",
    checkUserAccess(),
    user_profile.deleteContact,
  )
  .get(
    "/api/usuario/idiomas",
    checkUserAccess(),
    user_profile.getLanguageExperience,
  )
  .get(
    "/api/usuario/idiomas/table",
    checkUserAccess(),
    user_profile.getLanguageExperienceTable,
  )
  .post(
    "/api/usuario/idiomas",
    checkUserAccess(),
    user_profile.createLanguageExperience,
  )
  .put<{ id: string }>(
    "/api/usuario/idiomas/:id",
    checkUserAccess(),
    user_profile.updateLanguageExperience,
  )
  .delete<{ id: string }>(
    "/api/usuario/idiomas/:id",
    checkUserAccess(),
    user_profile.deleteLanguageExperience,
  )
  .get("/api/usuario/hijos", checkUserAccess(), user_profile.getChildren)
  .get(
    "/api/usuario/hijos/table",
    checkUserAccess(),
    user_profile.getChildrenTable,
  )
  .post(
    "/api/usuario/hijos",
    checkUserAccess(),
    user_profile.createChildren,
  )
  .put<{ id: string }>(
    "/api/usuario/hijos/:id",
    checkUserAccess(),
    user_profile.updateChildren,
  )
  .delete<{ id: string }>(
    "/api/usuario/hijos/:id",
    checkUserAccess(),
    user_profile.deleteChildren,
  )
  .post(
    "/api/usuario/soportes",
    checkUserAccess(),
    user_profile.getSupportFiles,
  )
  .get<{ id: string }>(
    "/api/usuario/soportes/:id",
    checkUserAccess(),
    user_profile.getSupportFile,
  )
  .put<{ id: string }>(
    "/api/usuario/soportes/:id",
    checkUserAccess(),
    user_profile.uploadSupportFile,
  )
  .get("/api/usuario/foto", checkUserAccess(), user_profile.getPicture)
  .put("/api/usuario/foto", checkUserAccess(), user_profile.updatePicture)
  .get(
    "/api/usuario",
    checkUserAccess(),
    user_profile.getUserInformation,
  )
  .put(
    "/api/usuario",
    checkUserAccess(),
    user_profile.updateUserInformation,
  )
  .get(
    "/api/usuario/planeacion",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    user_profile.getPlanning,
  );

main_router
  .get(
    "/api/usuario/formacion/academica",
    checkUserAccess(),
    user_academic_title.getAcademicFormationTitles,
  )
  .post(
    "/api/usuario/formacion/academica/table",
    checkUserAccess(),
    user_academic_title.getAcademicFormationTitlesTable,
  )
  .put<{ id: string }>(
    "/api/usuario/formacion/academica/certificado/:id",
    checkUserAccess(),
    user_academic_title.updateAcademicFormationTitleCertificate,
  )
  .get<{ id: string }>(
    "/api/usuario/formacion/academica/:id",
    checkUserAccess(),
    user_academic_title.getAcademicFormationTitle,
  )
  .post(
    "/api/usuario/formacion/academica",
    checkUserAccess(),
    user_academic_title.createAcademicFormationTitle,
  )
  .put<{ id: string }>(
    "/api/usuario/formacion/academica/:id",
    checkUserAccess(),
    user_academic_title.updateAcademicFormationTitle,
  )
  .delete<{ id: string }>(
    "/api/usuario/formacion/academica/:id",
    checkUserAccess(),
    user_academic_title.deleteAcademicFormationTitle,
  );

main_router
  .get(
    "/api/usuario/formacion/continuada",
    checkUserAccess(),
    user_continuous_title.getContinuousFormationTitles,
  )
  .post(
    "/api/usuario/formacion/continuada/table",
    checkUserAccess(),
    user_continuous_title.getContinuousFormationTitlesTable,
  )
  .put<{ id: string }>(
    "/api/usuario/formacion/continuada/certificado/:id",
    checkUserAccess(),
    user_continuous_title.updateContinuousFormationTitleCertificate,
  )
  .get<{ id: string }>(
    "/api/usuario/formacion/continuada/:id",
    checkUserAccess(),
    user_continuous_title.getContinuousFormationTitle,
  )
  .post(
    "/api/usuario/formacion/continuada",
    checkUserAccess(),
    user_continuous_title.createContinuousFormationTitle,
  )
  .put<{ id: string }>(
    "/api/usuario/formacion/continuada/:id",
    checkUserAccess(),
    user_continuous_title.updateContinuousFormationTitle,
  )
  .delete<{ id: string }>(
    "/api/usuario/formacion/continuada/:id",
    checkUserAccess(),
    user_continuous_title.deleteContinuousFormationTitle,
  );

main_router
  .get(
    "/api/usuario/formacion/capacitacion",
    checkUserAccess(),
    user_training_title.getTrainingTitles,
  )
  .post(
    "/api/usuario/formacion/capacitacion/table",
    checkUserAccess(),
    user_training_title.getTrainingTitlesTable,
  )
  .get<{ id: string }>(
    "/api/usuario/formacion/capacitacion/:id",
    checkUserAccess(),
    user_training_title.getTrainingTitle,
  )
  .post(
    "/api/usuario/formacion/capacitacion",
    checkUserAccess(),
    user_training_title.createTrainingTitle,
  )
  .put<{ id: string }>(
    "/api/usuario/formacion/capacitacion/:id",
    checkUserAccess(),
    user_training_title.updateTrainingTitle,
  )
  .delete<{ id: string }>(
    "/api/usuario/formacion/capacitacion/:id",
    checkUserAccess(),
    user_training_title.deleteTrainingTitle,
  );

main_router
  .get(
    "/api/usuario/experiencia/laboral",
    checkUserAccess(),
    user_laboral_experience.getLaboralExperiences,
  )
  .post(
    "/api/usuario/experiencia/laboral/table",
    checkUserAccess(),
    user_laboral_experience.getLaboralExperiencesTable,
  )
  .put<{ id: string }>(
    "/api/usuario/experiencia/laboral/certificado/:id",
    checkUserAccess(),
    user_laboral_experience.updateLaboralExperienceCertificate,
  )
  .get<{ id: string }>(
    "/api/usuario/experiencia/laboral/:id",
    checkUserAccess(),
    user_laboral_experience.getLaboralExperience,
  )
  .post(
    "/api/usuario/experiencia/laboral",
    checkUserAccess(),
    user_laboral_experience.createLaboralExperience,
  )
  .put<{ id: string }>(
    "/api/usuario/experiencia/laboral/:id",
    checkUserAccess(),
    user_laboral_experience.updateLaboralExperience,
  )
  .delete<{ id: string }>(
    "/api/usuario/experiencia/laboral/:id",
    checkUserAccess(),
    user_laboral_experience.deleteLaboralExperience,
  );

main_router
  .get(
    "/api/usuario/experiencia/proyecto",
    checkUserAccess(),
    user_project_experience.getProjectExperiences,
  )
  .post(
    "/api/usuario/experiencia/proyecto/table",
    checkUserAccess(),
    user_project_experience.getProjectExperiencesTable,
  )
  .get<{ id: string }>(
    "/api/usuario/experiencia/proyecto/:id",
    checkUserAccess(),
    user_project_experience.getProjectExperience,
  )
  .post(
    "/api/usuario/experiencia/proyecto",
    checkUserAccess(),
    user_project_experience.createProjectExperience,
  )
  .put<{ id: string }>(
    "/api/usuario/experiencia/proyecto/:id",
    checkUserAccess(),
    user_project_experience.updateProjectExperience,
  )
  .delete<{ id: string }>(
    "/api/usuario/experiencia/proyecto/:id",
    checkUserAccess(),
    user_project_experience.deleteProjectExperience,
  );

main_router
  .get(
    "/api/usuario/habilidad/tecnica",
    checkUserAccess(),
    user_technical_skill.getTechnicalSkills,
  )
  .post(
    "/api/usuario/habilidad/tecnica/table",
    checkUserAccess(),
    user_technical_skill.getTechnicalSkillsTable,
  )
  .get<{ id: string }>(
    "/api/usuario/habilidad/tecnica/:id",
    checkUserAccess(),
    user_technical_skill.getTechnicalSkill,
  )
  .post(
    "/api/usuario/habilidad/tecnica",
    checkUserAccess(),
    user_technical_skill.createTechnicalSkill,
  )
  .put<{ id: string }>(
    "/api/usuario/habilidad/tecnica/:id",
    checkUserAccess(),
    user_technical_skill.updateTechnicalSkill,
  )
  .delete<{ id: string }>(
    "/api/usuario/habilidad/tecnica/:id",
    checkUserAccess(),
    user_technical_skill.deleteTechnicalSkill,
  );

main_router
  .get(
    "/api/usuario/certificacion",
    checkUserAccess(),
    user_certification.getCertifications,
  )
  .post(
    "/api/usuario/certificacion/table",
    checkUserAccess(),
    user_certification.getCertificationsTable,
  )
  .put<{ id: string }>(
    "/api/usuario/certificacion/certificado/:id",
    checkUserAccess(),
    user_certification.updateCertificationFile,
  )
  .get<{ id: string }>(
    "/api/usuario/certificacion/:id",
    checkUserAccess(),
    user_certification.getCertification,
  )
  .post(
    "/api/usuario/certificacion",
    checkUserAccess(),
    user_certification.createCertification,
  )
  .put<{ id: string }>(
    "/api/usuario/certificacion/:id",
    checkUserAccess(),
    user_certification.updateCertification,
  )
  .delete<{ id: string }>(
    "/api/usuario/certificacion/:id",
    checkUserAccess(),
    user_certification.deleteCertification,
  );

main_router
  .get(
    "/api/maestro/parametro",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    parameter.getParameters,
  )
  .post(
    "/api/maestro/parametro/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    parameter.getParametersTable,
  )
  .get<{ code: string }>(
    "/api/maestro/parametro/valor/:code",
    checkUserAccess(),
    parameter.getParameterValue,
  )
  .get<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    parameter.getParameter,
  )
  .post(
    "/api/maestro/parametro",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    parameter.createParameter,
  )
  .put<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    parameter.updateParameter,
  )
  .delete<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    parameter.deleteParameter,
  );

main_router
  .get(
    "/api/maestro/parametro_definicion",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    parameter_definition.getParameterDefinitions,
  )
  .get(
    "/api/maestro/parametro_definicion/search",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    parameter_definition.searchParameterDefinition,
  )
  .get<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    parameter_definition.getParameterDefinition,
  )
  .post<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    parameter_definition.createParameterDefinition,
  )
  .put<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    parameter_definition.updateParameterDefinition,
  )
  .delete<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    parameter_definition.deleteParameterDefinition,
  );

main_router
  .get(
    "/api/maestro/tiempo/blacklist",
    checkUserAccess(),
    getBlacklistedDays,
  );

main_router
  .get(
    "/api/maestro/permiso",
    checkUserAccess(),
    getProfiles,
  )
  .get<{ id: string }>(
    "/api/maestro/permiso/:id",
    checkUserAccess(),
    getProfile,
  );

main_router
  .get(
    "/api/maestro/acceso",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccesses,
  )
  .post(
    "/api/maestro/acceso/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccessesTable,
  )
  .get<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccess,
  )
  .post(
    "/api/maestro/acceso",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    createAccess,
  )
  .put<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    updateAccess,
  )
  .delete<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    deleteAccess,
  );

main_router
  .get(
    "/api/maestro/pais",
    checkUserAccess(),
    getCountries,
  )
  .get(
    "/api/maestro/pais/search",
    checkUserAccess(),
    searchCountry,
  )
  .get<{ id: string }>(
    "/api/maestro/pais/:id",
    checkUserAccess(),
    getCountry,
  );

main_router
  .get(
    "/api/maestro/estado",
    checkUserAccess(),
    getStates,
  )
  .get(
    "/api/maestro/estado/search",
    checkUserAccess(),
    searchState,
  )
  .get<{ id: string }>(
    "/api/maestro/estado/:id",
    checkUserAccess(),
    getState,
  );

main_router
  .get(
    "/api/maestro/ciudad",
    checkUserAccess(),
    getCities,
  )
  .get(
    "/api/maestro/ciudad/search",
    checkUserAccess(),
    searchCity,
  )
  .get<{ id: string }>(
    "/api/maestro/ciudad/:id",
    checkUserAccess(),
    getCity,
  );

main_router
  .get(
    "/api/maestro/formato",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    file_formats.getFormats,
  )
  .post(
    "/api/maestro/formato/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    file_formats.getFormatsTable,
  )
  .get<{ id: string }>(
    "/api/maestro/formato/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    file_formats.getFormat,
  )
  .post(
    "/api/maestro/formato",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    file_formats.createFormat,
  )
  .put<{ id: string }>(
    "/api/maestro/formato/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    file_formats.updateFormat,
  )
  .delete<{ id: string }>(
    "/api/maestro/formato/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    file_formats.deleteFormat,
  );

main_router
  .get(
    "/api/maestro/idioma",
    checkUserAccess(),
    language.getLanguages,
  )
  .post(
    "/api/maestro/idioma/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    language.getLanguagesTable,
  )
  .get<{ id: string }>(
    "/api/maestro/idioma/:id",
    checkUserAccess(),
    language.getLanguage,
  )
  .post(
    "/api/maestro/idioma",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    language.createLanguage,
  )
  .put<{ id: string }>(
    "/api/maestro/idioma/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    language.updateLanguage,
  )
  .delete<{ id: string }>(
    "/api/maestro/idioma/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    language.deleteLanguage,
  );

main_router
  .get("/api/maestro/genero", checkUserAccess(), gender.getGenders);

main_router
  .get(
    "/api/maestro/estado_civil",
    checkUserAccess(),
    marital_status.getMaritalStatuses,
  )
  .get<{ id: string }>(
    "/api/maestro/estado_civil/:id",
    checkUserAccess(),
    marital_status.getMaritalStatus,
  );

main_router
  .get(
    "/api/maestro/plantilla",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    people_supports.getSupportFormats,
  )
  .post(
    "/api/maestro/plantilla/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    people_supports.getSupportFormatsTable,
  )
  .get<{ id: string }>(
    "/api/maestro/plantilla/:id",
    checkUserAccess(),
    people_supports.getSupportFormat,
  )
  .post(
    "/api/maestro/plantilla",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    people_supports.createSupportFormat,
  )
  .put<{ id: string }>(
    "/api/maestro/plantilla/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    people_supports.updateSupportFormat,
  )
  .delete<{ id: string }>(
    "/api/maestro/plantilla/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    people_supports.deleteSupportFormat,
  );

main_router
  .get(
    "/api/maestro/nivel_formacion",
    checkUserAccess(),
    formation_level.getFormationLevels,
  )
  .post(
    "/api/maestro/nivel_formacion/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    formation_level.getFormationLevelsTable,
  )
  .get<{ id: string }>(
    "/api/maestro/nivel_formacion/:id",
    checkUserAccess(),
    formation_level.getFormationLevel,
  )
  .post(
    "/api/maestro/nivel_formacion",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    formation_level.createFormationLevel,
  )
  .put<{ id: string }>(
    "/api/maestro/nivel_formacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    formation_level.updateFormationLevel,
  )
  .delete<{ id: string }>(
    "/api/maestro/nivel_formacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    formation_level.deleteFormationLevel,
  );

main_router
  .get(
    "/api/maestro/herramienta",
    checkUserAccess(),
    tool.getTools,
  )
  .post(
    "/api/maestro/herramienta/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    tool.getToolsTable,
  )
  .get<{ id: string }>(
    "/api/maestro/herramienta/:id",
    checkUserAccess(),
    tool.getTool,
  )
  .post(
    "/api/maestro/herramienta",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    tool.createTool,
  )
  .put<{ id: string }>(
    "/api/maestro/herramienta/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    tool.updateTools,
  )
  .delete<{ id: string }>(
    "/api/maestro/herramienta/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    tool.deleteTool,
  );

main_router
  .get(
    "/api/maestro/certificacion/tipo",
    checkUserAccess(),
    certification_type.getTypes,
  )
  .post(
    "/api/maestro/certificacion/tipo/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_type.getTypesTable,
  )
  .get<{ id: string }>(
    "/api/maestro/certificacion/tipo/:id",
    checkUserAccess(),
    certification_type.getType,
  )
  .post(
    "/api/maestro/certificacion/tipo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_type.createType,
  )
  .put<{ id: string }>(
    "/api/maestro/certificacion/tipo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_type.updateTypes,
  )
  .delete<{ id: string }>(
    "/api/maestro/certificacion/tipo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_type.deleteType,
  );

main_router
  .get(
    "/api/maestro/certificacion/proveedor",
    checkUserAccess(),
    certification_provider.getProviders,
  )
  .post(
    "/api/maestro/certificacion/proveedor/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_provider.getProvidersTable,
  )
  .get<{ id: string }>(
    "/api/maestro/certificacion/proveedor/:id",
    checkUserAccess(),
    certification_provider.getProvider,
  )
  .post(
    "/api/maestro/certificacion/proveedor",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_provider.createProvider,
  )
  .put<{ id: string }>(
    "/api/maestro/certificacion/proveedor/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_provider.updateProviders,
  )
  .delete<{ id: string }>(
    "/api/maestro/certificacion/proveedor/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_provider.deleteProvider,
  );

main_router
  .get(
    "/api/maestro/certificacion/plantilla",
    checkUserAccess(),
    certification_template.getTemplates,
  )
  .post(
    "/api/maestro/certificacion/plantilla/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_template.getProvidersTable,
  )
  .get<{ id: string }>(
    "/api/maestro/certificacion/plantilla/:id",
    checkUserAccess(),
    certification_template.getTemplate,
  )
  .post(
    "/api/maestro/certificacion/plantilla",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_template.createTemplate,
  )
  .put<{ id: string }>(
    "/api/maestro/certificacion/plantilla/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_template.updateTemplates,
  )
  .delete<{ id: string }>(
    "/api/maestro/certificacion/plantilla/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    certification_template.deleteTemplate,
  );

main_router
  .get(
    "/api/clientes/cliente",
    checkUserAccess(),
    clients.getClients,
  )
  .post(
    "/api/clientes/cliente/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    clients.getClientsTable,
  )
  .get<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkUserAccess(),
    clients.getClient,
  )
  .post(
    "/api/clientes/cliente",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    clients.createClient,
  )
  .put<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    clients.updateClient,
  )
  .delete<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    clients.deleteClient,
  );

main_router
  .get(
    "/api/clientes/contacto",
    checkUserAccess(),
    getContacts,
  )
  .post(
    "/api/clientes/contacto/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getContactsTable,
  )
  .post(
    "/api/clientes/contacto",
    checkUserAccess(),
    createContact,
  )
  .get<{ id: string }>(
    "/api/clientes/contacto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getContact,
  )
  .put<{ id: string }>(
    "/api/clientes/contacto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateContact,
  )
  .delete<{ id: string }>(
    "/api/clientes/contacto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    deleteContact,
  );

main_router
  .get(
    "/api/clientes/sector",
    checkUserAccess(),
    getSectors,
  )
  .post(
    "/api/clientes/sector/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSectorsTable,
  )
  .get<{ id: string }>(
    "/api/clientes/sector/:id",
    checkUserAccess(),
    getSector,
  )
  .post(
    "/api/clientes/sector",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    createSector,
  )
  .put<{ id: string }>(
    "/api/clientes/sector/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    updateSector,
  )
  .delete<{ id: string }>(
    "/api/clientes/sector/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    deleteSector,
  );

main_router
  .get(
    "/api/operaciones/tipo_proyecto",
    checkUserAccess(),
    getProjectTypes,
  )
  .post(
    "/api/operaciones/tipo_proyecto/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
    ]),
    getProjectTypesTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkUserAccess(),
    getProjectType,
  )
  .post(
    "/api/operaciones/tipo_proyecto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createProjectType,
  )
  .put<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateProjectType,
  )
  .delete<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteProjectType,
  );

main_router
  .get(
    "/api/operaciones/proyecto",
    checkUserAccess(),
    getProjects,
  )
  .post(
    "/api/operaciones/proyecto/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProjectsTable,
  )
  .get(
    "/api/operaciones/proyecto/search",
    checkUserAccess(),
    searchProject,
  )
  .get<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProject,
  )
  .post(
    "/api/operaciones/proyecto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    createProject,
  )
  .put<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    updateProject,
  )
  .delete<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    deleteProject,
  );

main_router
  .get(
    "/api/operaciones/tipo_presupuesto",
    checkUserAccess(),
    getBudgetTypes,
  )
  .post(
    "/api/operaciones/tipo_presupuesto/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgetTypesTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkUserAccess(),
    getBudgetType,
  )
  .post(
    "/api/operaciones/tipo_presupuesto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createBudgetType,
  )
  .put<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateBudgetType,
  )
  .delete<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteBudgetType,
  );

main_router
  .get(
    "/api/operaciones/rol",
    checkUserAccess(),
    getRoles,
  )
  .post(
    "/api/operaciones/rol/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getRolesTable,
  )
  .get(
    "/api/operaciones/rol/search",
    checkUserAccess(),
    searchRoles,
  )
  .get<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkUserAccess(),
    getRole,
  )
  .post(
    "/api/operaciones/rol",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createRole,
  )
  .put<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateRole,
  )
  .delete<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteRole,
  );

main_router
  .get(
    "/api/operaciones/presupuesto",
    checkUserAccess(),
    budget.getBudgets,
  )
  .post(
    "/api/operaciones/presupuesto/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    budget.getBudgetTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/presupuesto/:id",
    checkUserAccess(),
    budget.getBudget,
  )
  .post(
    "/api/operaciones/presupuesto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    budget.createBudget,
  )
  .put<{ id: string }>(
    "/api/operaciones/presupuesto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    budget.updateBudget,
  )
  .delete<{ id: string }>(
    "/api/operaciones/presupuesto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    budget.deleteBudget,
  );

main_router
  .get<{ id: string }>(
    "/api/operaciones/presupuesto_detalle/:id",
    checkUserAccess(),
    searchBudgetDetails,
  );

main_router
  .get(
    "/api/organizacion/tipo_area",
    checkUserAccess(),
    getAreaTypes,
  )
  .post(
    "/api/organizacion/tipo_area/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreaTypesTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkUserAccess(),
    getAreaType,
  )
  .post(
    "/api/organizacion/tipo_area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createAreaType,
  )
  .put<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateAreaType,
  )
  .delete<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteAreaType,
  );

main_router
  .get(
    "/api/organizacion/area",
    checkUserAccess(),
    getAreas,
  )
  .post(
    "/api/organizacion/area/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreasTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/area/:id",
    checkUserAccess(),
    getArea,
  )
  .post(
    "/api/organizacion/area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createArea,
  )
  .put<{ id: string }>(
    "/api/organizacion/area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateArea,
  )
  .delete<{ id: string }>(
    "/api/organizacion/area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteArea,
  );

main_router
  .get(
    "/api/organizacion/sub_area",
    checkUserAccess(),
    getSubAreas,
  )
  .post(
    "/api/organizacion/sub_area/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSubAreasTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkUserAccess(),
    getSubArea,
  )
  .post(
    "/api/organizacion/sub_area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createSubArea,
  )
  .put<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateSubArea,
  )
  .delete<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteSubArea,
  );

main_router
  .get(
    "/api/organizacion/persona",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    person.getPeople,
  )
  .post(
    "/api/organizacion/persona/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    person.getPeopleTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/persona/foto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    person.getPicture,
  )
  .get<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    person.getPerson,
  )
  .post(
    "/api/organizacion/persona",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    person.createPerson,
  )
  .put<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    person.updatePerson,
  )
  .delete<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    person.deletePerson,
  );

main_router
  .get(
    "/api/organizacion/cargo",
    checkUserAccess(),
    getPositions,
  )
  .post(
    "/api/organizacion/cargo/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPositionsTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkUserAccess(),
    getPosition,
  )
  .post(
    "/api/organizacion/cargo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPosition,
  )
  .put<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePosition,
  )
  .delete<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePosition,
  );

main_router
  .get(
    "/api/organizacion/asignacion_cargo",
    checkUserAccess(),
    getPositionAssignations,
  )
  .post(
    "/api/organizacion/asignacion_cargo/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPositionAssignationsTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkUserAccess(),
    getPositionAssignation,
  )
  .post(
    "/api/organizacion/asignacion_cargo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPositionAssignation,
  )
  .put<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePositionAssignation,
  )
  .delete<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePositionAssignation,
  );

main_router
  .get(
    "/api/organizacion/computador",
    checkUserAccess(),
    computers.getComputers,
  )
  .post(
    "/api/organizacion/computador/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    computers.getComputersTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/computador/:id",
    checkUserAccess(),
    computers.getComputer,
  )
  .post(
    "/api/organizacion/computador",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    computers.createComputer,
  )
  .put<{ id: string }>(
    "/api/organizacion/computador/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    computers.updateComputer,
  )
  .delete<{ id: string }>(
    "/api/organizacion/computador/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    computers.deleteComputer,
  );

main_router
  .get(
    "/api/organizacion/licencia",
    checkUserAccess(),
    licences.getLicenses,
  )
  .post(
    "/api/organizacion/licencia/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    licences.getLicencesTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkUserAccess(),
    licences.getLicense,
  )
  .post(
    "/api/organizacion/licencia",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    licences.createLicense,
  )
  .put<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    licences.updateLicense,
  )
  .delete<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    licences.deleteLicense,
  );

main_router
  .post(
    "/api/organizacion/costo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    person.getCostTable,
  )
  .post(
    "/api/organizacion/costo/interno/calculo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hourly_cost.getCalculatedCost,
  )
  .get<{ person: string }>(
    "/api/organizacion/costo/interno/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hourly_cost.getCost,
  )
  .put<{ person: string }>(
    "/api/organizacion/costo/interno/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hourly_cost.updateCost,
  )
  .get<{ person: string }>(
    "/api/organizacion/costo/externo/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    external_cost.getCosts,
  )
  .put<{ person: string }>(
    "/api/organizacion/costo/externo/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    external_cost.updateCosts,
  );

main_router
  .get(
    "/api/planeacion/recurso",
    checkUserAccess(),
    getResources,
  )
  .get(
    "/api/planeacion/recurso/gantt",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesGantt,
  )
  .post(
    "/api/planeacion/recurso/heatmap",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesHeatmap,
  )
  .post(
    "/api/planeacion/recurso/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesTable,
  )
  .get<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkUserAccess(),
    getResource,
  )
  .post(
    "/api/planeacion/recurso",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    createResource,
  )
  .put<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateResource,
  )
  .delete<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    deleteResource,
  );

main_router
  .get(
    "/api/asignacion/asignacion",
    checkUserAccess(),
    getAssignations,
  )
  .get(
    "/api/asignacion/asignacion/semanas",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignationWeeks,
  )
  .get<{ id: string }>(
    "/api/asignacion/asignacion/:id",
    checkUserAccess(),
    getAssignation,
  )
  .post(
    "/api/asignacion/asignacion/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignationsTable,
  )
  .post(
    "/api/asignacion/asignacion",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    createAssignation,
  )
  .put<{ id: string }>(
    "/api/asignacion/asignacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateAssignation,
  )
  .delete<{ id: string }>(
    "/api/asignacion/asignacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    deleteAssignation,
  );

main_router
  .get(
    "/api/registro",
    checkUserAccess(),
    registry.getWeekDetailTable,
  )
  .put(
    "/api/registro",
    checkUserAccess(),
    registry.closePersonWeek,
  )
  //TODO
  //Maybe add a route to get the requested week info
  //Not just current week
  .get(
    "/api/registro/semana",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    registry.getWeekInformation,
  )
  .get<{ person: string }>(
    "/api/registro/semanas/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    registry.getRegistrableWeeks,
  );

main_router
  //TODO
  //Person should be inferred not passed through query
  .get<{ person: string }>(
    "/api/asignacion_solicitud/table/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignationRequestTable,
  )
  .post<{ person: string }>(
    "/api/asignacion_solicitud/:person",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    createAssignationRequest,
  )
  .put<{ id: string }>(
    "/api/asignacion_solicitud/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateAssignationRequest,
  );

main_router
  .get<{ id: string }>(
    "/api/archivos/generico/:id",
    checkUserAccess(),
    file.getGenericFile,
  )
  .get<{ person: string; id: string }>(
    "/api/archivos/plantilla/:person/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    file.getTemplateFile,
  )
  .get<{ person: string; id: string }>(
    "/api/archivos/plantilla/:id",
    checkUserAccess(),
    file.getTemplateFile,
  );

main_router
  .post(
    "/api/humanos/persona/soporte/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_person.getSupportFiles,
  )
  .put<{ code: string }>(
    "/api/humanos/persona/soporte/:code",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_person.updateSupportFileReview,
  )
  .put<{ tipo: string; id: string }>(
    "/api/humanos/persona/:tipo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_person.updatePersonReview,
  )
  // POST based cause I need a reliable request body
  .post<{ person: string }>(
    "/api/humanos/persona/hv/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_person.getResume,
  );

main_router
  .post(
    "/api/humanos/formacion/academica/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_academic_formation.getTitlesTable,
  )
  .get<{ id: string }>(
    "/api/humanos/formacion/academica/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_academic_formation.getTitle,
  )
  .put<{ id: string }>(
    "/api/humanos/formacion/academica/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_academic_formation.updateTitleReview,
  );

main_router
  .post(
    "/api/humanos/formacion/continuada/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_continuous_formation.getTitlesTable,
  )
  .get<{ id: string }>(
    "/api/humanos/formacion/continuada/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_continuous_formation.getTitle,
  )
  .put<{ id: string }>(
    "/api/humanos/formacion/continuada/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_continuous_formation.updateTitleReview,
  );

main_router
  .post(
    "/api/humanos/formacion/capacitacion/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_training_formation.getTitlesTable,
  )
  .get<{ id: string }>(
    "/api/humanos/formacion/capacitacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_training_formation.getTitle,
  )
  .put<{ id: string }>(
    "/api/humanos/formacion/capacitacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_training_formation.updateTitleReview,
  );

main_router
  .post(
    "/api/humanos/experiencia/laboral/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_laboral_experience.getExperienceTable,
  )
  .get<{ id: string }>(
    "/api/humanos/experiencia/laboral/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_laboral_experience.getExperience,
  )
  .put<{ id: string }>(
    "/api/humanos/experiencia/laboral/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_laboral_experience.updateExperienceReview,
  );

main_router
  .post(
    "/api/humanos/experiencia/proyecto/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_project_experience.getExperienceTable,
  )
  .get<{ id: string }>(
    "/api/humanos/experiencia/proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_project_experience.getExperience,
  )
  .put<{ id: string }>(
    "/api/humanos/experiencia/proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_project_experience.updateExperienceReview,
  );

main_router
  .post(
    "/api/humanos/certificacion/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_certification.getCertificationTable,
  )
  .get<{ id: string }>(
    "/api/humanos/certificacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_certification.getCertification,
  )
  .put<{ id: string }>(
    "/api/humanos/certificacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    hr_certification.updateCertificationReview,
  );

main_router
  .get(
    "/api/solicitud/cierre",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
    ]),
    week_close_request.getEarlyRequestRequestTable,
  )
  .post(
    "/api/solicitud/cierre",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    week_close_request.createEarlyCloseRequest,
  )
  .put<{ id: string }>(
    "/api/solicitud/cierre/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
    ]),
    week_close_request.updateEarlyCloseRequest,
  );

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
