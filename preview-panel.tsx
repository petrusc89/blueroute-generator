import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportData } from "@/lib/report-types";

interface Props {
  data: ReportData;
  onChange: (partial: Partial<ReportData>) => void;
}

export default function DocumentInfoSection({ data, onChange }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" data-testid="text-section-title">Document Info</h2>
      <p className="text-sm text-muted-foreground mb-6">Report metadata and version information.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="state">State</Label>
          <Select value={data.state} onValueChange={(v) => onChange({ state: v })}>
            <SelectTrigger data-testid="select-state"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="version">Version</Label>
          <Input data-testid="input-version" id="version" value={data.version} onChange={(e) => onChange({ version: e.target.value })} placeholder="V1.0" />
        </div>
        <div>
          <Label htmlFor="revision">Revision</Label>
          <Input data-testid="input-revision" id="revision" value={data.revision} onChange={(e) => onChange({ revision: e.target.value })} placeholder="RevA" />
        </div>
        <div>
          <Label htmlFor="engineer">Engineer</Label>
          <Input data-testid="input-engineer" id="engineer" value={data.engineer} onChange={(e) => onChange({ engineer: e.target.value })} placeholder="Name" />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input data-testid="input-date" id="date" value={data.date} onChange={(e) => onChange({ date: e.target.value })} placeholder="DD/MM/YYYY" />
        </div>
        <div>
          <Label htmlFor="odooRef">Odoo Ref. No.</Label>
          <Input data-testid="input-odoo-ref" id="odooRef" value={data.odooRef} onChange={(e) => onChange({ odooRef: e.target.value })} placeholder="[123]" />
        </div>
      </div>
    </div>
  );
}
