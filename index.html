import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportData, SpeedResult } from "@/lib/report-types";

interface Props {
  data: ReportData;
  onChange: (partial: Partial<ReportData>) => void;
}

export default function ResultsSection({ data, onChange }: Props) {
  const results = data.blueRouteResults;
  const numConfigs = data.vfConfigs.length;

  const generateSpeedRows = () => {
    const min = parseInt(data.minSpeed) || parseInt(data.vesselParams.minRefSpeed || "") || 10;
    const max = parseInt(data.maxSpeed) || parseInt(data.vesselParams.maxRefSpeed || "") || 14;
    const speeds: number[] = [];
    for (let s = max; s >= min; s--) speeds.push(s);

    const makeRows = (existing: SpeedResult[]): SpeedResult[] =>
      speeds.map((speed) => {
        const found = existing.find((r) => r.speed === speed);
        return found || { speed, reference: 0, configs: Array(numConfigs).fill(0) };
      });

    onChange({
      blueRouteResults: {
        ...results,
        outbound: makeRows(results.outbound),
        return: makeRows(results.return),
      },
      minSpeed: String(min),
      maxSpeed: String(max),
    });
  };

  const updateRow = (
    route: "outbound" | "return",
    idx: number,
    field: "reference" | "config",
    value: number,
    configIdx?: number
  ) => {
    const rows = [...results[route]];
    if (field === "reference") {
      rows[idx] = { ...rows[idx], reference: value };
    } else if (field === "config" && configIdx !== undefined) {
      const configs = [...rows[idx].configs];
      configs[configIdx] = value;
      rows[idx] = { ...rows[idx], configs };
    }
    onChange({ blueRouteResults: { ...results, [route]: rows } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" data-testid="text-section-title">Blue Route Results</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Enter the fuel consumption values from Blue Route for each speed and VF configuration.
      </p>

      <div className="flex items-end gap-3 mb-4">
        <div>
          <Label>Min Speed (kn)</Label>
          <Input
            data-testid="input-min-speed"
            className="w-24"
            type="number"
            value={data.minSpeed || data.vesselParams.minRefSpeed || ""}
            onChange={(e) => onChange({ minSpeed: e.target.value })}
          />
        </div>
        <div>
          <Label>Max Speed (kn)</Label>
          <Input
            data-testid="input-max-speed"
            className="w-24"
            type="number"
            value={data.maxSpeed || data.vesselParams.maxRefSpeed || ""}
            onChange={(e) => onChange({ maxSpeed: e.target.value })}
          />
        </div>
        <div>
          <Label>Unit</Label>
          <Select
            value={results.unit || "ton/day"}
            onValueChange={(v) =>
              onChange({ blueRouteResults: { ...results, unit: v } })
            }
          >
            <SelectTrigger data-testid="select-unit" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ton/day">ton/day</SelectItem>
              <SelectItem value="g/ton*nm">g/ton*nm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-testid="button-generate-rows"
          onClick={generateSpeedRows}
        >
          Generate Rows
        </Button>
      </div>

      {/* Outbound */}
      {results.outbound.length > 0 && (
        <ResultsTable
          title="Outbound Route"
          rows={results.outbound}
          configs={data.vfConfigs}
          unit={results.unit}
          onUpdate={(idx, field, value, configIdx) =>
            updateRow("outbound", idx, field, value, configIdx)
          }
        />
      )}

      {/* Return */}
      {results.return.length > 0 && (
        <div className="mt-6">
          <ResultsTable
            title="Return Route"
            rows={results.return}
            configs={data.vfConfigs}
            unit={results.unit}
            onUpdate={(idx, field, value, configIdx) =>
              updateRow("return", idx, field, value, configIdx)
            }
          />
        </div>
      )}

      {results.outbound.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-lg">
          Set min/max speeds and click "Generate Rows" to create the results table.
        </p>
      )}
    </div>
  );
}

function ResultsTable({
  title,
  rows,
  configs,
  unit,
  onUpdate,
}: {
  title: string;
  rows: SpeedResult[];
  configs: { model: string; quantity: number }[];
  unit: string;
  onUpdate: (
    idx: number,
    field: "reference" | "config",
    value: number,
    configIdx?: number
  ) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Speed (kn)</th>
              <th className="px-3 py-2 text-left font-medium">Reference ({unit})</th>
              {configs.map((cfg, i) => (
                <th key={i} className="px-3 py-2 text-left font-medium">
                  {cfg.quantity}* {cfg.model} ({unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-1.5 font-medium">{row.speed}</td>
                <td className="px-3 py-1.5">
                  <Input
                    data-testid={`input-${title.toLowerCase().replace(/ /g, "-")}-ref-${row.speed}`}
                    className="w-24 h-8"
                    type="number"
                    step="0.01"
                    value={row.reference || ""}
                    onChange={(e) => onUpdate(idx, "reference", parseFloat(e.target.value) || 0)}
                  />
                </td>
                {configs.map((_, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5">
                    <Input
                      data-testid={`input-${title.toLowerCase().replace(/ /g, "-")}-cfg${cIdx}-${row.speed}`}
                      className="w-24 h-8"
                      type="number"
                      step="0.01"
                      value={row.configs[cIdx] || ""}
                      onChange={(e) =>
                        onUpdate(idx, "config", parseFloat(e.target.value) || 0, cIdx)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
