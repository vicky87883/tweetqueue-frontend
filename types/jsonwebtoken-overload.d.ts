declare module 'jsonwebtoken' {
  export type JwtPayload = Record<string, unknown>;
  export type Secret = string;

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string,
    options?: { expiresIn?: string | number }
  ): string;

  export function verify(token: string, secretOrPublicKey: string): string | JwtPayload;
}
