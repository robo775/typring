export type Profile = {
  avatarUrl: string | null;
  bio: string | null;
  displayName: string;
  handle: string;
  id: string;
};

export type TypeSystem = {
  code: string;
  id: string;
  name: string;
};

export type TypeValue = {
  code: string;
  id: string;
  name: string;
  typeSystemId: string;
};

