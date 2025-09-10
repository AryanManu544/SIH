import { useState } from "react";
import { blockchainService, BlockchainResponse } from "../services/blockchainService";

/** --- Types --- */
export type ProductStatus = "verified" | "authentic" | "suspicious" | "unknown";

export interface ConsumerProduct {
  productId: string;
  productName: string;
  category: string;
  origin: string;
  farmer?: string;
  harvestDate?: string;
  labTested?: boolean;
  certifications: string[];
  isAuthentic: boolean;
  status: ProductStatus;
}

/** --- Hook --- */
export function useBlockchainQRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ConsumerProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanAndVerify = async (
    code?: string,
    isDemo: boolean = false
  ): Promise<{ success: boolean; data?: ConsumerProduct }> => {
    try {
      setIsScanning(true);
      setError(null);

      // Demo product
      if (isDemo || !code) {
        const demo: ConsumerProduct = {
          productId: "DEMO123",
          productName: "Demo Product",
          category: "Demo Category",
          origin: "Demo Origin",
          certifications: ["Demo Cert"],
          isAuthentic: true,
          status: "verified",
        };
        setScanResult(demo);
        return { success: true, data: demo };
      }

      // Real backend scan
      const res: BlockchainResponse<{ productId: string; isAuthentic: boolean }> =
        await blockchainService.verifyProduct(code);

      if (!res.success || !res.data) {
        setError(res.message || "Product not found or invalid QR code");
        return { success: false };
      }

      // Map backend data into ConsumerProduct
      const product: ConsumerProduct = {
        productId: res.data.productId,
        productName: "Unknown Product", // fallback
        category: "Unknown Category",   // fallback
        origin: "Unknown Origin",       // fallback
        certifications: [],
        isAuthentic: res.data.isAuthentic,
        status: res.data.isAuthentic ? "verified" : "suspicious",
      };

      setScanResult(product);
      return { success: true, data: product };
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error occurred");
      return { success: false };
    } finally {
      setIsScanning(false);
    }
  };

  const clearResult = () => {
    setScanResult(null);
    setError(null);
  };

  return { isScanning, scanResult, error, scanAndVerify, clearResult };
}
