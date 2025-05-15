declare module 'signature.utils' {
  export function verifySignature(
    messageHash: string,
    signature: string,
  ): boolean;
  export function hashMessage(message: string): string;
  export function generateSignature(message: string): Promise<string>;
}
