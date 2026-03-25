import type { ReportData } from "@/lib/report-types";
import { ABBREVIATIONS } from "@/lib/report-types";

interface Props {
  data: ReportData;
}

export default function PreviewPanel({ data }: Props) {
  const routeName = `${data.departureCountry || "—"} – ${data.destinationCountry || "—"}`;

  return (
    <div className="space-y-6" data-testid="preview-panel">
      {/* Cover Page Preview */}
      <div className="bg-white text-gray-900 rounded-lg shadow border p-6 min-h-[280px] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="font-bold text-sm">Econowind B.V.</p>
              <p className="text-xs text-gray-500">Gildenveld 6, 3892 DG</p>
              <p className="text-xs text-gray-500">Zeewolde, the Netherlands</p>
            </div>
            <p className="text-lg font-bold tracking-tight text-gray-700">ECONOWIND</p>
          </div>
          <h2 className="text-xl font-light tracking-widest text-center mt-8 mb-2">
            BLUE ROUTE REPORT
          </h2>
          <p className="text-center text-[hsl(200,80%,45%)] italic">
            {data.shipName || "Ship Name"} - {data.customerName || "Customer"}
          </p>
        </div>
        <div className="text-xs mt-6 space-y-1">
          <div className="flex gap-6">
            <span className="w-16 font-medium">Version</span>
            <span>{data.version} - {data.revision}</span>
          </div>
          <div className="flex gap-6">
            <span className="w-16 font-medium">Date</span>
            <span>{data.date || "—"}</span>
          </div>
          <div className="flex gap-6">
            <span className="w-16 font-medium">Engineer</span>
            <span>{data.engineer || "—"}</span>
          </div>
          <div className="flex gap-6">
            <span className="w-16 font-medium">Ref.no</span>
            <span>{data.odooRef ? `[${data.odooRef}]` : "—"}</span>
          </div>
        </div>
      </div>

      {/* Vessel Parameters Preview */}
      {(data.vesselParams.lbp || data.vesselParams.breadth) && (
        <div className="bg-white text-gray-900 rounded-lg shadow border p-4">
          <div className="bg-[hsl(200,80%,45%)] text-white px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase mb-3">
            Vessel Parameters: {data.shipName || "—"}
          </div>
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(data.vesselParams).map(([key, val]) => {
                if (!val) return null;
                return (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-1 pr-4">{formatParamLabel(key)}</td>
                    <td className="py-1 text-right font-medium">{val}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Route Preview */}
      {(data.departureCountry || (data.waypoints?.length ?? 0) > 0) && (
        <div className="bg-white text-gray-900 rounded-lg shadow border p-4">
          <div className="bg-[hsl(200,80%,45%)] text-white px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase mb-3">
            Route: {routeName}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 font-semibold">Country</th>
                <th className="text-left py-1 font-semibold">City</th>
              </tr>
            </thead>
            <tbody>
              {data.departureCountry && (
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium">{data.departureCountry}</td>
                  <td className="py-1">{data.departureCity}</td>
                </tr>
              )}
              {(data.waypoints ?? []).map((wp, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1 font-medium">{wp.country}</td>
                  <td className="py-1">{wp.city}</td>
                </tr>
              ))}
              {data.destinationCountry && (
                <tr className="border-b border-gray-100">
                  <td className="py-1 font-medium">{data.destinationCountry}</td>
                  <td className="py-1">{data.destinationCity}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Preview */}
      {(data.blueRouteResults?.outbound?.length ?? 0) > 0 && (
        <div className="bg-white text-gray-900 rounded-lg shadow border p-4">
          <div className="bg-[hsl(200,80%,45%)] text-white px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase mb-3">
            Emission Reductions (Outbound)
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 font-semibold">System</th>
                <th className="text-left py-1 font-semibold">Speed</th>
                <th className="text-left py-1 font-semibold">Savings</th>
              </tr>
            </thead>
            <tbody>
              {(data.blueRouteResults?.outbound ?? []).map((row, i) => (
                (data.vfConfigs ?? []).map((cfg, cIdx) => {
                  const savings = row.reference > 0
                    ? ((row.reference - (row.configs[cIdx] || 0)) / row.reference * 100).toFixed(1)
                    : "—";
                  return (
                    <tr key={`${i}-${cIdx}`} className="border-b border-gray-100">
                      <td className="py-1">{i === 0 && cIdx === 0 ? `${cfg.quantity}* ${cfg.model}` : (cIdx === 0 ? "—" : "")}</td>
                      <td className="py-1">{cIdx === 0 ? `${row.speed} kts` : ""}</td>
                      <td className="py-1 font-medium">{savings}%</td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatParamLabel(key: string): string {
  const map: Record<string, string> = {
    loa: "Length Overall (LOA)",
    lbp: "Length Between Perpendiculars (LBP)",
    breadth: "Breadth",
    draught: "Draught",
    trim: "Trim (aft)",
    depth: "Depth",
    dwt: "Deadweight tonnage (DWT)",
    displacement: "Displacement (Δ)",
    densitySaltWater: "Density salt water (ρ)",
    minRefSpeed: "Min. Reference speed",
    maxRefSpeed: "Max. Reference speed",
    mcr: "Max. Continuous Rating (MCR)",
    sfcMain: "SFC main engine",
    sfcAux: "SFC auxiliary engine",
    propellerDiameter: "Propeller diameter",
  };
  return map[key] || key;
}
