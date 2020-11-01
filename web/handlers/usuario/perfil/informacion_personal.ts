import {
  findById,
  People,
  TipoIdentificacion,
  TipoSangre,
} from "../../../../api/models/ORGANIZACION/people.ts";
import {
  getReview as getIdentificationReview,
} from "../../../../api/reviews/user_identification.ts";
import {
  getReview as getPersonalDataReview,
} from "../../../../api/reviews/user_personal_data.ts";
import {
  getReview as getResidenceReview,
} from "../../../../api/reviews/user_residence.ts";

class PersonalInformation extends People {
  identificacion_aprobada?: boolean;
  identificacion_observaciones?: string | null;
  informacion_principal_aprobada?: boolean;
  informacion_principal_observaciones?: string | null;
  residencia_aprobada?: boolean;
  residencia_observaciones?: string | null;

  constructor(
    pk_persona: number,
    tipo_identificacion: TipoIdentificacion,
    identificacion: string,
    fec_expedicion_identificacion: string | null,
    fk_ciudad_expedicion_identificacion: number | null,
    nombre: string,
    telefono: string,
    correo: string,
    fec_nacimiento: string | null,
    fk_ciudad_nacimiento: number | null,
    libreta_militar: number | null,
    fk_genero: number | null,
    fk_estado_civil: number | null,
    correo_personal: string | null,
    telefono_fijo: number | null,
    tipo_sangre: TipoSangre | null,
    fk_ciudad_residencia: number | null,
    direccion_residencia: string | null,
    fecha_inicio: string | null,
    fecha_retiro: string | null,
    expedicion_tarjeta_profesional: string | null,
  ) {
    super(
      pk_persona,
      tipo_identificacion,
      identificacion,
      fec_expedicion_identificacion,
      fk_ciudad_expedicion_identificacion,
      nombre,
      telefono,
      correo,
      fec_nacimiento,
      fk_ciudad_nacimiento,
      libreta_militar,
      fk_genero,
      fk_estado_civil,
      correo_personal,
      telefono_fijo,
      tipo_sangre,
      fk_ciudad_residencia,
      direccion_residencia,
      fecha_inicio,
      fecha_retiro,
      expedicion_tarjeta_profesional,
    );
  }

  async refreshReviewStatus() {
    const identification_review = await getIdentificationReview(
      String(this.pk_persona),
    );
    const personal_data_review = await getPersonalDataReview(
      String(this.pk_persona),
    );
    const residence_review = await getResidenceReview(String(this.pk_persona));

    this.identificacion_aprobada = !!identification_review?.approved;
    this.identificacion_observaciones = identification_review?.comments || null;

    this.informacion_principal_aprobada = !!personal_data_review?.approved;
    this.informacion_principal_observaciones = personal_data_review?.comments ||
      null;

    this.residencia_aprobada = !!residence_review?.approved;
    this.residencia_observaciones = residence_review?.comments || null;
  }

  async updateInformation(
    fec_expedicion_identificacion = this.fec_expedicion_identificacion,
    fk_ciudad_expedicion_identificacion =
      this.fk_ciudad_expedicion_identificacion,
    fec_nacimiento = this.fec_nacimiento,
    fk_ciudad_nacimiento = this.fk_ciudad_nacimiento,
    libreta_militar = this.libreta_militar,
    fk_genero = this.fk_genero,
    fk_estado_civil = this.fk_estado_civil,
    correo_personal = this.correo_personal,
    telefono_fijo = this.telefono_fijo,
    tipo_sangre = this.tipo_sangre,
    fk_ciudad_residencia = this.fk_ciudad_residencia,
    direccion_residencia = this.direccion_residencia,
    expedicion_tarjeta_profesional = this.expedicion_tarjeta_profesional,
  ) {
    await super.update(
      undefined,
      undefined,
      fec_expedicion_identificacion,
      fk_ciudad_expedicion_identificacion,
      undefined,
      undefined,
      fec_nacimiento,
      fk_ciudad_nacimiento,
      libreta_militar,
      fk_genero,
      fk_estado_civil,
      correo_personal,
      telefono_fijo,
      tipo_sangre,
      fk_ciudad_residencia,
      direccion_residencia,
      undefined,
      undefined,
      expedicion_tarjeta_profesional,
    );
    await this.refreshReviewStatus();

    return this;
  }
}

export const findPersonalInformation = async (person: number) => {
  const user_data = await findById(person);
  if (!user_data) {
    return null;
  }

  const personal_information = new PersonalInformation(
    user_data.pk_persona,
    user_data.tipo_identificacion,
    user_data.identificacion,
    user_data.fec_expedicion_identificacion,
    user_data.fk_ciudad_expedicion_identificacion,
    user_data.nombre,
    user_data.telefono,
    user_data.correo,
    user_data.fec_nacimiento,
    user_data.fk_ciudad_nacimiento,
    user_data.libreta_militar,
    user_data.fk_genero,
    user_data.fk_estado_civil,
    user_data.correo_personal,
    user_data.telefono_fijo,
    user_data.tipo_sangre,
    user_data.fk_ciudad_residencia,
    user_data.direccion_residencia,
    user_data.fecha_inicio,
    user_data.fecha_retiro,
    user_data.expedicion_tarjeta_profesional,
  );
  await personal_information.refreshReviewStatus();

  return personal_information;
};
