import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Report } from "@shared/schema";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  type ReportData,
  getDefaultReportData,
  dbToReportData,
  reportDataToDb,
} from "@/lib/report-types";
import {
  ArrowLeft,
  Save,
  FileDown,
  FileUp,
  FileText,
  Ship,
  Anchor,
  Settings,
  MapPin,
  Wind,
  BarChart3,
  Eye,
} from "lucide-react";
import DocumentInfoSection from "@/components/sections/document-info";
import CustomerShipSection from "@/components/sections/customer-ship";
import VesselParamsSection from "@/components/sections/vessel-params";
import AssumptionsSection from "@/components/sections/assumptions";
import RouteSection from "@/components/sections/route-section";
import VFConfigSection from "@/components/sections/vf-config";
import ResultsSection from "@/components/sections/results-section";
import ExcelUpload from "@/components/excel-upload";
import PreviewPanel from "@/components/preview-panel";
import { generatePdf } from "@/lib/pdf-generator";

const SECTIONS = [
  { id: "document", label: "Document Info", icon: FileText },
  { id: "customer", label: "Customer & Ship", icon: Ship },
  { id: "vessel", label: "Vessel Parameters", icon: Anchor },
  { id: "assumptions", label: "Assumptions", icon: Settings },
  { id: "route", label: "Route Definition", icon: MapPin },
  { id: "vfconfig", label: "VentoFoil Config", icon: Wind },
  { id: "results", label: "Blue Route Results", icon: BarChart3 },
];

export default function ReportEditor() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("document");
  const [showPreview, setShowPreview] = useState(false);
  const [data, setData] = useState<ReportData>(getDefaultReportData());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: report, isLoading } = useQuery<Report>({
    queryKey: ["/api/reports", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/reports/${id}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (report) {
      setData(dbToReportData(report));
    }
  }, [report]);

  const saveMutation = useMutation({
    mutationFn: async (reportData: ReportData) => {
      const res = await apiRequest("PATCH", `/api/reports/${id}`, reportDataToDb(reportData));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setHasUnsavedChanges(false);
      toast({ title: "Report saved" });
    },
    onError: () => {
      toast({ title: "Failed to save", variant: "destructive" });
    },
  });

  const updateData = useCallback((partial: Partial<ReportData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setHasUnsavedChanges(true);
  }, []);

  const handleExcelParsed = useCallback((parsed: ReportData) => {
    setData(parsed);
    setHasUnsavedChanges(true);
    toast({ title: "Excel data imported successfully" });
  }, [toast]);

  const handleGeneratePdf = useCallback(async () => {
    try {
      await generatePdf(data);
      toast({ title: "PDF generated and downloaded" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "PDF generation failed", description: err.message, variant: "destructive" });
    }
  }, [data, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-96 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-[hsl(210,100%,20%)] text-white shrink-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-back"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="h-5 w-px bg-white/20" />
            <div>
              <h1
                className="text-sm font-semibold truncate max-w-[260px]"
                data-testid="text-report-title"
              >
                {data.shipName || "Untitled"} — {data.customerName || "No Customer"}
              </h1>
              <p className="text-xs text-blue-200 opacity-70">
                {data.version} - {data.revision} &middot; Ref: {data.odooRef || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExcelUpload onParsed={handleExcelParsed} />
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-preview"
              onClick={() => setShowPreview(!showPreview)}
              className="text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              {showPreview ? "Hide" : "Preview"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-save"
              onClick={() => saveMutation.mutate(data)}
              disabled={saveMutation.isPending || !hasUnsavedChanges}
              className="text-white hover:bg-white/10"
            >
              <Save className="w-4 h-4 mr-1" />
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              data-testid="button-generate-pdf"
              onClick={handleGeneratePdf}
              className="bg-[hsl(160,100%,39%)] hover:bg-[hsl(160,100%,33%)] text-[hsl(210,100%,10%)] font-semibold"
            >
              <FileDown className="w-4 h-4 mr-1" />
              Generate PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-56 shrink-0 bg-[hsl(210,100%,15%)] text-white border-r border-[hsl(210,60%,20%)] overflow-y-auto">
          <nav className="py-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  data-testid={`nav-${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                    isActive
                      ? "bg-[hsl(160,100%,39%)]/15 text-[hsl(160,100%,55%)] border-r-2 border-[hsl(160,100%,39%)]"
                      : "text-blue-200/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Form */}
          <div className={`${showPreview ? "w-1/2" : "w-full"} border-r border-border overflow-y-auto`}>
            <div className="p-6 max-w-3xl">
              {activeSection === "document" && (
                <DocumentInfoSection data={data} onChange={updateData} />
              )}
              {activeSection === "customer" && (
                <CustomerShipSection data={data} onChange={updateData} />
              )}
              {activeSection === "vessel" && (
                <VesselParamsSection data={data} onChange={updateData} />
              )}
              {activeSection === "assumptions" && (
                <AssumptionsSection data={data} onChange={updateData} />
              )}
              {activeSection === "route" && (
                <RouteSection data={data} onChange={updateData} />
              )}
              {activeSection === "vfconfig" && (
                <VFConfigSection data={data} onChange={updateData} />
              )}
              {activeSection === "results" && (
                <ResultsSection data={data} onChange={updateData} />
              )}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 bg-muted/30 overflow-y-auto">
              <div className="p-4">
                <PreviewPanel data={data} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
