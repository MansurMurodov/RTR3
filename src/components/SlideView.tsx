import type { CSSProperties } from "react";
import type { Slide } from "../lib/deck";

const container = { containerType: "inline-size" } as CSSProperties;
const fs = (cqw: number): CSSProperties => ({ fontSize: `${cqw}cqw` });

export default function SlideView({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  const footer = (light: boolean) => (
    <div className={`absolute inset-x-0 bottom-0 flex justify-between px-[3cqw] pb-[1.2cqw] ${light ? "text-indigo-200" : "text-slate-500"}`} style={fs(1.3)}>
      <span>FRONTEND EDU</span><span>{index + 1} / {total}</span>
    </div>
  );

  if (slide.kind === "title") {
    return (
      <div style={container} className="w-full">
        <div className="relative flex aspect-video w-full flex-col justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 p-[5cqw] text-white">
          <p className="font-semibold tracking-[0.3em] text-indigo-200" style={fs(1.6)}>FRONTEND EDU</p>
          <h2 className="mt-[2cqw] font-bold leading-tight text-white" style={fs(4.2)}>{slide.title}</h2>
          <p className="mt-[2cqw] text-indigo-100" style={fs(2.2)}>{slide.subtitle}</p>
          <p className="mt-[3cqw] text-indigo-200" style={fs(1.8)}>{slide.note}</p>
        </div>
      </div>
    );
  }

  const isEnd = slide.kind === "end";
  return (
    <div style={container} className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900">
        <div className={`px-[4cqw] py-[1.8cqw] font-bold text-white ${isEnd ? "bg-teal-600" : "bg-indigo-600"}`} style={fs(3)}>{slide.title}</div>
        <div className="px-[4cqw] pt-[2.5cqw]">
          {slide.kind === "code" ? (
            <>
              <pre className="overflow-hidden whitespace-pre-wrap rounded-lg bg-[#0b1220] p-[2cqw] font-mono leading-snug text-slate-100" style={fs(1.9)}>{slide.code}</pre>
              {slide.note && <p className="mt-[1.5cqw] text-slate-600" style={fs(1.8)}>{slide.note}</p>}
            </>
          ) : (
            <ul className="space-y-[1.4cqw]" style={fs(2.3)}>
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex gap-[1.5cqw] leading-snug">
                  <span className={`mt-[0.9cqw] inline-block h-[1cqw] w-[1cqw] shrink-0 rounded-sm ${isEnd ? "bg-teal-600" : "bg-indigo-600"}`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {footer(false)}
      </div>
    </div>
  );
}
