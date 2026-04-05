import puter from "@heyputer/puter.js";

export interface PuterUser {
  userName?: string | null;
  uuid?: string | null;
}

export const SignIn = async () => await puter.auth.signIn();
export const SignOut = () => puter.auth.signOut();

export const getCurrentUser = async (): Promise<PuterUser | null> => {
  try {
    return (await puter.getUser()) as PuterUser;
  } catch (error) {
    return null;
  }
};

