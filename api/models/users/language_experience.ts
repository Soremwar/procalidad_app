import postgres from "../../services/postgres.ts";
import { TABLE as LANGUAGE_TABLE } from "../MAESTRO/language.ts";

export const TABLE = "USUARIOS.IDIOMA_REGISTRO";

export enum SkillLevel {
  "A" = "A",
  "B" = "B",
  "D" = "D",
}

class LanguageExperience {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public language: number,
    public read_skill: SkillLevel,
    public write_skill: SkillLevel,
    public talk_skill: SkillLevel,
    public listen_skill: SkillLevel,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_REGISTRO = $1`,
      this.id,
    );
  }

  async update(
    language: number,
    read_skill: SkillLevel,
    write_skill: SkillLevel,
    talk_skill: SkillLevel,
    listen_skill: SkillLevel,
  ): Promise<LanguageExperience> {
    Object.assign(this, {
      language,
      read_skill,
      write_skill,
      talk_skill,
      listen_skill,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_IDIOMA = $2,
        ESTADO_LECTURA = $3,
        ESTADO_ESCRITURA = $4,
        ESTADO_HABLA = $5,
        ESTADO_ESCUCHA = $6
      WHERE PK_REGISTRO = $1`,
      this.id,
      this.language,
      this.read_skill,
      this.write_skill,
      this.talk_skill,
      this.listen_skill,
    );

    return this;
  }
}

export const create = async (
  person: number,
  language: number,
  read_skill: SkillLevel,
  write_skill: SkillLevel,
  talk_skill: SkillLevel,
  listen_skill: SkillLevel,
): Promise<LanguageExperience> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
        FK_PERSONA,
        FK_IDIOMA,
        ESTADO_LECTURA,
        ESTADO_ESCRITURA,
        ESTADO_HABLA,
        ESTADO_ESCUCHA
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      ) RETURNING PK_REGISTRO`,
    person,
    language,
    read_skill,
    write_skill,
    talk_skill,
    listen_skill,
  );

  const id: number = rows[0][0];

  return new LanguageExperience(
    id,
    person,
    language,
    read_skill,
    write_skill,
    talk_skill,
    listen_skill,
  );
};

export const findAll = async (person: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_PERSONA,
      FK_IDIOMA,
      ESTADO_LECTURA::VARCHAR,
      ESTADO_ESCRITURA::VARCHAR,
      ESTADO_HABLA::VARCHAR,
      ESTADO_ESCUCHA::VARCHAR
    FROM ${TABLE}
    WHERE FK_PERSONA = $1`,
    person,
  );

  return rows.map((row: [
    number,
    number,
    number,
    SkillLevel,
    SkillLevel,
    SkillLevel,
    SkillLevel,
  ]) => new LanguageExperience(...row));
};

/*
* Person id is required in order to not tleak other users language experience
* */
export const findById = async (
  person: number,
  id: number,
): Promise<LanguageExperience | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_PERSONA,
      FK_IDIOMA,
      ESTADO_LECTURA::VARCHAR,
      ESTADO_ESCRITURA::VARCHAR,
      ESTADO_HABLA::VARCHAR,
      ESTADO_ESCUCHA::VARCHAR
    FROM ${TABLE}
    WHERE FK_PERSONA = $1
    AND PK_REGISTRO = $2`,
    person,
    id,
  );

  if (!rows.length) return null;

  return new LanguageExperience(
    ...rows[0] as [
      number,
      number,
      number,
      SkillLevel,
      SkillLevel,
      SkillLevel,
      SkillLevel,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly language_id: number,
    public readonly language: string,
    public readonly read_skill: SkillLevel,
    public readonly write_skill: SkillLevel,
    public readonly talk_skill: SkillLevel,
    public readonly listen_skill: SkillLevel,
  ) {}
}

export const getTable = async (person: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_IDIOMA,
      (SELECT NOMBRE FROM ${LANGUAGE_TABLE} WHERE PK_IDIOMA = FK_IDIOMA),
      ESTADO_LECTURA::VARCHAR,
      ESTADO_ESCRITURA::VARCHAR,
      ESTADO_HABLA::VARCHAR,
      ESTADO_ESCUCHA::VARCHAR
    FROM ${TABLE}
    WHERE FK_PERSONA = $1`,
    person,
  );

  return rows.map((row: [
    number,
    number,
    string,
    SkillLevel,
    SkillLevel,
    SkillLevel,
    SkillLevel,
  ]) => new TableData(...row));
};
