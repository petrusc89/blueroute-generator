import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportData, VesselParams } from "@/lib/report-types";

interface Props {
  data: ReportData;
  onChange: (partial: Partial<ReportData>) => void;
}

const PARAMS: { key: keyof VesselParams; label: string; unit: string; placeholder: string }[] = [
  { key: "loa", label: "Length Overall (LOA)", unit: "[m]", placeholder: "134.4" },
  { key: "lbp", label: "Length Between Perpendiculars (LBP)", unit: "[m]", placeholder: "124.4" },
  { key: "breadth", label: "Breadth", unit: "[m]", placeholder: "22.5" },
  { key: "draught", label: "Draught", unit: "[m]", placeholder: "8.2" },
  { key: "trim", label: "Trim (aft)", unit: "[m]", placeholder: "0.4" },
  { key: "depth", label: "Depth", unit: "[m]", placeholder: "11.3" },
  { key: "dwt", label: "Deadweight tonnage (DWT)", unit: "[t]", placeholder: "11106" },
  { key: "displacement", label: "Displacement (Δ)", unit: "[t]", placeholder: "14579" },
  { key: "densitySaltWater", label: "Density salt water (ρ)", unit: "[t/m³]", placeholder: "1.025" },
  { key: "minRefSpeed", label: "Min. Reference speed", unit: "[kn]", placeholder: "10" },
  { key: "maxRefSpeed", label: "Max. Reference speed", unit: "[kn]", placeholder: "14" },
  { key: "mcr", label: "Max. Continuous Rating (MCR)", unit: "[kW]", placeholder: "8400" },
  { key: "sfcMain", label: "SFC main engine", unit: "[g/kWh]", placeholder: "181.9" },
  { key: "sfcAux", label: "SFC auxiliary engine", unit: "[g/kWh]", placeholder: "210.0" },
  { key: "propellerDiameter", label: "Propeller diameter", unit: "[m]", placeholder: "5.2" },
];

export default function VesselParamsSection({ data, onChange }: Props) {
  const updateParam = (key: keyof VesselParams, value: string) => {
    onChange({ vesselParams: { ...data.vesselParams, [key]: value } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" data-testid="text-section-title">Vessel Parameters</h2>
      <p className="text-sm text-muted-foreground mb-6">Physical specifications of the vessel.</p>

      <div className="space-y-3">
        {PARAMS.map((param) => (
          <div key={param.key} className="flex items-center gap-3">
            <Label className="w-64 shrink-0 text-sm">{param.label}</Label>
            <Input
              data-testid={`input-vessel-${param.key}`}
              className="w-32"
              value={data.vesselParams[param.key] || ""}
              onChange={(e) => updateParam(param.key, e.target.value)}
              placeholder={param.placeholder}
            />
            <span className="text-xs text-muted-foreground w-16">{param.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
