import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ReportData, Waypoint } from "@/lib/report-types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ReportData;
  onChange: (partial: Partial<ReportData>) => void;
}

export default function RouteSection({ data, onChange }: Props) {
  const addWaypoint = () => {
    onChange({ waypoints: [...data.waypoints, { country: "", city: "" }] });
  };

  const removeWaypoint = (idx: number) => {
    onChange({ waypoints: data.waypoints.filter((_, i) => i !== idx) });
  };

  const updateWaypoint = (idx: number, field: keyof Waypoint, value: string) => {
    const updated = [...data.waypoints];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ waypoints: updated });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" data-testid="text-section-title">Route Definition</h2>
      <p className="text-sm text-muted-foreground mb-6">Define the departure, waypoints, and destination.</p>

      {/* Departure */}
      <div className="mb-4 p-3 bg-muted/40 rounded-lg border">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Departure</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Country</Label>
            <Input data-testid="input-departure-country" value={data.departureCountry} onChange={(e) => onChange({ departureCountry: e.target.value })} placeholder="Germany" />
          </div>
          <div className="flex-1">
            <Label>City</Label>
            <Input data-testid="input-departure-city" value={data.departureCity} onChange={(e) => onChange({ departureCity: e.target.value })} placeholder="Hamburg" />
          </div>
        </div>
      </div>

      {/* Waypoints */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Waypoints</p>
          <Button variant="outline" size="sm" data-testid="button-add-waypoint" onClick={addWaypoint}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
        {data.waypoints.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            No waypoints added. Click "Add" to define intermediate stops.
          </p>
        ) : (
          <div className="space-y-2">
            {data.waypoints.map((wp, idx) => (
              <div key={idx} className="flex items-end gap-2 p-2 bg-muted/20 rounded border">
                <span className="text-xs text-muted-foreground w-6 text-center pb-2">{idx + 1}</span>
                <div className="flex-1">
                  <Label className="text-xs">Country</Label>
                  <Input
                    data-testid={`input-waypoint-country-${idx}`}
                    value={wp.country}
                    onChange={(e) => updateWaypoint(idx, "country", e.target.value)}
                    placeholder="Country"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">City</Label>
                  <Input
                    data-testid={`input-waypoint-city-${idx}`}
                    value={wp.city}
                    onChange={(e) => updateWaypoint(idx, "city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <Button variant="ghost" size="sm" data-testid={`button-remove-waypoint-${idx}`} onClick={() => removeWaypoint(idx)} className="text-destructive hover:text-destructive pb-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Destination */}
      <div className="p-3 bg-muted/40 rounded-lg border">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Destination</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Country</Label>
            <Input data-testid="input-destination-country" value={data.destinationCountry} onChange={(e) => onChange({ destinationCountry: e.target.value })} placeholder="Spain" />
          </div>
          <div className="flex-1">
            <Label>City</Label>
            <Input data-testid="input-destination-city" value={data.destinationCity} onChange={(e) => onChange({ destinationCity: e.target.value })} placeholder="Bilbao" />
          </div>
        </div>
      </div>
    </div>
  );
}
