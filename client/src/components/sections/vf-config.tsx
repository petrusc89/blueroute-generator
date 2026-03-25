import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportData, VFConfig } from "@/lib/report-types";
import { VF_MODELS } from "@/lib/report-types";
import { Plus, Trash2, Wind } from "lucide-react";

interface Props {
  data: ReportData;
  onChange: (partial: Partial<ReportData>) => void;
}

export default function VFConfigSection({ data, onChange }: Props) {
  const addConfig = () => {
    if (data.vfConfigs.length >= 4) return;
    onChange({ vfConfigs: [...data.vfConfigs, { model: "VF2816", quantity: 2 }] });
  };

  const removeConfig = (idx: number) => {
    onChange({ vfConfigs: data.vfConfigs.filter((_, i) => i !== idx) });
  };

  const updateConfig = (idx: number, field: keyof VFConfig, value: string | number) => {
    const updated = [...data.vfConfigs];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ vfConfigs: updated });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" data-testid="text-section-title">VentoFoil Configuration</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Define up to 4 VentoFoil setups for comparison. Each setup specifies a model type and quantity.
      </p>

      <div className="space-y-3 mb-4">
        {data.vfConfigs.map((cfg, idx) => (
          <div key={idx} className="flex items-end gap-3 p-3 border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2 pb-2">
              <Wind className="w-4 h-4 text-[hsl(160,100%,39%)]" />
              <span className="text-sm font-medium">Setup {idx + 1}</span>
            </div>
            <div className="flex-1">
              <Label className="text-xs">Model</Label>
              <Select value={cfg.model} onValueChange={(v) => updateConfig(idx, "model", v)}>
                <SelectTrigger data-testid={`select-vf-model-${idx}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VF_MODELS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label className="text-xs">Quantity</Label>
              <Input
                data-testid={`input-vf-quantity-${idx}`}
                type="number"
                min={1}
                max={10}
                value={cfg.quantity}
                onChange={(e) => updateConfig(idx, "quantity", parseInt(e.target.value) || 1)}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              data-testid={`button-remove-vf-${idx}`}
              onClick={() => removeConfig(idx)}
              className="text-destructive hover:text-destructive pb-2"
              disabled={data.vfConfigs.length <= 1}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {data.vfConfigs.length < 4 && (
        <Button variant="outline" size="sm" data-testid="button-add-vf" onClick={addConfig}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Configuration
        </Button>
      )}

      {data.vfConfigs.length > 0 && (
        <div className="mt-6 p-3 bg-[hsl(160,100%,39%)]/10 border border-[hsl(160,100%,39%)]/20 rounded-lg">
          <p className="text-sm font-medium mb-1">Layout Summary:</p>
          {data.vfConfigs.map((cfg, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              • Layout with {cfg.quantity} {getModelHeight(cfg.model)} ({cfg.model}) VentoFoils — referred to as {cfg.quantity}* {cfg.model}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function getModelHeight(model: string): string {
  const map: Record<string, string> = {
    VF2810: "10m",
    VF2816: "16m",
    VF3824: "24m",
    VF5024: "24m",
    VF5030: "30m",
  };
  return map[model] || model;
}
