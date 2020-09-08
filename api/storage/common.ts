export interface FileProps {
  name: string;
  path: string;
}

export interface File extends FileProps {
  content: Uint8Array;
  type: string;
}
