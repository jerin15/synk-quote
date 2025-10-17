import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const NewQuotation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sl_number: "",
    date: new Date().toISOString().split("T")[0],
    time_in: new Date().toISOString().slice(0, 16),
    client: "",
    item: "",
    source: "google_ads" as "google_ads" | "whatsapp" | "mail" | "other",
    status: "pending" as "pending" | "quoted" | "approved" | "cancelled",
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("quotations").insert([
        {
          sl_number: parseInt(formData.sl_number),
          date: formData.date,
          time_in: new Date(formData.time_in).toISOString(),
          client: formData.client,
          item: formData.item,
          source: formData.source,
          status: formData.status,
          remarks: formData.remarks || null,
        },
      ]);

      if (error) throw error;

      toast.success("Quotation created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error creating quotation:", error);
      toast.error(error.message || "Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">New Quotation</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sl_number">SL Number *</Label>
                <Input
                  id="sl_number"
                  type="number"
                  required
                  value={formData.sl_number}
                  onChange={(e) =>
                    setFormData({ ...formData, sl_number: e.target.value })
                  }
                  placeholder="e.g., 400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_in">Time In *</Label>
                <Input
                  id="time_in"
                  type="datetime-local"
                  required
                  value={formData.time_in}
                  onChange={(e) =>
                    setFormData({ ...formData, time_in: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value: "google_ads" | "whatsapp" | "mail" | "other") =>
                    setFormData({ ...formData, source: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="mail">Email</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client Name *</Label>
                <Input
                  id="client"
                  required
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  placeholder="Enter client name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "quoted" | "approved" | "cancelled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item/Product *</Label>
              <Input
                id="item"
                required
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="Enter item description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Add any additional notes or remarks"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" size="lg" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Quotation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewQuotation;
