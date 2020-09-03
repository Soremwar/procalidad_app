import {
  findById as findTemplate,
} from "../models/files/template.ts";
import {
  upsert as registerTemplateFileUpload,
  findByTemplateAndUser as getTemplateFileModel,
} from "../models/files/template_file.ts";
import {
  create as createGenericFileModel,
  findByIdAndUser as getGenericFileModel,
  GenericFile,
} from "../models/files/generic_file.ts";
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

interface FileProps {
  name: string;
  path: string;
}

interface File extends FileProps {
  content: Uint8Array;
  type: string;
}

const generateGenericFileProps = async (
  path: string,
  name: string,
  user: number,
): Promise<FileProps> => {
  const user_model = await getUserModel(user);
  if (!user_model) throw new NotFoundError();

  const email_base = user_model.correo.split("@")[0].toUpperCase();
  const extension = extname(name).toLowerCase();

  const file_name =
    `${user_model.pk_persona}_${email_base}_${name}${extension}`;

  return {
    name: file_name,
    path: `${path}/${file_name}`,
  };
};

const generateTemplateFileProps = async (
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

const getGenericFileProps = async (
  file_id: number,
  user_id: number,
): Promise<FileProps> => {
  const generic_file_model = await getGenericFileModel(file_id, user_id);
  if (!generic_file_model?.file_name) throw new NotFoundError();

  return {
    name: generic_file_model.file_name,
    path: `${generic_file_model.path}/${generic_file_model.file_name}`,
  };
};

const getTemplateFileProps = async (
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

export const getGenericFile = async (
  file_id: number,
  user_id: number,
): Promise<File> => {
  const { name, path } = await getGenericFileProps(file_id, user_id);
  const { content, type } = await getUploadFile(path);

  return {
    content,
    name,
    path,
    type,
  };
};

export const getTemplateFile = async (
  template_id: number,
  user_id: number,
): Promise<File> => {
  const { name, path } = await getTemplateFileProps(template_id, user_id);
  const { content, type } = await getUploadFile(path);

  return {
    content,
    name,
    path,
    type,
  };
};

export async function writeGenericFile(
  generic_file_id: number,
  user_id: number,
  content: Uint8Array,
): Promise<GenericFile>;

export async function writeGenericFile(
  generic_file_id: undefined,
  user_id: number,
  content: Uint8Array,
  relative_path: string,
  file_name: string,
  max_size: number,
  extensions: string[],
): Promise<GenericFile>;

export async function writeGenericFile(
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
    } = await generateGenericFileProps(relative_path, file_name, user_id);

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
  } = await getGenericFileProps(generic_file_model.id, user_id);

  await writeUploadFile(
    path,
    content,
  );

  return await generic_file_model.updateUploadDate();
}

export const writeTemplateFile = async (
  template_id: number,
  user_id: number,
  content: Uint8Array,
  file_name: string,
) => {
  const {
    name,
    path,
  } = await generateTemplateFileProps(template_id, user_id, file_name);

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
