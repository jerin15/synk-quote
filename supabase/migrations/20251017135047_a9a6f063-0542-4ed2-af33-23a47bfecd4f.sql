-- Create enum for quotation sources
CREATE TYPE quotation_source AS ENUM ('google_ads', 'whatsapp', 'mail', 'other');

-- Create enum for quotation status
CREATE TYPE quotation_status AS ENUM ('pending', 'quoted', 'confirmed', 'delivered', 'cancelled');

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sl_number INTEGER NOT NULL UNIQUE,
  date DATE NOT NULL,
  time_in TIMESTAMPTZ NOT NULL,
  source quotation_source NOT NULL,
  client TEXT NOT NULL,
  item TEXT NOT NULL,
  time_out TIMESTAMPTZ,
  quoted_date DATE,
  quote_number TEXT,
  status quotation_status NOT NULL DEFAULT 'pending',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sl_number INTEGER NOT NULL UNIQUE,
  date_received DATE NOT NULL,
  client_name TEXT NOT NULL,
  po_number TEXT,
  remarks TEXT,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tax_invoices table
CREATE TABLE public.tax_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sl_number INTEGER NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  items TEXT NOT NULL,
  tax_inv_number TEXT,
  remarks TEXT,
  po_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for business use)
CREATE POLICY "Allow all operations on quotations" ON public.quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tax_invoices" ON public.tax_invoices FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_invoices_updated_at
  BEFORE UPDATE ON public.tax_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing data from the Excel sheet
INSERT INTO public.quotations (sl_number, date, time_in, source, client, item, status, remarks) VALUES
(323, '2025-09-20', '2025-09-20 10:53:00+00', 'google_ads', 'UM', 'Safety Vest', 'pending', NULL),
(324, '2025-09-22', '2025-09-22 10:53:00+00', 'google_ads', 'Adnan', 'Safety Vest', 'pending', NULL),
(326, '2025-09-27', '2025-09-27 10:53:00+00', 'google_ads', 'Bisimwa Trading Sarlu', 'Safety Vest', 'pending', NULL),
(327, '2025-09-27', '2025-09-27 10:53:00+00', 'google_ads', 'Afra Customer Care', 'Service T Shirts', 'pending', NULL),
(331, '2025-09-28', '2025-09-28 10:53:00+00', 'google_ads', 'Gastino', 'Tshirts and Sweaters', 'pending', NULL),
(332, '2025-09-26', '2025-09-26 10:53:00+00', 'google_ads', 'Rescue?', 'Safety Vest', 'pending', NULL),
(335, '2025-09-27', '2025-09-27 10:53:00+00', 'google_ads', 'Wearsashe', 'TSHirt Printing', 'pending', NULL),
(336, '2025-09-27', '2025-09-27 10:53:00+00', 'google_ads', 'GH Finances Plus', 'Pullover', 'pending', NULL),
(337, '2025-09-29', '2025-09-29 10:53:00+00', 'google_ads', 'Sidarth', 'Tshirts with reflectors', 'pending', NULL),
(338, '2025-09-20', '2025-09-20 10:53:00+00', 'google_ads', 'Emm Jay', 'Embroidery on 4 shirts', 'pending', NULL),
(340, '2025-10-01', '2025-10-01 10:53:00+00', 'google_ads', 'Muhammad Nauman', 'Jerseys', 'pending', NULL),
(341, '2025-10-03', '2025-10-03 10:53:00+00', 'google_ads', 'Mahavishnu', 'Hoodies', 'pending', NULL),
(342, '2025-10-04', '2025-10-04 11:40:00+00', 'whatsapp', 'Abdoz', 'Pen', 'pending', 'Waiting for the approval from their sales person'),
(367, '2025-10-09', '2025-10-09 09:30:00+00', 'other', 'CCI', 'Signange', 'pending', NULL),
(373, '2025-10-13', '2025-10-13 09:57:00+00', 'mail', 'Aurantius', 'Signage', 'pending', NULL),
(379, '2025-10-13', '2025-10-13 09:57:00+00', 'mail', 'Five Building', 'Calendars /Give Aways', 'pending', NULL),
(399, '2025-10-16', '2025-10-16 16:00:00+00', 'google_ads', 'Maneesha', 'T shirt and cap', 'pending', NULL);

INSERT INTO public.purchase_orders (sl_number, date_received, client_name, po_number, remarks) VALUES
(1, '2025-10-02', 'Hult', 'AE205-1000096', 'Inv is still pending (Get the info for what items need to be included in this number)'),
(2, '2025-10-06', 'Trane', NULL, 'PO Pending'),
(3, '2025-09-26', 'MU', 'NVT001904', 'Delivery is not done yet'),
(4, '2025-10-10', 'Trane', NULL, 'PO Pending');

INSERT INTO public.tax_invoices (sl_number, client_name, items, remarks) VALUES
(1, 'Hult', 'BC, Paper sticker and Sticker installation / MIM and MBA A5 card and Tent card / MBA Executive printable items', 'PO needs to confirm'),
(2, 'Murdoch', 'Cotton Bag - 100 pcs', 'Delivery is not done yet'),
(3, 'IDP Ruby', 'BC (100 x 2 name)', 'PO needs to confirm'),
(4, 'IDP Mohab', 'Najah', 'PO needs to confirm'),
(5, 'Trane DXB', 'BC', 'PO needs to confirm');