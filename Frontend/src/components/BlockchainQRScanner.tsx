// Frontend/src/components/BlockchainQRScanner.tsx
import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { useBlockchainQRScanner } from '../hooks/useBlockchainQRScanner';

export const BlockchainQRScanner = () => {
  const { isScanning, scanResult, scanAndVerify, clearResult } = useBlockchainQRScanner();
  const [demoMode, setDemoMode] = useState(false);

  const handleScan = async (qrValue?: string) => {
    if (demoMode) {
      // Run demo (mock scan data)
      await scanAndVerify(); 
    } else if (qrValue) {
      // Real blockchain scan
      await scanAndVerify(qrValue);
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-md border bg-white">
      <h2 className="text-lg font-bold mb-2">Blockchain QR Scanner</h2>

      {/* Toggle demo vs real */}
      <button
        className="px-4 py-2 mb-3 rounded bg-blue-500 text-white"
        onClick={() => setDemoMode(!demoMode)}
      >
        {demoMode ? "Switch to Real Scan" : "Switch to Demo Scan"}
      </button>

      {!demoMode && (
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              handleScan(result.getText());
            }
            if (!!error) {
              console.error(error);
            }
          }}
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%" }}
        />
      )}

      {isScanning && <p className="text-gray-500 mt-2">⏳ Scanning...</p>}

      {scanResult && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h3 className="font-semibold">{scanResult.name || scanResult.productName}</h3>
          <p>ID: {scanResult.id || scanResult.productId}</p>
          <p>Authenticity: {scanResult.authenticity || (scanResult.isAuthentic ? "✅ Authentic" : "❌ Fake")}</p>
          <p>Origin: {scanResult.origin?.location || scanResult.origin}</p>

          <button
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
            onClick={clearResult}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};