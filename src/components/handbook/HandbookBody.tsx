/**
 * Renderers shared by the public handbook (/handbook) and the internal manual
 * (/admin/handbook).
 *
 * No hooks and no client-only APIs, so the same components render inside the
 * public server tree and inside the admin client tree — the admin locale lives
 * in React context, which forces that page to be a client component.
 *
 * Both handbooks are long documents people will want on paper, so every block
 * carries `print:` variants: the table of contents and interactive chrome drop
 * out, colours flatten, and sections avoid breaking mid-heading.
 */

import Link from "next/link";
import type { HandbookBlock, HandbookSection } from "@/i18n/handbook-types";

export function HandbookToc({ sections, label }: { sections: HandbookSection[]; label: string }) {
  return (
    <nav aria-labelledby="handbook-toc-heading" className="print:hidden">
      <h2
        id="handbook-toc-heading"
        className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]"
      >
        {label}
      </h2>
      <ol className="mt-4 grid gap-1.5 text-sm">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex gap-2.5 rounded-lg px-2 py-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--pink-light)]/50 hover:text-[var(--foreground)]"
            >
              <span className="w-4 shrink-0 text-right text-xs tabular-nums text-[var(--muted)]/60">
                {index + 1}
              </span>
              <span>{section.nav}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Block({ block }: { block: HandbookBlock }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>;

    case "list":
      return (
        <ul className="grid gap-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-[var(--pink-dark)] print:bg-black"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "note":
      return (
        <p className="rounded-2xl border border-[var(--pink-dark)]/25 bg-[var(--pink-light)]/45 p-4 text-[var(--foreground)] print:border-black/40 print:bg-transparent">
          {block.text}
        </p>
      );

    case "steps":
      return (
        <ol className="grid gap-4">
          {block.items.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--pink-dark)] text-xs font-bold text-white print:bg-transparent print:text-black print:ring-1 print:ring-black"
              >
                {index + 1}
              </span>
              <span>
                <span className="block font-semibold text-[var(--foreground)]">{item.title}</span>
                <span className="mt-1 block">{item.text}</span>
              </span>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        /* Wide tables scroll inside their own container so the page body never
           scrolls sideways on a phone. */
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[22rem] border-collapse text-left align-top">
            {block.head.some((cell) => cell !== "") && (
              <thead>
                <tr>
                  {block.head.map((cell) => (
                    <th
                      key={cell}
                      scope="col"
                      className="border-b border-[var(--border)] px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-[var(--border)] last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${cell}-${cellIndex}`}
                      className={`px-1 py-2.5 align-top ${
                        cellIndex === 0 ? "font-medium text-[var(--foreground)]" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "links":
      return (
        <ul className="grid gap-2">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[var(--pink-dark)] underline decoration-[var(--pink-dark)]/40 underline-offset-4 hover:decoration-[var(--pink-dark)]"
              >
                {item.label}
              </Link>
              <span className="ml-2 text-xs text-[var(--muted)]/70">{item.href}</span>
            </li>
          ))}
        </ul>
      );
  }
}

export function HandbookSections({ sections }: { sections: HandbookSection[] }) {
  return (
    <div className="grid gap-10 text-sm leading-relaxed text-[var(--muted)] print:text-black">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24 break-inside-avoid">
          <h2 className="mb-4 text-base font-semibold text-[var(--foreground)] print:text-black">
            {section.h}
          </h2>
          <div className="grid gap-4">
            {section.blocks.map((block, index) => (
              <Block key={`${section.id}-${index}`} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
