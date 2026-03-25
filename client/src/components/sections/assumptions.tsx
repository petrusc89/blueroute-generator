import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportData, Assumptions } from "@/lib/report-types";

interface Props {
  data: ReportData;
  onChange: (partial: Partial<ReportData>) => void;
}

const ASSUMPTION_FIELDS: { key: keyof Assumptions; label: string; unit: string; placeholder: string }[] = [
  { key: "seaMargin", label: "Sea margin", unit: "[%]", placeholder: "15" },
  { key: "engineMargin", label: "Engine margin", unit: "[%]", placeholder: "15" },
  { key: "immersedVolume", label: "Immersed volume (∇)", unit: "[m³]", placeholder: "14223" },
  { key: "referencePower", label: "Reference power", unit: "[kW]", placeholder: "5012" },
  { key: "referencePowerSpeed", label: "Ref. power speed", unit: "[kn]", placeholder: "13.3" },
  { key: "hotelPower", label: "Constant hotel/aux power", unit: "[kW]", placeholder: "300" },
  { key: "propulsiveEfficiency", label: "Propulsive efficiency", unit: "[-]", placeholder: "0.62" },
  { key: "drivetrainEfficiency", label: "Drivetrain efficiency", unit: "[-]", placeholder: "0.99" },
  { key: "thrustDeduction", label: "Thrust deduction", unit: "[-]", placeholder: "0.3" },
  { key: "taylorWakeFraction", label: "Taylor wake fraction", unit: "[-]", placeholder: "0.3" },
];

export default function AssumptionsSection({ data, onChange }: Props) {
  const updateAssumption = (key: keyof Assumptions, value: string) => {
    onChange({ assumptions: { ...data.assumptions, [key]: value } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" data-testid="text-section-title">EconoWind Assumptions</h2>
      <p className="text-sm text-muted-foreground mb-6">Modelling parameters and assumptions used in the Blue Route calculation.</p>

      <div className="space-y-3">
        {ASSUMPTION_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center gap-3">
            <Label className="w-64 shrink-0 text-sm">{field.label}</Label>
            <Input
              data-testid={`input-assumption-${field.key}`}
              className="w-32"
              value={data.assumptions[field.key] || ""}
              onChange={(e) => updateAssumption(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
            <span className="text-xs text-muted-foreground w-16">{field.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
