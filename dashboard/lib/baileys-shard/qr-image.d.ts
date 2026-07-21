declare module "qr-image" {
  interface ImageOptions {
    type?: "png" | "svg" | "pdf" | "eps";
    size?: number;
    margin?: number;
    ec_level?: "L" | "M" | "Q" | "H";
  }
  function imageSync(text: string, options?: ImageOptions): Buffer;
  function image(text: string, options?: ImageOptions): NodeJS.ReadableStream;
  export { imageSync, image };
}
