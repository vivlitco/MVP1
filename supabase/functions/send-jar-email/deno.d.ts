// Type stubs so VS Code/tsserver can typecheck this Deno edge function.
// Runtime is Deno (Supabase Edge Functions); these are only for editor tooling.

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare module "std/http/server.ts" {
  export type Handler = (req: Request) => Response | Promise<Response>;
  export function serve(handler: Handler): void;
}

declare module "@supabase/supabase-js" {
  // Minimal surface area used by this function.
  export function createClient(
    supabaseUrl: string,
    supabaseAnonKey: string,
    options?: {
      global?: {
        headers?: Record<string, string>;
      };
    }
  ): {
    auth: {
      getUser(): Promise<{ data: { user: { id: string } | null }; error: unknown }>;
    };
    from(table: string): {
      select(columns: string): any;
      insert(data: any): Promise<{ data: any; error: unknown }>;
      eq(column: string, value: string): any;
      maybeSingle(): Promise<{ data: any; error: unknown }>;
    };
  };
}
