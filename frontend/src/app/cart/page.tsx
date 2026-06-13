"use client";

import {
  FlaskConical,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  Undo2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { ProductVisual } from "@/components/product-visual";
import { useShop } from "@/components/shop-state";
import { cn } from "@/lib/utils";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export default function CartPage() {
  const [today] = useState(
    () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10),
  );
  const [customerSource, setCustomerSource] = useState<"simulation" | "dataset">("simulation");
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedDatasetCustomer, setSelectedDatasetCustomer] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const {
    cart,
    datasetCustomers,
    total,
    busy,
    error,
    result,
    simulationMode,
    transactionType,
    transactionDate,
    setSimulationMode,
    setTransactionType,
    setTransactionDate,
    searchDatasetCustomers,
    activateExistingCustomer,
    updateQuantity,
    clearCart,
    clearError,
    checkout,
  } = useShop();
  const modeOptions = [
    { value: "first_time", label: "First-time buyer" },
    { value: "premium", label: "Premium history" },
    { value: "high_cancel", label: "High-cancel history" },
    { value: "planned", label: "Planned buyer history" },
    { value: "international", label: "International history" },
  ];
  const hasPurchaseHistory = Boolean(
    result && (result.summary.purchase_invoice_count ?? result.summary.invoice_count) > 0,
  );
  const activeDatasetCustomerId = selectedDatasetCustomer || datasetCustomers[0]?.dataset_customer_id || "";
  const selectedCustomer = useMemo(
    () => datasetCustomers.find((customer) => customer.dataset_customer_id === activeDatasetCustomerId),
    [activeDatasetCustomerId, datasetCustomers],
  );
  const datasetCustomerItems = useMemo(
    () =>
      datasetCustomers.map((customer) => ({
        value: customer.dataset_customer_id,
        label: `${customer.display_customer_id} - ${customer.country} - ${customer.cluster_label}`,
      })),
    [datasetCustomers],
  );

  useEffect(() => {
    if (customerSource === "dataset" && datasetCustomers.length === 0) {
      void searchDatasetCustomers();
    }
  }, [customerSource, datasetCustomers.length, searchDatasetCustomers]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Checkout"
        title="Review cart lalu jalankan segmentasi."
        description="Setelah checkout, cart dikosongkan tetapi histori customer tetap dipakai untuk pembelian berikutnya."
        action={
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-full px-5")} href="/">
            <Store size={16} aria-hidden="true" />
            Tambah Produk
          </Link>
        }
      />

      <ErrorAlert message={error} onDismiss={clearError} />

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="rounded-[var(--radius-card)] border-border shadow-none">
          <CardHeader className="gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Cart items
              </span>
              <CardTitle className="mt-2 text-2xl text-primary">
                {cart.length ? `${cart.length} produk di cart` : "Cart kosong"}
              </CardTitle>
            </div>
            <CardAction>
              <Button
                size="icon-lg"
                variant="outline"
                className="rounded-full"
                onClick={() => setConfirmClear(true)}
                disabled={!cart.length || busy}
                aria-label="Clear cart"
              >
                <Trash2 size={18} aria-hidden="true" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            {cart.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
                <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
                  <ShoppingCart size={28} aria-hidden="true" />
                </span>
                <div className="space-y-1.5">
                  <strong className="block text-lg font-semibold text-primary">Cart masih kosong</strong>
                  <p className="mx-auto max-w-xs text-sm leading-6 text-muted-foreground">
                    Pilih produk dari katalog untuk memulai simulasi pembelian.
                  </p>
                </div>
                <Link className={cn(buttonVariants(), "h-11 rounded-full px-5")} href="/">
                  <Store size={16} aria-hidden="true" />
                  Jelajahi Katalog
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border motion-stagger">
                {cart.map((item) => (
                  <div
                    className="grid gap-4 p-4 transition-colors hover:bg-secondary/30 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                    key={item.product_id}
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-secondary">
                        <ProductVisual stockCode={item.stock_code} description={item.description} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">{item.stock_code}</span>
                        <h3 className="mt-1 text-base font-semibold leading-snug text-primary">{item.description}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{currency(item.unit_price)} per item</p>
                      </div>
                    </div>
                    <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/45 p-1">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-full bg-background"
                        onClick={() => updateQuantity(item.product_id, -1)}
                        aria-label="Kurangi quantity"
                      >
                        <Minus size={15} aria-hidden="true" />
                      </Button>
                      <strong className="min-w-6 text-center text-sm text-primary">{item.quantity}</strong>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-full bg-background"
                        onClick={() => updateQuantity(item.product_id, 1)}
                        aria-label="Tambah quantity"
                      >
                        <Plus size={15} aria-hidden="true" />
                      </Button>
                    </div>
                    <strong className="text-lg font-semibold text-primary">
                      {currency(item.unit_price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[var(--radius-card)] border-border shadow-none [--card-spacing:--spacing(6)]" size="sm">
          <CardHeader>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Order summary
            </span>
          </CardHeader>
          <CardContent className="space-y-5">
            {hasPurchaseHistory ? (
              <div className="rounded-[var(--radius-card)] border border-border bg-secondary/60 p-3">
                <span className="text-sm text-muted-foreground">
                  {result?.summary.source === "dataset" ? "Existing dataset customer" : "History mode locked"}
                </span>
                <strong className="mt-1 block text-sm font-semibold text-primary">
                  {result?.summary.source === "dataset"
                    ? `${result.customer_id} memakai histori Online Retail.`
                    : "Customer ini sudah punya histori pembelian."}
                </strong>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Pembelian berikutnya memakai histori yang sama. Klik Customer Baru untuk memilih skenario awal lagi.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Customer source</Label>
                  <Tabs
                    value={customerSource}
                    onValueChange={(value) => setCustomerSource(value as "simulation" | "dataset")}
                  >
                    <TabsList className="relative grid w-full grid-cols-2 rounded-full bg-secondary p-1 group-data-horizontal/tabs:h-auto">
                      <TabsIndicator />
                      <TabsTrigger
                        className="relative z-10 h-10 rounded-full transition-colors duration-300 data-active:!bg-transparent data-active:![color:var(--primary-foreground)]"
                        value="simulation"
                      >
                        <FlaskConical size={15} aria-hidden="true" />
                        Simulation
                      </TabsTrigger>
                      <TabsTrigger
                        className="relative z-10 h-10 rounded-full transition-colors duration-300 data-active:!bg-transparent data-active:![color:var(--primary-foreground)]"
                        value="dataset"
                      >
                        <Users size={15} aria-hidden="true" />
                        Dataset
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {customerSource === "simulation" ? (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Initial customer scenario</Label>
                    <Select
                      items={modeOptions}
                      value={simulationMode}
                      onValueChange={(value) => {
                        if (value) setSimulationMode(String(value));
                      }}
                    >
                      <SelectTrigger className="!h-11 w-full rounded-full bg-background px-4">
                        <SelectValue placeholder="Pilih skenario" />
                      </SelectTrigger>
                      <SelectContent>
                        {modeOptions.map((option) => (
                          <SelectItem value={option.value} key={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-muted-foreground">Cari customer dataset</Label>
                    <div className="flex gap-2">
                      <label className="relative min-w-0 flex-1">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          className="h-11 rounded-full bg-background pl-10"
                          value={customerQuery}
                          onChange={(event) => setCustomerQuery(event.target.value)}
                          placeholder="CustomerID, country, atau C1-C6"
                        />
                      </label>
                      <Button
                        type="button"
                        className="h-11 rounded-full px-4"
                        variant="outline"
                        onClick={() => searchDatasetCustomers(customerQuery)}
                        disabled={busy}
                      >
                        Cari
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Dataset customer</Label>
                      <Select
                        items={datasetCustomerItems}
                        value={activeDatasetCustomerId || null}
                        disabled={!datasetCustomers.length}
                        onValueChange={(value) => {
                          if (value) setSelectedDatasetCustomer(String(value));
                        }}
                      >
                        <SelectTrigger className="!h-11 w-full rounded-full bg-background px-4">
                          <SelectValue placeholder="Pilih customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {datasetCustomers.map((customer) => (
                            <SelectItem value={customer.dataset_customer_id} key={customer.dataset_customer_id}>
                              {customer.display_customer_id} - {customer.country} - {customer.cluster_label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCustomer ? (
                      <div className="grid grid-cols-3 divide-x divide-border rounded-[var(--radius-card)] border border-border">
                        <div className="p-3">
                          <span className="block text-xs text-muted-foreground">Purchases</span>
                          <strong className="mt-1 block text-sm text-primary">{selectedCustomer.purchase_invoices}</strong>
                        </div>
                        <div className="p-3">
                          <span className="block text-xs text-muted-foreground">Cancels</span>
                          <strong className="mt-1 block text-sm text-primary">
                            {selectedCustomer.cancellation_invoices}
                          </strong>
                        </div>
                        <div className="p-3">
                          <span className="block text-xs text-muted-foreground">Spend</span>
                          <strong className="mt-1 block break-words text-sm text-primary">
                            {currency(selectedCustomer.total_spend)}
                          </strong>
                        </div>
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      className="h-11 w-full rounded-full"
                      variant="outline"
                      onClick={() => activateExistingCustomer(activeDatasetCustomerId)}
                      disabled={!activeDatasetCustomerId || busy}
                    >
                      <Users size={16} aria-hidden="true" />
                      Gunakan Customer Dataset
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label className="text-muted-foreground">Transaction type</Label>
              <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as "purchase" | "cancel")}>
                <TabsList className="relative grid w-full grid-cols-2 rounded-full bg-secondary p-1 group-data-horizontal/tabs:h-auto">
                  <TabsIndicator />
                  <TabsTrigger
                    className="relative z-10 h-10 rounded-full transition-colors duration-300 data-active:!bg-transparent data-active:![color:var(--primary-foreground)]"
                    value="purchase"
                  >
                    <ShoppingCart size={15} aria-hidden="true" />
                    Purchase
                  </TabsTrigger>
                  <TabsTrigger
                    className="relative z-10 h-10 rounded-full transition-colors duration-300 data-active:!bg-transparent data-active:![color:var(--primary-foreground)]"
                    value="cancel"
                    disabled={!hasPurchaseHistory}
                    title={!hasPurchaseHistory ? "Customer harus memiliki pembelian valid terlebih dahulu" : undefined}
                  >
                    <Undo2 size={15} aria-hidden="true" />
                    Cancel
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {!hasPurchaseHistory ? (
                <p className="text-xs leading-5 text-muted-foreground">
                  Cancel tersedia setelah customer memiliki pembelian valid.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground" htmlFor="transaction-date">
                Transaction date
              </Label>
              <DatePicker
                id="transaction-date"
                value={transactionDate}
                max={today}
                onChange={setTransactionDate}
                placeholder="Pilih tanggal transaksi"
              />
            </div>

            {transactionType === "cancel" ? (
              <Alert className="border-accent/30 bg-secondary/60">
                <AlertDescription>
                  Produk di cart akan dicatat sebagai pembatalan. Quantity disimpan negatif dan menambah Cancel
                  Frequency.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">
                {transactionType === "cancel" ? "Cancellation value" : "Total"}
              </span>
              <strong className="text-2xl font-semibold text-primary">{currency(total)}</strong>
            </div>

            <Button className="h-11 w-full rounded-full" onClick={checkout} disabled={!cart.length || !transactionDate || busy}>
              <PackageCheck size={17} aria-hidden="true" />
              {busy
                ? "Memproses..."
                : transactionType === "cancel"
                  ? "Simpan Cancel & Prediksi"
                  : "Checkout & Prediksi"}
            </Button>
            {!busy && (!cart.length || !transactionDate) ? (
              <p className="text-center text-xs leading-5 text-muted-foreground">
                {!cart.length
                  ? "Tambahkan minimal satu produk ke cart untuk checkout."
                  : "Pilih tanggal transaksi untuk melanjutkan."}
              </p>
            ) : null}
            {result ? (
              <Link className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full rounded-full")} href="/segment">
                Lihat Segmentasi {result.segment.cluster_label}
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Kosongkan cart?"
        description="Semua produk di cart akan dihapus. Kamu bisa menambahkannya lagi dari katalog."
        confirmLabel="Ya, kosongkan"
        cancelLabel="Batal"
        destructive
        onConfirm={clearCart}
      />
    </div>
  );
}
