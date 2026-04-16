import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportData } from "./report-types";
import { ABBREVIATIONS } from "./report-types";
import { ECONOWIND_LOGO_PNG, ECONOWIND_LOGO_DIMS } from "@/assets/embedded-assets";

// ===== Brand palette (from DOCX template) =====
// PRIMARY_TEAL  #00536E — headings, emphasis text
// ACCENT_TEAL   #007CA6 — section header fills, accent rules
// ACCENT_CYAN   #00A8DE — lighter highlights, chart accent
// FOOTER_CHARCOAL #2B2B2B — footer band
// DARK_GRAY     #505050 — secondary body text
const PRIMARY_TEAL = [0, 83, 110] as const;
const ACCENT_TEAL = [0, 124, 166] as const;
const ACCENT_CYAN = [0, 168, 222] as const;
const FOOTER_CHARCOAL = [43, 43, 43] as const;
const DARK_GRAY = [80, 80, 80] as const;

// Legacy aliases so downstream code keeps reading — kept deliberately so this
// first brand-alignment pass stays low-diff. Bundle 6 will remove these.
const NAVY = PRIMARY_TEAL;
const LIGHT_BLUE = ACCENT_TEAL;

const CHART_REF = [120, 120, 120] as const;
const CHART_COLORS = [
  [0, 124, 166],   // ACCENT_TEAL
  [0, 168, 222],   // ACCENT_CYAN
  [255, 165, 0],   // amber
  [140, 70, 200],  // violet
];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 25;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const FOOTER_Y = PAGE_H - 15;
const FOOTER_BAND_H = 10;     // solid charcoal band height
const HEADER_LOGO_W = 30;     // mm — interior page header logo width
const COVER_LOGO_W = 55;      // mm — cover page logo width

function getVFLabel(cfg: { model: string; quantity: number }) {
  return `${cfg.quantity}* ${cfg.model}`;
}

function getRouteName(data: ReportData) {
  return `${data.departureCountry || "—"} – ${data.destinationCountry || "—"}`;
}

export async function generatePdf(inputData: ReportData) {
  // Normalize data to prevent undefined access errors
  const data: ReportData = {
    ...inputData,
    waypoints: inputData.waypoints ?? [],
    vfConfigs: inputData.vfConfigs?.length ? inputData.vfConfigs : [{ model: "VF2816", quantity: 2 }],
    blueRouteResults: {
      outbound: inputData.blueRouteResults?.outbound ?? [],
      return: inputData.blueRouteResults?.return ?? [],
      unit: inputData.blueRouteResults?.unit || "ton/day",
    },
  };
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 0;

  const addFooter = () => {
    // Solid charcoal band spanning full page width (matches reference PDFs)
    const bandY = PAGE_H - FOOTER_BAND_H;
    doc.setFillColor(FOOTER_CHARCOAL[0], FOOTER_CHARCOAL[1], FOOTER_CHARCOAL[2]);
    doc.rect(0, bandY, PAGE_W, FOOTER_BAND_H, "F");
    // Thin cyan accent rule along the top of the band
    doc.setFillColor(ACCENT_CYAN[0], ACCENT_CYAN[1], ACCENT_CYAN[2]);
    doc.rect(0, bandY, PAGE_W, 0.8, "F");
    // Contact line, centered, in light text
    doc.setFontSize(8);
    doc.setTextColor(235, 235, 235);
    doc.text(
      "Econowind B.V.   |   Gildenveld 6, 3892 DG Zeewolde, the Netherlands   |   www.econowind.nl   |   +31 (0)6 18 87 00 62",
      PAGE_W / 2,
      bandY + FOOTER_BAND_H / 2 + 1.2,
      { align: "center" },
    );
    doc.setTextColor(0, 0, 0);
  };

  const addHeader = () => {
    if (pageNum <= 1) return;
    // Logo, top-left
    const logoRatio = ECONOWIND_LOGO_DIMS.height / ECONOWIND_LOGO_DIMS.width;
    const logoH = HEADER_LOGO_W * logoRatio;
    doc.addImage(ECONOWIND_LOGO_PNG, "PNG", MARGIN, 8, HEADER_LOGO_W, logoH);
    // Metadata line
    doc.setFontSize(8);
    doc.setTextColor(ACCENT_TEAL[0], ACCENT_TEAL[1], ACCENT_TEAL[2]);
    doc.text(`${data.version} - ${data.revision}`, PAGE_W / 2, 12, { align: "center" });
    doc.text(
      `${data.shipName || ""} — ${data.customerName || ""}`.replace(/^ — $/, ""),
      PAGE_W - MARGIN,
      12,
      { align: "right" },
    );
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${pageNum} / {TOTAL}`, PAGE_W - MARGIN, 16, { align: "right" });
    // Thin accent rule under the header
    doc.setDrawColor(ACCENT_CYAN[0], ACCENT_CYAN[1], ACCENT_CYAN[2]);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, 18, PAGE_W - MARGIN, 18);
    doc.setLineWidth(0.2);
    doc.setTextColor(0, 0, 0);
  };

  const newPage = () => {
    if (pageNum > 0) doc.addPage();
    pageNum++;
    addHeader();
    addFooter();
    return 22; // start Y after header
  };

  const sectionHeader = (y: number, text: string): number => {
    // Section header: dark-teal fill with a thin accent cyan left-edge marker
    doc.setFillColor(PRIMARY_TEAL[0], PRIMARY_TEAL[1], PRIMARY_TEAL[2]);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFillColor(ACCENT_CYAN[0], ACCENT_CYAN[1], ACCENT_CYAN[2]);
    doc.rect(MARGIN, y, 1.5, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(text.toUpperCase(), MARGIN + 4, y + 5);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    return y + 10;
  };

  const subHeader = (y: number, text: string): number => {
    // Pale teal tint
    doc.setFillColor(226, 240, 245);
    doc.rect(MARGIN, y, CONTENT_W, 6, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_TEAL[0], PRIMARY_TEAL[1], PRIMARY_TEAL[2]);
    doc.text(text, MARGIN + 3, y + 4.2);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    return y + 9;
  };

  const appendixHeader = (y: number, label: string, title: string): number => {
    // Colored label chip + title block, matching the new section header palette
    const chipW = 32;
    doc.setFillColor(PRIMARY_TEAL[0], PRIMARY_TEAL[1], PRIMARY_TEAL[2]);
    doc.rect(MARGIN, y, chipW, 7, "F");
    doc.setFillColor(ACCENT_CYAN[0], ACCENT_CYAN[1], ACCENT_CYAN[2]);
    doc.rect(MARGIN, y, 1.5, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(label.toUpperCase(), MARGIN + 4, y + 5);
    doc.setTextColor(PRIMARY_TEAL[0], PRIMARY_TEAL[1], PRIMARY_TEAL[2]);
    doc.text(title.toUpperCase(), MARGIN + chipW + 4, y + 5);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    return y + 12;
  };

  // ==================== COVER PAGE ====================
  newPage();

  // Company info (top-left)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_TEAL[0], PRIMARY_TEAL[1], PRIMARY_TEAL[2]);
  doc.text("Econowind B.V.", MARGIN, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
  doc.text("Gildenveld 6, 3892 DG", MARGIN, 25);
  doc.text("Zeewolde, the Netherlands", MARGIN, 30);
  doc.setTextColor(0, 0, 0);

  // Real logo (top-right) — replaces the old text "ECONOWIND"
  {
    const ratio = ECONOWIND_LOGO_DIMS.height / ECONOWIND_LOGO_DIMS.width;
    const h = COVER_LOGO_W * ratio;
    doc.addImage(ECONOWIND_LOGO_PNG, "PNG", PAGE_W - MARGIN - COVER_LOGO_W, 15, COVER_LOGO_W, h);
  }

  // Title
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_TEAL[0], PRIMARY_TEAL[1], PRIMARY_TEAL[2]);
  const titleY = 105;
  doc.text("BLUE ROUTE REPORT", PAGE_W / 2, titleY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Accent rule under title
  doc.setDrawColor(ACCENT_CYAN[0], ACCENT_CYAN[1], ACCENT_CYAN[2]);
  doc.setLineWidth(0.8);
  doc.line(PAGE_W / 2 - 35, titleY + 4, PAGE_W / 2 + 35, titleY + 4);
  doc.setLineWidth(0.2);

  // Ship name - Customer
  doc.setFontSize(15);
  doc.setTextColor(ACCENT_TEAL[0], ACCENT_TEAL[1], ACCENT_TEAL[2]);
  doc.setFont("helvetica", "italic");
  const subtitle = `${data.shipName || "Ship Name"} — ${data.customerName || "Customer"}`;
  doc.text(subtitle, PAGE_W / 2, titleY + 15, { align: "center" });
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // Version table at bottom
  const vTableY = 230;
  doc.setFontSize(9);
  const vData = [
    ["Version", `${data.version} - ${data.revision}`],
    ["Date", data.date || "—"],
    ["Engineer", data.engineer || "—"],
    ["Ref.no", data.odooRef ? `[${data.odooRef}]` : "—"],
  ];
  vData.forEach((row, i) => {
    doc.setFont("helvetica", "normal");
    doc.text(row[0], MARGIN, vTableY + i * 6);
    doc.text(row[1], MARGIN + 25, vTableY + i * 6);
  });

  // ==================== CONTENTS ====================
  let y = newPage();
  y = sectionHeader(y, "Contents");
  y += 2;

  const tocItems = [
    { text: "Lists of Tables, Figures and Abbreviations", page: 3, indent: 0 },
    { text: "Introduction", page: 4, indent: 0 },
    { text: "Research objective and questions", page: 4, indent: 1 },
    { text: "Scope and Purpose", page: 4, indent: 1 },
    { text: `Vessel parameters: ${data.shipName || "—"}`, page: 5, indent: 0 },
    { text: "Modelling performed", page: 6, indent: 0 },
    { text: "Case Study: Blue Route", page: 6, indent: 0 },
    { text: "VentoFoil Layout", page: 6, indent: 0 },
    { text: "Route and predicted savings", page: 7, indent: 0 },
    { text: `Route ${getRouteName(data)}`, page: 8, indent: 1 },
    { text: "Weather routing", page: 0, indent: 0 },
    { text: "Conclusion", page: 0, indent: 0 },
    { text: "Bibliography", page: 0, indent: 0 },
    { text: "List of appendices", page: 0, indent: 0 },
    { text: "Appendix I    EEXI WASP FORMULA", page: 0, indent: 1 },
    { text: "Appendix II   MEPC.1/CIRC.896", page: 0, indent: 1 },
    { text: "Appendix III  ECONOWIND ASSUMPTIONS", page: 0, indent: 1 },
    { text: "Appendix IV   BLUE ROUTE DATA SOURCES AND ASSUMPTIONS", page: 0, indent: 1 },
  ];

  doc.setFontSize(9);
  tocItems.forEach((item) => {
    const x = MARGIN + (item.indent ? 5 : 0);
    doc.text(item.text, x, y);
    y += 5.5;
  });

  // ==================== ABBREVIATIONS ====================
  y = newPage();
  y = sectionHeader(y, "Lists of Tables, Figures and Abbreviations");
  y += 2;
  y = subHeader(y, "List of abbreviations");

  autoTable(doc, {
    startY: y,
    head: [["Acronym", "Definition"]],
    body: ABBREVIATIONS.map((a) => [a.acronym, a.definition]),
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  // ==================== INTRODUCTION ====================
  y = newPage();
  y = sectionHeader(y, "Introduction");
  y += 2;
  doc.setFontSize(9);
  const introText = `This report, conducted by Econowind, researches the effectiveness of VentoFoil systems on the ship called ${data.shipName || "[Ship Name]"} on routes provided that correspond with its typical operational profile. This research has been conducted for ${data.customerName || "[Customer]"}.`;
  const introLines = doc.splitTextToSize(introText, CONTENT_W);
  doc.text(introLines, MARGIN, y);
  y += introLines.length * 4.5 + 4;

  y = subHeader(y, "Research objective and questions");
  const objText = `The objective of this research is to establish typical savings that may be expected by the introduction of VentoFoils on the ship ${data.shipName || "[Ship Name]"}.`;
  const objLines = doc.splitTextToSize(objText, CONTENT_W);
  doc.text(objLines, MARGIN, y);
  y += objLines.length * 4.5 + 4;

  y = subHeader(y, "Scope and Purpose");
  const scopeText = "This scope of this report is to visualise an approximation of savings that may be expected, as accurate as possible, with the use of simulation software. The calculated values are provided for reference only, since conducting a fully detailed CFD analysis is neither deemed essential nor feasible given the current limitations and resources.";
  const scopeLines = doc.splitTextToSize(scopeText, CONTENT_W);
  doc.text(scopeLines, MARGIN, y);

  // ==================== VESSEL PARAMETERS ====================
  y = newPage();
  y = sectionHeader(y, `Vessel parameters: ${data.shipName || "—"}`);
  y += 2;

  // Table 1: Parameters
  doc.setFontSize(8);
  doc.setTextColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
  doc.text(`Table 1: Parameters ${data.shipName || "—"}`, MARGIN, y);
  doc.setTextColor(0, 0, 0);
  y += 3;

  const paramRows = [
    ["Length Overall (LOA)", data.vesselParams.loa || "—", "[m]"],
    ["Length Between Perpendiculars (LBP)", data.vesselParams.lbp || "—", "[m]"],
    ["Breadth", data.vesselParams.breadth || "—", "[m]"],
    ["Draught", data.vesselParams.draught || "—", "[m]"],
    ["Trim (aft)", data.vesselParams.trim || "—", "[m]"],
    ["Depth", data.vesselParams.depth || "—", "[m]"],
    ["Deadweight tonnage (DWT)", data.vesselParams.dwt || "—", "[t]"],
    ["Displacement (Δ)", data.vesselParams.displacement || "—", "[t]"],
    ["Density salt water (ρ)", data.vesselParams.densitySaltWater || "—", "[t/m³]"],
    ["Min. Reference speed", data.vesselParams.minRefSpeed || "—", "[kn]"],
    ["Max. Reference speed", data.vesselParams.maxRefSpeed || "—", "[kn]"],
    ["Max. Continuous Rating (MCR)", data.vesselParams.mcr || "—", "[kW]"],
    ["SFC main engine", data.vesselParams.sfcMain || "—", "[g/kWh]"],
    ["SFC auxiliary engine", data.vesselParams.sfcAux || "—", "[g/kWh]"],
    ["Propeller diameter", data.vesselParams.propellerDiameter || "—", "[m]"],
  ];

  autoTable(doc, {
    startY: y,
    body: paramRows.map((r) => [r[0], `${r[1]}  ${r[2]}`]),
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: "right" } },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Table 2: Assumptions
  doc.setFontSize(8);
  doc.setTextColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
  doc.text("Table 2: Econowind assumption", MARGIN, y);
  doc.setTextColor(0, 0, 0);
  y += 3;

  const assumpRows = [
    ["Sea margin", data.assumptions.seaMargin || "—", "[%]"],
    ["Engine margin", data.assumptions.engineMargin || "—", "[%]"],
    ["Immersed volume (∇)", data.assumptions.immersedVolume || "—", "[m³]"],
    [`Reference power @ ${data.assumptions.referencePowerSpeed || "—"} kn`, data.assumptions.referencePower || "—", "[kW]"],
    ["Constant hotel/aux power", data.assumptions.hotelPower || "—", "[kW]"],
    ["Propulsive efficiency", data.assumptions.propulsiveEfficiency || "—", "[-]"],
    ["Drivetrain efficiency", data.assumptions.drivetrainEfficiency || "—", "[-]"],
    ["Thrust deduction", data.assumptions.thrustDeduction || "—", "[-]"],
    ["Taylor wake fraction", data.assumptions.taylorWakeFraction || "—", "[-]"],
  ];

  autoTable(doc, {
    startY: y,
    body: assumpRows.map((r) => [r[0], `${r[1]}  ${r[2]}`]),
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: "right" } },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  // ==================== MODELLING + VF LAYOUT ====================
  y = newPage();
  y = sectionHeader(y, "Modelling performed");
  y += 2;
  doc.setFontSize(9);
  const modelText = "Econowind partners with the Maritime Research Institute Netherlands (MARIN) and performs model testing.\n\nThe predictions in Blue Route are based on ITTC (International Towing Tank Conference) Level 1 (1DOF) as a baseline. The force from any wind propulsor is resolved in the propulsive direction. The thrust from the conventional propulsion is proportionally reduced to keep the same ship speed. Separately, the power required to run the VentoFoil is added.";
  const modelLines = doc.splitTextToSize(modelText, CONTENT_W);
  doc.text(modelLines, MARGIN, y);
  y += modelLines.length * 4.5 + 6;

  y = sectionHeader(y, "Case Study: Blue Route");
  y += 2;
  const caseText = "This prediction of emission reduction by the VentoFoil is based on data of the independent Maritime Research Institute Netherlands (MARIN). All ship data that serves as input for the Blue Route program is retrieved from the General Arrangement of the ship.\n\nThe predictions by Blue Route provide an estimation of achievable reduction in:\n- CO₂ emissions reduction\n- Fuel consumption reduction\n- Reduction in required engine power.\n\nReal emission reduction will be higher, as:\n1. Blue Route assumes ships are fully loaded.\n2. Blue Route assumes the VentoFoils cannot be lowered in bad weather.";
  const caseLines = doc.splitTextToSize(caseText, CONTENT_W);
  doc.text(caseLines, MARGIN, y);
  y += caseLines.length * 4.5 + 6;

  y = sectionHeader(y, "VentoFoil Layout");
  y += 2;
  const numLayouts = data.vfConfigs.length;
  const routeCount = 1;
  const layoutIntro = `This study assesses the effectiveness of ${numLayouts} VentoFoil layout${numLayouts > 1 ? "s" : ""}, implemented on ${routeCount} defined two-way route. The VentoFoil layouts used for these calculations are the following:`;
  const layoutLines = doc.splitTextToSize(layoutIntro, CONTENT_W);
  doc.text(layoutLines, MARGIN, y);
  y += layoutLines.length * 4.5 + 2;

  data.vfConfigs.forEach((cfg) => {
    const heightMap: Record<string, string> = {
      VF2810: "10m", VF2816: "16m", VF3824: "24m", VF5024: "24m", VF5030: "30m",
    };
    const h = heightMap[cfg.model] || cfg.model;
    const txt = `• Layout with ${cfg.quantity} ${h} (${cfg.model}) VentoFoils. This layout may also be referred to as ${cfg.quantity}* ${cfg.model}.`;
    const lines = doc.splitTextToSize(txt, CONTENT_W - 5);
    doc.text(lines, MARGIN + 3, y);
    y += lines.length * 4.5 + 2;
  });

  // ==================== ROUTE AND PREDICTED SAVINGS ====================
  y = newPage();
  y = sectionHeader(y, "Route and predicted savings");
  y += 2;
  doc.setFontSize(9);
  const routeIntroText = `For the study of the Blue Route Report, one route with this VentoFoil setup is calculated. The routes are inserted into Blue Route. The route follows a series of waypoints, beginning with the first country listed and proceeding in order through the successive waypoints.`;
  const routeIntroLines = doc.splitTextToSize(routeIntroText, CONTENT_W);
  doc.text(routeIntroLines, MARGIN, y);
  y += routeIntroLines.length * 4.5 + 4;

  // Route description
  const allWaypoints = [
    { country: data.departureCountry, city: data.departureCity },
    ...data.waypoints,
    { country: data.destinationCountry, city: data.destinationCity },
  ].filter((w) => w.country || w.city);

  const routeStr = allWaypoints.map((w) => `${w.country}(${w.city})`).join(", ");
  doc.setFont("helvetica", "bold");
  doc.text(`${getRouteName(data)}: `, MARGIN, y);
  doc.setFont("helvetica", "normal");
  const routeDescLines = doc.splitTextToSize(routeStr, CONTENT_W - 5);
  doc.text(routeDescLines, MARGIN, y + 4.5);
  y += (routeDescLines.length + 1) * 4.5 + 6;

  // Route sub-chapter
  y = newPage();
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
  doc.text(`Route ${getRouteName(data)}`, MARGIN, y);
  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN, y + 1, PAGE_W - MARGIN, y + 1);
  doc.setTextColor(0, 0, 0);
  y += 6;

  // Waypoints table
  doc.setFontSize(8);
  doc.setTextColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
  doc.text(`Table 3: Route ${getRouteName(data)}`, MARGIN, y);
  doc.setTextColor(0, 0, 0);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [["Country", "City or Cities"]],
    body: allWaypoints.map((w) => [w.country, w.city]),
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need a new page for results
  if (y > 180) { y = newPage(); }

  // Emission reductions table
  const outbound = data.blueRouteResults.outbound;
  if (outbound.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
    const minSpd = data.minSpeed || data.vesselParams.minRefSpeed || "—";
    const maxSpd = data.maxSpeed || data.vesselParams.maxRefSpeed || "—";
    doc.text(`Table 4: Emission reductions for ${minSpd}-${maxSpd} knots (${getRouteName(data)})`, MARGIN, y);
    doc.setTextColor(0, 0, 0);
    y += 3;

    const emissionRows: string[][] = [];
    outbound.forEach((row, i) => {
      data.vfConfigs.forEach((cfg, cIdx) => {
        const savings = row.reference > 0
          ? ((row.reference - (row.configs[cIdx] || 0)) / row.reference * 100).toFixed(1) + "%"
          : "—";
        const returnSavings = data.blueRouteResults.return[i]
          ? data.blueRouteResults.return[i].reference > 0
            ? ((data.blueRouteResults.return[i].reference - (data.blueRouteResults.return[i].configs[cIdx] || 0)) / data.blueRouteResults.return[i].reference * 100).toFixed(1) + "%"
            : "—"
          : "";
        emissionRows.push([
          i === 0 && cIdx === 0 ? getVFLabel(cfg) : (cIdx === 0 ? "—" : ""),
          `${row.speed} kts`,
          savings,
          returnSavings,
        ]);
      });
    });

    const hasReturn = data.blueRouteResults.return.length > 0;
    autoTable(doc, {
      startY: y,
      head: [["System", "Speed", "CO₂ reduction / fuel savings", ...(hasReturn ? ["Return savings"] : [])]],
      body: emissionRows.map((r) => hasReturn ? r : r.slice(0, 3)),
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // ==================== BAR CHART ====================
    if (y > 170) { y = newPage(); }
    drawBarChart(doc, data, "outbound", y, `Net fuel consumption (${getRouteName(data)})`);
    y += 90;

    if (data.blueRouteResults.return.length > 0) {
      if (y > 170) { y = newPage(); }
      drawBarChart(doc, data, "return", y, `Net fuel consumption - Return (${getRouteName(data)})`);
      y += 90;
    }
  }

  // ==================== WEATHER ROUTING ====================
  y = newPage();
  y = sectionHeader(y, "Weather routing");
  y += 2;
  doc.setFontSize(9);
  const weatherText = "Weather routing is the process of planning and optimizing a vessel's route to maximize harvestable wind, reduce fuel consumption, and minimize CO₂ emissions. Please note that this study did not include route optimization for wind-assisted propulsion. Savings can most probably be increased by changing the route based on wind averages or actual conditions per voyage.";
  const weatherLines = doc.splitTextToSize(weatherText, CONTENT_W);
  doc.text(weatherLines, MARGIN, y);
  y += weatherLines.length * 4.5 + 8;

  // ==================== CONCLUSION ====================
  y = sectionHeader(y, "Conclusion");
  y += 2;
  doc.setFontSize(9);

  // Calculate min/max savings
  let allSavings: number[] = [];
  [...data.blueRouteResults.outbound, ...data.blueRouteResults.return].forEach((row) => {
    data.vfConfigs.forEach((_, cIdx) => {
      if (row.reference > 0 && row.configs[cIdx]) {
        allSavings.push((row.reference - row.configs[cIdx]) / row.reference * 100);
      }
    });
  });
  const minSav = allSavings.length > 0 ? Math.min(...allSavings).toFixed(1) : "—";
  const maxSav = allSavings.length > 0 ? Math.max(...allSavings).toFixed(1) : "—";

  const concText = `According to this case study it can be concluded that typical savings can be expected of around ${minSav}% to ${maxSav}% depending on the vessels speed and route. By optimizing routes for favorable winds, higher savings will most probably become achievable. As expected savings are higher at slower vessel speeds, since apparent wind shifts to the opposite of the ships trajectory, as the ship increases its speed.\n\nSummary:\n• Expected savings of ${minSav} - ${maxSav} % (depending on vessel speed)\n• Possibly higher savings with the use of weather routing`;
  const concLines = doc.splitTextToSize(concText, CONTENT_W);
  doc.text(concLines, MARGIN, y);

  // ==================== BIBLIOGRAPHY + APPENDICES ====================
  y = newPage();
  y = sectionHeader(y, "Bibliography");
  y += 2;
  doc.setFontSize(8);
  doc.text('[1] E. R. G. Y. K. Y. K. K. T. D. W. S. Alterskjær S. A., "ITTC Quality System Manual', MARGIN, y);
  y += 4;
  doc.text('    Recommended Procedures and Guidelines - Predicting the Power Saving of Wind', MARGIN, y);
  y += 4;
  doc.text('    Powered Ships," ITTC (International Towing Tank Conference), 2024.', MARGIN, y);
  y += 6;
  doc.text('[2] IMO (International Maritime Organisation), "MEPC.1/Circular.815," in 2013 Guidance on', MARGIN, y);
  y += 4;
  doc.text('    Treatment of Innovative Energy Efficiency Technologies, London, 2013.', MARGIN, y);
  y += 12;

  y = sectionHeader(y, "List of appendices");
  y += 3;
  doc.setFontSize(9);
  doc.text("Appendix I     EEXI WASP FORMULA", MARGIN + 5, y); y += 5;
  doc.text("Appendix II    MEPC.1/CIRC.896", MARGIN + 5, y); y += 5;
  doc.text("Appendix III   ECONOWIND ASSUMPTIONS", MARGIN + 5, y); y += 5;
  doc.text("Appendix IV    BLUE ROUTE DATA SOURCES AND ASSUMPTIONS", MARGIN + 5, y);

  // ==================== APPENDIX I ====================
  y = newPage();
  y = appendixHeader(y, "Appendix I", "EEXI WASP Formula");
  doc.setFontSize(9);
  const appIText = "The EEXI WASP formula calculates the available effective power delivered by the specified wind assisted propulsion system, accounting for wind probability matrices and propulsion system forces.";
  const appILines = doc.splitTextToSize(appIText, CONTENT_W);
  doc.text(appILines, MARGIN, y);

  // ==================== APPENDIX II ====================
  y = newPage();
  y = appendixHeader(y, "Appendix II", "MEPC.1/Circ.896");
  doc.setFontSize(9);
  doc.text("MARINE ENVIRONMENT PROTECTION COMMITTEE 77th", MARGIN, y);
  y += 6;
  const appIIText = "4 Wind propulsion system force matrix F(Vref)i,j\n2.4.1 Measurement of the wind propulsion coefficients\n2.4.1.1 The wind propulsion system force matrix is a table describing the average wind propulsion coefficients corresponding to the global wind probability matrix.\n\nThe methods include:\n1 wind tunnel model test;\n2 CFD/numerical calculations;";
  const appIILines = doc.splitTextToSize(appIIText, CONTENT_W);
  doc.text(appIILines, MARGIN, y);

  // ==================== APPENDIX III ====================
  y = newPage();
  y = appendixHeader(y, "Appendix III", "EconoWind Assumptions");
  doc.setFontSize(9);
  const assumptions = [
    "• Cq = 0.04",
    "• Air density: Rho = 1.225 [kg/m³]",
    "• Minimum operational apparent wind speed: SU_a_min = 2.9 [m/s]",
    "• Maximum operational apparent wind speed: U_a_max = 17.1 [m/s]",
    "• Propellor efficiency: EFF = 0.7",
    "• Wind speed above which the maximum fan power: U_a_rated = 13.7 [m/s]",
    "• Installed fan power: P_rated = 0.414 [kW/m²]",
  ];
  assumptions.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 5;
  });

  // ==================== APPENDIX IV ====================
  y = newPage();
  y = appendixHeader(y, "Appendix IV", "Blue Route Data Sources and Assumptions");
  doc.setFontSize(8);
  const appIVText = "The fuel consumption and CO₂ emissions are calculated accounting for both the lower required propeller thrust and the additional power required for running devices. The following modelling is included:\n- Resolving the wind at the centre of effort of the wind propulsors\n- Calculating the ship equilibrium including leeway, heel and rudder angle\n- Accounting for the resulting induced resistance from the hull and rudder\n\nBy default, following constraints are applied:\n- The rudder angle may not exceed 20 degrees\n- The heel angle may not exceed 10 degrees\n- The propeller thrust may not be negative\n\nData sources: Wind statistics are based on 30 (1989-2019) years of ERA-5 data. Aerodynamic WASP forces data is either taken from wind tunnel tests or CFD calculations.";
  const appIVLines = doc.splitTextToSize(appIVText, CONTENT_W);
  doc.text(appIVLines, MARGIN, y);

  // Replace the {TOTAL} placeholder in each interior-page header.
  // Page number was drawn right-aligned at (PAGE_W - MARGIN, 16) in gray.
  // We clear that corner and redraw with the real total.
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(255, 255, 255);
    doc.rect(PAGE_W - MARGIN - 40, 13, 40, 5, "F");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MARGIN, 16, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }
  doc.setPage(1);

  // Save
  const fileName = `${data.odooRef || "report"}-Econowind-BlueRoute-${data.version}-${data.revision}-${data.shipName || "ship"}.pdf`.replace(/\s+/g, "-");
  // Optional headless test hook: when set, skip the browser download and
  // hand the raw bytes + filename to the test harness. No effect in prod.
  const capture = (globalThis as any).__BR_CAPTURE__;
  if (typeof capture === "function") {
    capture(doc.output("arraybuffer"), fileName);
    return;
  }
  doc.save(fileName);
}

function drawBarChart(
  doc: jsPDF,
  data: ReportData,
  route: "outbound" | "return",
  startY: number,
  title: string
) {
  const results = data.blueRouteResults[route];
  if (!results || results.length === 0) return;

  const chartX = MARGIN + 5;
  const chartY = startY;
  const chartW = CONTENT_W - 10;
  const chartH = 75;
  const barGroupH = chartH / results.length;
  const numConfigs = data.vfConfigs.length;
  const barH = barGroupH / (numConfigs + 1) - 1;

  // Find max value for X-axis
  let maxVal = 0;
  results.forEach((row) => {
    maxVal = Math.max(maxVal, row.reference);
    row.configs.forEach((c) => { maxVal = Math.max(maxVal, c); });
  });
  maxVal = maxVal * 1.15;

  // Title
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(title, chartX, chartY - 2);
  doc.setFont("helvetica", "normal");

  // Chart background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.rect(chartX, chartY, chartW, chartH, "FD");

  // Y-axis label
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);

  // Grid lines
  const numGridLines = 5;
  for (let i = 0; i <= numGridLines; i++) {
    const x = chartX + (chartW * i) / numGridLines;
    doc.setDrawColor(230, 230, 230);
    doc.line(x, chartY, x, chartY + chartH);
    const val = ((maxVal * i) / numGridLines).toFixed(1);
    doc.text(val, x, chartY + chartH + 4, { align: "center" });
  }

  // X axis label
  doc.setFontSize(7);
  doc.text(data.blueRouteResults.unit || "ton/day", chartX + chartW / 2, chartY + chartH + 8, { align: "center" });

  // Draw bars
  results.forEach((row, rowIdx) => {
    const groupY = chartY + rowIdx * barGroupH + 1;

    // Reference bar (dark gray)
    const refW = maxVal > 0 ? (row.reference / maxVal) * chartW : 0;
    doc.setFillColor(CHART_REF[0], CHART_REF[1], CHART_REF[2]);
    doc.rect(chartX, groupY, refW, barH, "F");
    doc.setFontSize(6);
    doc.setTextColor(60, 60, 60);
    doc.text(row.reference.toFixed(2), chartX + refW + 1, groupY + barH / 2 + 1.5);

    // Config bars
    row.configs.forEach((val, cIdx) => {
      const barY = groupY + (cIdx + 1) * (barH + 1);
      const barW = maxVal > 0 ? (val / maxVal) * chartW : 0;
      const color = CHART_COLORS[cIdx % CHART_COLORS.length];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(chartX, barY, barW, barH, "F");

      // Label with savings
      const savings = row.reference > 0
        ? ((row.reference - val) / row.reference * 100).toFixed(1)
        : "0.0";
      doc.setFontSize(6);
      doc.setTextColor(60, 60, 60);
      doc.text(`${val.toFixed(2)} (-${savings}%)`, chartX + barW + 1, barY + barH / 2 + 1.5);
    });

    // Speed label on left
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(`${row.speed}`, chartX - 4, groupY + barGroupH / 2 + 1, { align: "right" });
  });

  // Legend
  const legendY = chartY + chartH + 12;
  doc.setFontSize(7);
  // Reference
  doc.setFillColor(CHART_REF[0], CHART_REF[1], CHART_REF[2]);
  doc.rect(chartX + chartW / 2 - 10, legendY - 2, 8, 3, "F");
  doc.setTextColor(60, 60, 60);
  doc.text("Reference", chartX + chartW / 2, legendY);

  // Config colors
  data.vfConfigs.forEach((cfg, i) => {
    const lx = chartX + chartW / 2 + 30 + i * 40;
    const color = CHART_COLORS[i % CHART_COLORS.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(lx - 10, legendY - 2, 8, 3, "F");
    doc.text(getVFLabel(cfg), lx, legendY);
  });
}
