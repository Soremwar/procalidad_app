import {
  findById as findTemplate,
} from "../models/files/template.ts";
import {
  upsert as registerTemplateFileUpload,
  findByTemplateAndUser as getTemplateFileModel,
} from "../models/files/template_file.ts";
import {
  findById as getUserModel,
} from "../models/ORGANIZACION/people.ts";
import {
  getUploadFile,
  writeUploadFile,
} from "../services/storage.js";
import {
  extname,
} from "path";
import { NotFoundError } from "../../web/exceptions.ts";
import type {
  File,
  FileProps,
} from "./common.ts";

const generateFileProps = async (
  template: number,
  user: number,
  uploaded_file_name: string,
): Promise<FileProps> => {
  const template_model = await findTemplate(template);
  if (!template_model) throw new NotFoundError();
  const file_path_base = await template_model.getPath();

  const user_model = await getUserModel(user);
  if (!user_model) throw new NotFoundError();
  const email_base = user_model.correo.split("@")[0].toUpperCase();
  const prefix = template_model.prefix.toUpperCase();
  const extension = extname(uploaded_file_name).toLowerCase();
  const file_name =
    `${user_model.pk_persona}_${email_base}_${prefix}${extension}`;

  return {
    name: file_name,
    path: `${file_path_base}/${file_name}`,
  };
};

const getFileProps = async (
  template_id: number,
  user_id: number,
): Promise<FileProps> => {
  const template_model = await findTemplate(template_id);
  if (!template_model) throw new NotFoundError();
  const file_path_base = await template_model.getPath();

  const file_model = await getTemplateFileModel(
    template_id,
    user_id,
  );
  if (!file_model) throw new NotFoundError();
  const file_name = file_model.name;

  return {
    name: file_name,
    path: `${file_path_base}/${file_name}`,
  };
};

export const getFile = async (
  template_id: number,
  user_id: number,
): Promise<File> => {
  const { name, path } = await getFileProps(template_id, user_id);
  const { content, type } = await getUploadFile(path);

  return {
    content,
    name,
    path,
    type,
  };
};

export const writeFile = async (
  template_id: number,
  user_id: number,
  content: Uint8Array,
  file_name: string,
) => {
  const {
    name,
    path,
  } = await generateFileProps(template_id, user_id, file_name);

  await writeUploadFile(
    path,
    content,
  );

  return await registerTemplateFileUpload(
    template_id,
    user_id,
    name,
  );
};
