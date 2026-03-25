import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportData } from "@/lib/report-types";

interface Props {
  data: ReportData;
  onChange: (partial: Partial<ReportData>) => void;
}

export default function CustomerShipSection({ data, onChange }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" data-testid="text-section-title">Customer & Ship</h2>
      <p className="text-sm text-muted-foreground mb-6">Customer and vessel identification.</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input data-testid="input-customer-name" id="customerName" value={data.customerName} onChange={(e) => onChange({ customerName: e.target.value })} placeholder="e.g. WEC Lines" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="shipName">Ship Name</Label>
          <Input data-testid="input-ship-name" id="shipName" value={data.shipName} onChange={(e) => onChange({ shipName: e.target.value })} placeholder="e.g. Frans Hals" />
        </div>
        <div className="col-span-2">
          <Label htmlFor="vesselImageUrl">Vessel Image URL</Label>
          <Input data-testid="input-vessel-image-url" id="vesselImageUrl" value={data.vesselImageUrl} onChange={(e) => onChange({ vesselImageUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="vesselImageSource">Image Source</Label>
          <Input data-testid="input-vessel-image-source" id="vesselImageSource" value={data.vesselImageSource} onChange={(e) => onChange({ vesselImageSource: e.target.value })} placeholder="e.g. WEC Lines on linkedin.com" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="vesselImageAccessDate">Access Date</Label>
          <Input data-testid="input-vessel-image-access-date" id="vesselImageAccessDate" value={data.vesselImageAccessDate} onChange={(e) => onChange({ vesselImageAccessDate: e.target.value })} placeholder="DD/MM/YYYY" />
        </div>
      </div>

      {data.vesselImageUrl && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
          <div className="border rounded-lg overflow-hidden bg-muted/30 max-w-md">
            <img
              src={data.vesselImageUrl}
              alt={data.shipName || "Vessel"}
              className="w-full h-auto object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
