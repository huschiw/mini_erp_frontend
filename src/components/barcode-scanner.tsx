"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ScanLine, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      setError(null);
      
      // Generate unique element ID
      const elementId = "barcode-scanner";
      
      // Ensure element exists
      let element = document.getElementById(elementId);
      if (!element && containerRef.current) {
        element = document.createElement("div");
        element.id = elementId;
        containerRef.current.appendChild(element);
      }

      scannerRef.current = new Html5Qrcode(elementId);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          // Successfully scanned
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        () => {
          // Error callback - ignore continuous scanning errors
        }
      );

      setIsScanning(true);
    } catch {
      setError("Failed to start camera. Please ensure camera permissions are granted.");
      setIsScanning(false);
    }
  }, [onScan, onClose, stopScanner]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => stopScanner(), 0);
      return () => clearTimeout(t);
    }

    // Small delay to ensure modal is rendered
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  return (
    <Modal open={isOpen} onClose={onClose} title="Scan Barcode">
      <div className="space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}
        
        <div
          ref={containerRef}
          id="scanner-container"
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-black"
        >
          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-zinc-400">Initializing camera...</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Position the barcode within the camera view
        </p>
      </div>
    </Modal>
  );
}

// Button component to trigger scanner
interface BarcodeScanButtonProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanButton({ onScan }: BarcodeScanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Scan barcode"
      >
        <ScanLine className="mr-2 h-4 w-4" />
        Scan
      </Button>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={onScan}
      />
    </>
  );
}
