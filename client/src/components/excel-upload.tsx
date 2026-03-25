import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import type { ReportData } from "@/lib/report-types";
import { getDefaultReportData } from "@/lib/report-types";
import * as XLSX from "xlsx";

interface Props {
  onParsed: (data: ReportData) => void;
}

export default function ExcelUpload({ onParsed }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });

    // Find the "Imput field" sheet (yes, the typo is intentional — it's in the source Excel)
    const sheetName = wb.SheetNames.find(
      (n) => n.toLowerCase().includes("imput") || n.toLowerCase().includes("input")
    );
    if (!sheetName) {
      alert("Could not find 'Imput field' sheet in the Excel file.");
      return;
    }

    const ws = wb.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Build a key-value map from column A (field names) and column B (values)
    const kvMap: Record<string, string> = {};
    for (const row of rows) {
      if (row[0] && row[1] !== undefined && row[1] !== null) {
        const key = String(row[0]).trim().toLowerCase();
        kvMap[key] = String(row[1]).trim();
      }
    }

    const data = getDefaultReportData();

    // Document info
    data.state = kvMap["state"] || data.state;
    data.version = kvMap["version"] || data.version;
    data.revision = kvMap["revision"] || data.revision;
    data.engineer = kvMap["engineer"] || data.engineer;
    data.date = kvMap["date"] || data.date;
    data.odooRef = kvMap["odoo no"] || kvMap["odoo no."] || kvMap["ref.no"] || data.odooRef;

    // Customer & Ship
    data.customerName = kvMap["name customer"] || kvMap["customer name"] || data.customerName;
    data.shipName = kvMap["name ship"] || kvMap["ship name"] || data.shipName;
    data.vesselImageUrl = kvMap["website name picture vessel"] || kvMap["vessel image url"] || data.vesselImageUrl;
    data.vesselImageSource = kvMap["url source picture vessel"] || data.vesselImageSource;
    data.vesselImageAccessDate = kvMap["date of accessing website"] || data.vesselImageAccessDate;

    // Vessel params
    data.vesselParams.lbp = kvMap["lbp"] || kvMap["length between perpendiculars"] || "";
    data.vesselParams.breadth = kvMap["breadth"] || "";
    data.vesselParams.draught = kvMap["draught"] || "";
    data.vesselParams.depth = kvMap["depth"] || "";
    data.vesselParams.dwt = kvMap["dwt"] || kvMap["deadweight tonnage"] || "";
    data.vesselParams.loa = kvMap["loa"] || kvMap["length overall"] || "";
    data.vesselParams.minRefSpeed = kvMap["min ref speed"] || kvMap["min reference speed"] || kvMap["min. ref speed"] || "";
    data.vesselParams.maxRefSpeed = kvMap["max ref speed"] || kvMap["max reference speed"] || kvMap["max. ref speed"] || "";
    data.vesselParams.sfcMain = kvMap["sfc"] || kvMap["specific fuel consumption"] || kvMap["sfc main engine"] || "";
    data.vesselParams.mcr = kvMap["mcr"] || kvMap["max. continuous rating"] || "";
    data.vesselParams.displacement = kvMap["displacement"] || "";
    data.vesselParams.densitySaltWater = kvMap["density salt water"] || "";
    data.vesselParams.propellerDiameter = kvMap["propeller diameter"] || "";
    data.vesselParams.sfcAux = kvMap["sfc auxiliary engine"] || kvMap["sfc aux"] || "";
    data.vesselParams.trim = kvMap["trim"] || kvMap["trim (aft)"] || "";

    // Assumptions
    data.assumptions.immersedVolume = kvMap["immersed volume"] || "";
    data.assumptions.referencePower = kvMap["power for reference speed"] || kvMap["reference power"] || "";
    data.assumptions.referencePowerSpeed = kvMap["reference speed"] || kvMap["design speed"] || "";
    data.assumptions.drivetrainEfficiency = kvMap["drivetrain efficiency"] || "0.99";
    data.assumptions.thrustDeduction = kvMap["thrust deduction"] || "0.3";
    data.assumptions.taylorWakeFraction = kvMap["taylor wake fraction"] || "0.3";
    data.assumptions.seaMargin = kvMap["sea margin"] || "";
    data.assumptions.engineMargin = kvMap["engine margin"] || "";
    data.assumptions.hotelPower = kvMap["constant hotel/aux power"] || kvMap["hotel power"] || "";
    data.assumptions.propulsiveEfficiency = kvMap["propulsive efficiency"] || "";

    // Route
    data.departureCountry = kvMap["departure country"] || "";
    data.departureCity = kvMap["departure city"] || "";
    data.destinationCountry = kvMap["destination country"] || "";
    data.destinationCity = kvMap["destination city"] || "";

    // Parse waypoints (Stop 1 country, Stop 1 city, etc.)
    const waypoints = [];
    for (let i = 1; i <= 10; i++) {
      const country = kvMap[`stop ${i} country`] || kvMap[`stop${i} country`] || "";
      const city = kvMap[`stop ${i} city`] || kvMap[`stop${i} city`] || "";
      if (country || city) waypoints.push({ country, city });
    }
    data.waypoints = waypoints;

    // VF Configs
    const vfConfigs = [];
    for (let i = 1; i <= 4; i++) {
      const model = kvMap[`vf config ${i} type`] || kvMap[`config ${i} type`] || kvMap[`vf${i} type`] || "";
      const qty = kvMap[`vf config ${i} quantity`] || kvMap[`config ${i} quantity`] || kvMap[`vf${i} quantity`] || "";
      if (model) vfConfigs.push({ model, quantity: parseInt(qty) || 2 });
    }
    if (vfConfigs.length > 0) data.vfConfigs = vfConfigs;

    // Speed range
    data.minSpeed = data.vesselParams.minRefSpeed || "";
    data.maxSpeed = data.vesselParams.maxRefSpeed || "";

    onParsed(data);

    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="ghost"
        size="sm"
        data-testid="button-upload-excel"
        onClick={() => fileRef.current?.click()}
        className="text-white hover:bg-white/10"
      >
        <FileUp className="w-4 h-4 mr-1" />
        Upload Excel
      </Button>
    </>
  );
}
