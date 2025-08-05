declare module 'css-tree' {
  export function parse(content: string): any;
  export function walk(ast: any, callback: (node: any) => void): void;
  export function generate(node: any): string;
} 