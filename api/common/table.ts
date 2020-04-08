export enum Order {
  "asc",
  "desc",
}

export interface TableOrder {
  [key: string]: Order,
}
