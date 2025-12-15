import { useState } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Eye,
  Share2,
  Trash2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reports = [
  {
    id: 1,
    title: "CAR-T Therapy Market Landscape 2024",
    createdBy: "Dr. Sarah Chen",
    date: "Dec 5, 2024",
    tags: ["Oncology", "Market Analysis"],
    pages: 24,
    downloads: 12,
  },
  {
    id: 2,
    title: "GLP-1 Agonists Competitive Intelligence Report",
    createdBy: "Dr. Michael Park",
    date: "Dec 3, 2024",
    tags: ["Metabolic", "Competitive Intel"],
    pages: 18,
    downloads: 8,
  },
  {
    id: 3,
    title: "mRNA Vaccine Platform Patent Analysis",
    createdBy: "Dr. Sarah Chen",
    date: "Nov 28, 2024",
    tags: ["Vaccines", "Patents"],
    pages: 32,
    downloads: 15,
  },
  {
    id: 4,
    title: "Alzheimer's Disease Biomarkers Clinical Review",
    createdBy: "Dr. Emily Watson",
    date: "Nov 25, 2024",
    tags: ["Neurology", "Clinical Trials"],
    pages: 28,
    downloads: 6,
  },
  {
    id: 5,
    title: "Gene Therapy Regulatory Landscape EU & US",
    createdBy: "Dr. James Liu",
    date: "Nov 20, 2024",
    tags: ["Regulatory", "Gene Therapy"],
    pages: 15,
    downloads: 21,
  },
];

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [viewReport, setViewReport] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDownload = (report: any) => {
    // Demo: create a simple text-based report download
    const content = `Report: ${report.title}\nAuthor: ${report.createdBy}\nDate: ${report.date}\nPages: ${report.pages}\n\nThis is a demo report export for ${report.title}.`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9_-]/gi, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || report.tags.some((t) => t.toLowerCase().includes(filterTag.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">View and download your research reports.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tags</SelectItem>
              <SelectItem value="oncology">Oncology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
              <SelectItem value="patents">Patents</SelectItem>
              <SelectItem value="market">Market Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="gradient">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => { setViewReport(report); setDialogOpen(true); }}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleDownload(report)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
              {report.title}
            </h3>

            <div className="flex flex-wrap gap-1 mb-4">
              {report.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-24">{report.createdBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{report.date}</span>
              </div>
            </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{report.pages} pages</span>
                <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
              </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No reports found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* View Report Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewReport?.title}</DialogTitle>
            <DialogDescription>
              <div className="text-sm text-muted-foreground">{viewReport?.createdBy} — {viewReport?.date}</div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="whitespace-pre-wrap">{viewReport ? `Preview of ${viewReport.title}\n\nThis is a demo preview for the report content.` : ""}</p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            <Button onClick={() => { if (viewReport) handleDownload(viewReport); }}>Download</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
