/**
 * Shared content model for the two handbooks.
 *
 * The handbooks are long-form documents, not UI screens, so the content lives
 * in `src/i18n/` next to the other translation tables and the pages only render
 * it. Both the public handbook (`/handbook`) and the internal manual
 * (`/admin/handbook`) use the same block vocabulary so the renderers stay
 * interchangeable.
 */

export type HandbookBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  /** Callout — used for the things a reader must not miss. */
  | { type: "note"; text: string }
  /** Numbered walkthrough; the renderer supplies the numbering. */
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "links"; items: { href: string; label: string }[] };

export type HandbookSection = {
  /** Anchor id — also the key the table of contents links to. */
  id: string;
  /** Short label for the table of contents. */
  nav: string;
  h: string;
  blocks: HandbookBlock[];
};

export type HandbookDoc = {
  back: string;
  title: string;
  subtitle: string;
  updated: string;
  contents: string;
  intro: string;
  printLabel: string;
  sections: HandbookSection[];
};
