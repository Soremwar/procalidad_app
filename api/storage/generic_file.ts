import {
  create as createGenericFileModel,
  findByIdAndUser as getGenericFileModel,
  GenericFile,
} from "../models/files/generic_file.ts";
import {
  findById as getUserModel,
} from "../models/ORGANIZACION/people.ts";
import {
  deleteUploadFile,
  getUploadFile,
  writeUploadFile,
} from "../services/storage.js";
import { NotFoundError } from "../../web/exceptions.ts";
import type {
  File,
  FileProps,
} from "./common.ts";

const generateFileProps = async (
  path: string,
  relative_file_name: string,
  user: number,
): Promise<FileProps> => {
  const user_model = await getUserModel(user);
  if (!user_model) throw new NotFoundError();

  const email_base = user_model.correo.split("@")[0].toUpperCase();

  const file_name =
    `${user_model.pk_persona}_${email_base}_${relative_file_name}`;

  return {
    name: file_name,
    path: `${path}/${file_name}`,
  };
};

const getFileProps = async (
  file_id: number,
  user_id?: number,
): Promise<FileProps> => {
  const generic_file_model = await getGenericFileModel(file_id, user_id);
  if (!generic_file_model?.file_name) throw new NotFoundError();

  return {
    name: generic_file_model.file_name,
    path: `${generic_file_model.path}/${generic_file_model.file_name}`,
  };
};

export const deleteFile = async (
  file_id: number,
): Promise<void> => {
  const { path } = await getFileProps(file_id);

  await deleteUploadFile(path);

  const generic_file_model = await getGenericFileModel(file_id);
  if (generic_file_model) {
    await generic_file_model.delete();
  }
};

export const getFile = async (
  file_id: number,
  user_id?: number,
): Promise<File> => {
  const { name, path } = await getFileProps(file_id, user_id);
  const { content, type } = await getUploadFile(path);

  return {
    content,
    name,
    path,
    type,
  };
};

export async function writeFile(
  generic_file_id: number,
  user_id: number,
  content: Uint8Array,
): Promise<GenericFile>;

export async function writeFile(
  generic_file_id: undefined,
  user_id: number,
  content: Uint8Array,
  relative_path: string,
  file_name: string,
  max_size: number,
  extensions: string[],
): Promise<GenericFile>;

export async function writeFile(
  generic_file_id: number | undefined,
  user_id: number,
  content: Uint8Array,
  relative_path?: string,
  file_name?: string,
  max_size?: number,
  extensions?: string[],
): Promise<GenericFile> {
  let generic_file_model: GenericFile;

  if (
    !generic_file_id && relative_path && file_name && max_size && extensions
  ) {
    const {
      name,
    } = await generateFileProps(relative_path, file_name, user_id);

    generic_file_model = await createGenericFileModel(
      user_id,
      relative_path,
      max_size,
      extensions,
      name,
    );
  } else if (!generic_file_id) {
    throw new Error("Los argumentos para cargar el archivo no son válidos");
  } else {
    generic_file_model = await getGenericFileModel(generic_file_id)
      .then((model) => {
        if (!model) {
          throw new NotFoundError();
        } else {
          return model;
        }
      });
  }

  const {
    path,
  } = await getFileProps(generic_file_model.id);

  await writeUploadFile(
    path,
    content,
  );

  return await generic_file_model.updateUploadDate();
}
