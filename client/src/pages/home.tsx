import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Report } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Trash2, Ship } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reports", {
        state: "Draft",
        version: "V1.0",
        revision: "RevA",
        date: new Date().toLocaleDateString("en-GB"),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      navigate(`/report/${data.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({ title: "Report deleted" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-[hsl(210,100%,20%)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EconowindLogo />
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                BlueRoute Report Generator
              </h1>
              <p className="text-sm text-blue-200 opacity-80">EconoWind Internal Tool</p>
            </div>
          </div>
          <Button
            data-testid="button-new-report"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="bg-[hsl(160,100%,39%)] hover:bg-[hsl(160,100%,33%)] text-[hsl(210,100%,10%)] font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-4" data-testid="text-reports-heading">
          Saved Reports
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : !reports || reports.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Ship className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground mb-4">No reports yet. Create your first Blue Route Report.</p>
            <Button
              data-testid="button-new-report-empty"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="bg-[hsl(160,100%,39%)] hover:bg-[hsl(160,100%,33%)] text-[hsl(210,100%,10%)] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                data-testid={`card-report-${report.id}`}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border"
                onClick={() => navigate(`/report/${report.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[hsl(160,100%,39%)]" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {report.version} - {report.revision}
                    </span>
                  </div>
                  <button
                    data-testid={`button-delete-${report.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(report.id);
                    }}
                    className="text-muted-foreground hover:text-destructive p-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-sm truncate" data-testid={`text-ship-name-${report.id}`}>
                  {report.shipName || "Untitled Report"}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {report.customerName || "No customer"} &middot; {report.engineer || "No engineer"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ref: {report.odooRef || "—"} &middot; {report.date || "No date"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EconowindLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="EconoWind Logo">
      <rect x="2" y="2" width="32" height="32" rx="6" fill="hsl(160, 100%, 39%)" />
      <path d="M8 14 L18 8 L28 14 L28 22 L18 28 L8 22Z" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M13 18 L18 12 L23 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="18" y1="12" x2="18" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
