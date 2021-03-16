import {
  CostType,
  EmployeeType,
  InternalCostType,
  TipoIdentificacion,
  TipoSangre,
} from "./enums.ts";

export type Budget = {
  costo_directo: number;
  costo_imprevisto: number;
  costo_terceros: number;
  descripcion: string;
  estado: boolean;
  factor_productividad: number;
  fk_cliente?: number;
  fk_proyecto: number;
  fk_tipo_presupuesto: number;
  nombre: string;
  pk_presupuesto: number;
  roles: BudgetDetail[];
};

export type BudgetDetail = {
  budget: number;
  hour_cost: number;
  hours: number;
  role: number;
  used: boolean;
};

export type Computer = {
  description: string;
  id: number;
  name: string;
};

export type ComputerCost = {
  computer: number;
  cost: number;
  end_date: string | null;
  id: number;
  start_date: string;
};

export type ComputerData = Computer & {
  costs: ComputerCost[];
};

export type ExternalCost = {
  computer: number;
  cost: number;
  end_date: string;
  licenses: number[];
  other_costs: number;
  id: number;
  person: number;
  start_date: string;
  type: CostType;
};

export type InternalCost = {
  base_cost: number;
  bonus_cost: number;
  computer: number;
  end_date: string | null;
  id: number;
  licenses: number[];
  other_costs: number;
  person: number;
  start_date: string;
  type: InternalCostType;
};

export type InternalCostCalculation = {
  base_cost: number;
  total_cost: number;
};

export type Licence = {
  description: string;
  id: number;
  name: string;
};

export type LicenceCost = {
  licence: number;
  cost: number;
  end_date: string | null;
  id: number;
  start_date: string;
};

export type LicenceData = Computer & {
  costs: LicenceCost[];
};

export type People = {
  pk_persona: number;
  tipo_identificacion: TipoIdentificacion;
  identificacion: string;
  fec_expedicion_identificacion: string | null;
  fk_ciudad_expedicion_identificacion: number | null;
  nombre: string;
  telefono: string;
  correo: string;
  tipo_empleado: EmployeeType;
  fec_nacimiento: string | null;
  fk_ciudad_nacimiento: number | null;
  libreta_militar: number | null;
  fk_genero: number | null;
  fk_estado_civil: number | null;
  correo_personal: string | null;
  telefono_fijo: number | null;
  tipo_sangre: TipoSangre | null;
  fk_ciudad_residencia: number | null;
  direccion_residencia: string | null;
  fecha_inicio: string | null;
  fecha_retiro: string | null;
  expedicion_tarjeta_profesional: string | null;
};
