"use client";
import { useState } from "react";
import {
  X, Download, ExternalLink, FileText, BookOpen,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
} from "lucide-react";

interface PdfViewerProps {
  src: string;
  title: string;
  type?: "pdf" | "slide";
  onClose?: () => void;
  onMarkRead?: () => void;
}

export default function PdfViewer({ src, title, type = "pdf", onClose, onMarkRead }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [marked, setMarked] = useState(false);

  const isPdf = src.toLowerCase().endsWith(".pdf") || src.includes("application/pdf") || type === "pdf";
  const Icon = type === "slide" ? BookOpen : FileText;
  const accentColor = type === "slide" ? "hsl(38 80% 40%)" : "hsl(0 72% 48%)";

  const handleMarkRead = () => {
    setMarked(true);
    onMarkRead?.();
  };

  // If we have a real URL, embed it in an iframe
  const hasUrl = src && !src.startsWith("/uploads/") === false
    ? true
    : src && src.length > 1 && !src.startsWith("blob:");

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(10, 15, 30, 0.88)",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
      animation: "fadeIn 0.2s ease",
    }}>
      {/* Modal box */}
      <div style={{
        width: "100%",
        maxWidth: 900,
        maxHeight: "90vh",
        background: "hsl(0 0% 100%)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 18px",
          borderBottom: "1px solid hsl(214 20% 90%)",
          background: "hsl(210 20% 99%)",
          flexShrink: 0,
        }}>
          <Icon size={18} style={{ color: accentColor, flexShrink: 0 }} />
          <div style={{ flex: 1, fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </div>

          {/* Zoom controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="btn btn-ghost btn-sm"
              title="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, minWidth: 42, textAlign: "center", color: "hsl(215 16% 57%)" }}>
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="btn btn-ghost btn-sm"
              title="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Action buttons */}
          <a
            href={src}
            download
            className="btn btn-outline btn-sm"
            style={{ flexShrink: 0 }}
            title="Download"
          >
            <Download size={14} /> Download
          </a>

          {!marked && (
            <button
              onClick={handleMarkRead}
              className="btn btn-primary btn-sm"
              style={{ flexShrink: 0 }}
            >
              ✓ Mark as Read
            </button>
          )}
          {marked && (
            <span className="badge badge-success" style={{ flexShrink: 0 }}>
              ✓ Read
            </span>
          )}

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: "5px", flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Document viewer area */}
        <div style={{ flex: 1, overflow: "auto", background: "hsl(215 20% 94%)", display: "flex", justifyContent: "center", padding: "20px" }}>
          {hasUrl ? (
            <iframe
              src={`${src}#toolbar=0`}
              style={{
                width: `${zoom}%`,
                minWidth: 400,
                border: "none",
                borderRadius: 8,
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                background: "white",
                height: "70vh",
                transition: "width 0.2s ease",
              }}
              title={title}
            />
          ) : (
            /* Placeholder when no actual file is uploaded yet */
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: 12,
              padding: "60px 40px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              minWidth: 400,
              height: "60vh",
            }}>
              <div style={{ fontSize: "4rem", marginBottom: 20 }}>
                {type === "slide" ? "📊" : "📄"}
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginBottom: 24, maxWidth: 320 }}>
                This document has been uploaded but preview is not available for this file type.
                Please download it to view the full content.
              </p>
              <a
                href={src}
                download
                className="btn btn-primary"
              >
                <Download size={16} /> Download to View
              </a>
              {!marked && (
                <button onClick={handleMarkRead} className="btn btn-outline" style={{ marginTop: 10 }}>
                  ✓ Mark as Read
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
