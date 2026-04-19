export type AuthActionState = {
  error: string | null;
  success: string | null;
  fields: {
    name?: string;
    email?: string;
  };
};

export const initialAuthActionState: AuthActionState = {
  error: null,
  success: null,
  fields: {},
};

export type MessageActionState = {
  error: string | null;
  success: string | null;
};

export const initialMessageActionState: MessageActionState = {
  error: null,
  success: null,
};