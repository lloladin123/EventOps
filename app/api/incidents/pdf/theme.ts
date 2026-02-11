import { rgb } from "pdf-lib";

export function createTheme() {
  return {
    text: rgb(0.11, 0.13, 0.16),
    muted: rgb(0.42, 0.47, 0.55),
    line: rgb(0.87, 0.89, 0.92),
    card: rgb(0.97, 0.97, 0.98),
    header: rgb(0.07, 0.09, 0.12),
    white: rgb(1, 1, 1),

    // used in original header/footer as inline rgb(...) values
    headerMeta: rgb(0.8, 0.82, 0.86),
    footer: rgb(0.55, 0.6, 0.67),
  };
}

export type Theme = ReturnType<typeof createTheme>;
