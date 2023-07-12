declare module "colorthief" {
  type Color = [number, number, number];
  export function getColor(
    img: HTMLImageElement | Buffer | string | null
  ): Promise<Color>;
  export function getPalette(
    img: HTMLImageElement | Buffer | string | null
  ): Promise<Color[]>;
}
