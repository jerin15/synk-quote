import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2, ExternalLink, Download, FileDown } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

interface Quotation {
  id: string;
  sl_number: number;
  date: string;
  client: string;
  item: string;
  source: string;
  status: string;
  remarks: string | null;
  quote_number: string | null;
  quoted_date: string | null;
}

interface QuotationsListProps {
  onUpdate?: () => void;
}

export const QuotationsList = ({ onUpdate }: QuotationsListProps) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [searchTerm, statusFilter, quotations]);

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = quotations;

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.sl_number.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    setFilteredQuotations(filtered);
  };

  const deleteQuotation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;

    try {
      const { error } = await supabase.from("quotations").delete().eq("id", id);

      if (error) throw error;

      toast.success("Quotation deleted successfully");
      fetchQuotations();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      pending: { className: "bg-warning/10 text-warning border-warning/20" },
      quoted: { className: "bg-primary/10 text-primary border-primary/20" },
      confirmed: { className: "bg-success/10 text-success border-success/20" },
      hold: { className: "bg-accent/10 text-accent border-accent/20" },
      cancelled: { className: "bg-destructive/10 text-destructive border-destructive/20" },
    };

    return (
      <Badge variant="outline" className={variants[status]?.className || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const displaySource = source.replace("_", " ");
    return (
      <Badge variant="secondary" className="capitalize">
        {displaySource}
      </Badge>
    );
  };

  const handleExportCSV = () => {
    const exportData = filteredQuotations.map((q) => ({
      sl_number: q.sl_number,
      date: q.date,
      client: q.client,
      item: q.item,
      source: q.source,
      status: q.status,
      quote_number: q.quote_number,
      quoted_date: q.quoted_date,
      remarks: q.remarks,
    }));
    exportToCSV(exportData, "quotations");
    toast.success("CSV exported successfully");
  };

  const handleExportPDF = () => {
    const exportData = filteredQuotations.map((q) => ({
      sl_number: q.sl_number,
      date: q.date,
      client: q.client,
      item: q.item,
      source: q.source,
      status: q.status,
      quote_number: q.quote_number,
      quoted_date: q.quoted_date,
      remarks: q.remarks,
    }));
    exportToPDF(exportData, "quotations");
    toast.success("PDF exported successfully");
  };

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Recent Quotations</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Link to="/analytics">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, item, or SL number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading quotations...</div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm || statusFilter !== "all"
            ? "No quotations found matching your filters"
            : "No quotations yet. Create your first one!"}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SL #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.sl_number}</TableCell>
                  <TableCell>{format(new Date(quotation.date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-medium">{quotation.client}</TableCell>
                  <TableCell>{quotation.item}</TableCell>
                  <TableCell>{getSourceBadge(quotation.source)}</TableCell>
                  <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {quotation.remarks || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/edit-quotation/${quotation.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuotation(quotation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
