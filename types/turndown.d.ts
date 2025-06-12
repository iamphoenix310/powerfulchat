declare module "turndown" {
  class TurndownService {
    constructor();
    turndown(html: string): string;
  }
  export = TurndownService;
}