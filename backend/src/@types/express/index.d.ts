// backend/src/@types/express/index.d.ts
// Minimal ambient declaration: add `user` to Express Request so TypeScript stops complaining.
// Keep this file minimal and do NOT import project modules here.

declare namespace Express {
  interface Request {
    // keep this broad for now; you can narrow it later if you want
    user?: { id?: string; role?: string; [key: string]: any } | any;
  }
}

export {};
