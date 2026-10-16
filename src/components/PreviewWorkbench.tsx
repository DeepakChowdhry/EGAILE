'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
export function PreviewWorkbench({ page }: { page?: string }) {
  const [device, setDevice] = useState('desktop'),
    [scale, setScale] = useState(1),
    [height, setHeight] = useState(3000);
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const width = device === 'mobile' ? 390 : 1440;
  useEffect(() => {
    const update = () => setScale(Math.min(1, (host.current?.clientWidth || width) / width));
    const observer = new ResizeObserver(update);
    if (host.current) observer.observe(host.current);
    update();
    return () => observer.disconnect();
  }, [width]);
  function measure() {
    const doc = frame.current?.contentDocument;
    if (doc) setHeight(Math.max(900, doc.documentElement.scrollHeight));
  }
  return (
    <>
      <header className="preview-toolbar">
        <strong>Private saved draft</strong>
        <label>
          Preview size{' '}
          <select value={device} onChange={(e) => setDevice(e.target.value)}>
            <option value="desktop">Desktop · 1440 px</option>
            <option value="mobile">Mobile · 390 px</option>
          </select>
        </label>
        <Link href="/admin">Return to editor ↗</Link>
        <p>Save changes in the editor before previewing. This is not the published website.</p>
      </header>
      <div ref={host} className="preview-stage">
        <div
          style={{
            height: height * scale,
            width: width * scale,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <iframe
            key={device}
            ref={frame}
            title={`${device} draft preview`}
            src={'/preview?frame=1' + (page ? '&page=' + encodeURIComponent(page) : '')}
            onLoad={measure}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 0,
              position: 'absolute',
              inset: 0,
              background: 'white',
            }}
          />
        </div>
      </div>
    </>
  );
}
