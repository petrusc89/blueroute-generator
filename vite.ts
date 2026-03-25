export interface VesselParams {
  loa?: string;
  lbp?: string;
  breadth?: string;
  draught?: string;
  trim?: string;
  depth?: string;
  dwt?: string;
  displacement?: string;
  densitySaltWater?: string;
  minRefSpeed?: string;
  maxRefSpeed?: string;
  mcr?: string;
  sfcMain?: string;
  sfcAux?: string;
  propellerDiameter?: string;
}

export interface Assumptions {
  seaMargin?: string;
  engineMargin?: string;
  immersedVolume?: string;
  referencePower?: string;
  referencePowerSpeed?: string;
  hotelPower?: string;
  propulsiveEfficiency?: string;
  drivetrainEfficiency?: string;
  thrustDeduction?: string;
  taylorWakeFraction?: string;
}

export interface Waypoint {
  country: string;
  city: string;
}

export interface VFConfig {
  model: string;
  quantity: number;
}

export interface SpeedResult {
  speed: number;
  reference: number;
  configs: number[]; // value per VF config
}

export interface BlueRouteResults {
  outbound: SpeedResult[];
  return: SpeedResult[];
  unit: string; // "ton/day" or "g/ton*nm"
}

export interface ReportData {
  // Document info
  state: string;
  version: string;
  revision: string;
  engineer: string;
  date: string;
  odooRef: string;
  // Customer & Ship
  customerName: string;
  shipName: string;
  vesselImageUrl: string;
  vesselImageSource: string;
  vesselImageAccessDate: string;
  // Vessel parameters
  vesselParams: VesselParams;
  // Assumptions
  assumptions: Assumptions;
  // Route
  departureCountry: string;
  departureCity: string;
  destinationCountry: string;
  destinationCity: string;
  waypoints: Waypoint[];
  // VF Configs
  vfConfigs: VFConfig[];
  // Results
  blueRouteResults: BlueRouteResults;
  minSpeed: string;
  maxSpeed: string;
}

export const VF_MODELS = ["VF2810", "VF2816", "VF3824", "VF5024", "VF5030"];

export const ABBREVIATIONS = [
  { acronym: "CFD", definition: "Computational Fluid Dynamics" },
  { acronym: "DWT", definition: "Deadweight Tonnage; The ship's carrying capacity" },
  { acronym: "EEXI", definition: "Energy Efficiency Existing Ship Index" },
  { acronym: "GM", definition: "Metacentric height; A measurement of the initial static stability of the ship" },
  { acronym: "kn", definition: "knots (nautical miles per hour)" },
  { acronym: "LBP", definition: "Length Between Perpendiculars; Length between where the bow intersects the waterline and the rudder stock" },
  { acronym: "LOA", definition: "Length Overall" },
  { acronym: "LWL", definition: "Length Waterline; the ship's length at the waterline" },
  { acronym: "IMO", definition: "International Maritime Organisation" },
  { acronym: "MARIN", definition: "Maritime Research Institute Netherlands" },
  { acronym: "MCR", definition: "Maximum Continuous Rating" },
  { acronym: "WASP", definition: "Wind Assisted Ship Propulsion" },
];

export function getDefaultReportData(): ReportData {
  return {
    state: "Draft",
    version: "V1.0",
    revision: "RevA",
    engineer: "",
    date: new Date().toLocaleDateString("en-GB"),
    odooRef: "",
    customerName: "",
    shipName: "",
    vesselImageUrl: "",
    vesselImageSource: "",
    vesselImageAccessDate: "",
    vesselParams: {
      lbp: "",
      breadth: "",
      draught: "",
      depth: "",
      dwt: "",
      minRefSpeed: "",
      maxRefSpeed: "",
      sfcMain: "",
    },
    assumptions: {
      thrustDeduction: "0.3",
      taylorWakeFraction: "0.3",
      drivetrainEfficiency: "0.99",
    },
    departureCountry: "",
    departureCity: "",
    destinationCountry: "",
    destinationCity: "",
    waypoints: [],
    vfConfigs: [{ model: "VF2816", quantity: 2 }],
    blueRouteResults: { outbound: [], return: [], unit: "ton/day" },
    minSpeed: "",
    maxSpeed: "",
  };
}

export function reportDataToDb(data: ReportData) {
  return {
    state: data.state,
    version: data.version,
    revision: data.revision,
    engineer: data.engineer,
    date: data.date,
    odooRef: data.odooRef,
    customerName: data.customerName,
    shipName: data.shipName,
    vesselImageUrl: data.vesselImageUrl,
    vesselImageSource: data.vesselImageSource,
    vesselImageAccessDate: data.vesselImageAccessDate,
    vesselParams: JSON.stringify(data.vesselParams),
    assumptions: JSON.stringify(data.assumptions),
    waypoints: JSON.stringify(data.waypoints),
    departureCountry: data.departureCountry,
    departureCity: data.departureCity,
    destinationCountry: data.destinationCountry,
    destinationCity: data.destinationCity,
    vfConfigs: JSON.stringify(data.vfConfigs),
    blueRouteResults: JSON.stringify(data.blueRouteResults),
    minSpeed: data.minSpeed,
    maxSpeed: data.maxSpeed,
  };
}

export function dbToReportData(row: any): ReportData {
  return {
    state: row.state || "Draft",
    version: row.version || "V1.0",
    revision: row.revision || "RevA",
    engineer: row.engineer || "",
    date: row.date || "",
    odooRef: row.odooRef || "",
    customerName: row.customerName || "",
    shipName: row.shipName || "",
    vesselImageUrl: row.vesselImageUrl || "",
    vesselImageSource: row.vesselImageSource || "",
    vesselImageAccessDate: row.vesselImageAccessDate || "",
    vesselParams: safeJsonParse(row.vesselParams, {}),
    assumptions: safeJsonParse(row.assumptions, { thrustDeduction: "0.3", taylorWakeFraction: "0.3" }),
    departureCountry: row.departureCountry || "",
    departureCity: row.departureCity || "",
    destinationCountry: row.destinationCountry || "",
    destinationCity: row.destinationCity || "",
    waypoints: safeJsonParse(row.waypoints, []),
    vfConfigs: safeJsonParse(row.vfConfigs, [{ model: "VF2816", quantity: 2 }]),
    blueRouteResults: ensureBlueRouteResults(safeJsonParse(row.blueRouteResults, {})),
    minSpeed: row.minSpeed || "",
    maxSpeed: row.maxSpeed || "",
  };
}

function safeJsonParse(str: string | undefined | null, fallback: any) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

function ensureBlueRouteResults(parsed: any): BlueRouteResults {
  return {
    outbound: Array.isArray(parsed?.outbound) ? parsed.outbound : [],
    return: Array.isArray(parsed?.return) ? parsed.return : [],
    unit: parsed?.unit || "ton/day",
  };
}
