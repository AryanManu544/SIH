import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { QrCode, CheckCircle, AlertTriangle, Loader2, RefreshCcw } from "lucide-react";

import { useBlockchainQRScanner, ConsumerProduct } from "../hooks/useBlockchainQRScanner";

export function ConsumerExperience() {
  const { isScanning, scanResult, error, scanAndVerify, clearResult } = useBlockchainQRScanner();
  const [scanHistory, setScanHistory] = useState<ConsumerProduct[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProduct, setSelectedProduct] = useState<ConsumerProduct | null>(null);

  /** Demo / Mock scan */
  const handleDemoScan = async () => {
    const res = await scanAndVerify(undefined, true);
    if (res.success && res.data) {
      const product: ConsumerProduct = res.data;
      setSelectedProduct(product);
      setScanHistory((prev) => [product, ...prev.slice(0, 4)]);
      setActiveTab("overview");
    }
  };

  /** Manual / real QR scan */
  const handleScan = async () => {
    if (!manualCode.trim()) return alert("Enter a QR code / Product ID");
    const res = await scanAndVerify(manualCode.trim(), false);
    if (res.success && res.data) {
      const product: ConsumerProduct = res.data;
      setSelectedProduct(product);
      setScanHistory((prev) => [product, ...prev.slice(0, 4)]);
      setActiveTab("overview");
    }
  };

  /** Clear all results */
  const handleClear = () => {
    clearResult();
    setSelectedProduct(null);
    setManualCode("");
    setActiveTab("overview");
  };

  /** Helper functions */
  const getStatusColor = (status?: ConsumerProduct["status"]) => {
    switch (status) {
      case "verified":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "authentic":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "suspicious":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status?: ConsumerProduct["status"]) => {
    switch (status) {
      case "verified":
      case "authentic":
        return <CheckCircle className="w-4 h-4" />;
      case "suspicious":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const currentProduct: ConsumerProduct | null = selectedProduct || scanResult || null;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Scanner Controls */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-6 h-6" /> Consumer Product Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter QR code / Product ID"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-xl"
            />
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? <Loader2 className="animate-spin" /> : "Scan"}
            </Button>
            <Button variant="outline" onClick={handleDemoScan}>
              Demo
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RefreshCcw className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {/* Results */}
          {currentProduct && (
            <div className="space-y-4 mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="rounded-xl mb-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="certs">Certifications</TabsTrigger>
                  <TabsTrigger value="auth">Authenticity</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview">
                  <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Product Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p><strong>ID:</strong> {currentProduct.productId}</p>
                      <p><strong>Name:</strong> {currentProduct.productName}</p>
                      <p><strong>Category:</strong> {currentProduct.category}</p>
                      <p><strong>Origin:</strong> {currentProduct.origin}</p>
                      {currentProduct.farmer && <p><strong>Farmer:</strong> {currentProduct.farmer}</p>}
                      {currentProduct.harvestDate && <p><strong>Harvest Date:</strong> {currentProduct.harvestDate}</p>}
                      {currentProduct.labTested !== undefined && <p><strong>Lab Tested:</strong> {currentProduct.labTested ? "Yes" : "No"}</p>}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Certifications */}
                <TabsContent value="certs">
                  <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentProduct.certifications?.length ? (
                        <ul className="list-disc pl-5">
                          {currentProduct.certifications.map((cert, idx) => (
                            <li key={idx}>{cert}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No certifications found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Authenticity */}
                <TabsContent value="auth">
                  <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Authenticity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentProduct.isAuthentic ? (
                        <p className="text-green-600 font-semibold">
                          ✅ Product verified on blockchain
                        </p>
                      ) : (
                        <p className="text-red-600 font-semibold">
                          ❌ Product not verified
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Scan History */}
              {scanHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Recent Scans</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scanHistory.map((p, idx) => (
                      <Badge
                        key={idx}
                        className={`px-2 py-1 rounded border ${getStatusColor(p.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(p.status)}
                        <span className="text-sm">{p.productName}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}