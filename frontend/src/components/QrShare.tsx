import { QRCodeSVG } from 'qrcode.react';

interface QrShareProps {
  url: string;
  label?: string;
}

export function QrShare({ url, label = 'Scan to join' }: QrShareProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-5 bg-white rounded-2xl shadow-card border border-surface-border">
        <QRCodeSVG value={url} size={180} level="M" />
      </div>
      <p className="text-ink-muted text-sm font-medium">{label}</p>
      <code className="text-xs text-accent bg-accent-soft px-3 py-1.5 rounded-lg break-all text-center max-w-full font-mono">
        {url}
      </code>
    </div>
  );
}
