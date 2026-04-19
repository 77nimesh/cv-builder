export type AuthActionState = {
  error: string | null;
  fields: {
    name?: string;
    email?: string;
  };
};

export const initialAuthActionState: AuthActionState = {
  error: null,
  fields: {},
};