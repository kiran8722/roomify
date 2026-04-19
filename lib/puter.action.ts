import puter from "@heyputer/puter.js";
import {getOrCreateHostingConfig, uploadImagetoHoisting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

const PROJECT_KEY_PREFIX = "roomify:project:";

const getProjectKey = (projectId: string) => `${PROJECT_KEY_PREFIX}${projectId}`;

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

const resolveProjectAssets = async (
  item: DesignItem,
): Promise<DesignItem | null> => {
  const projectId = item.id;

  const payload = {
    ...item,
    sourceImage: item.sourceImage,
    renderedImage: item.renderedImage,
  };

  const hosting = await getOrCreateHostingConfig();
  const hostedSource = projectId
    ? await uploadImagetoHoisting({
        hosting,
        url: item.sourceImage,
        projectId,
        label: "source",
      })
    : null;

  const hostedRender = projectId && item.renderedImage
    ? await uploadImagetoHoisting({
        hosting,
        url: item.renderedImage,
        projectId,
        label: "rendered",
      })
    : null;

  if (hostedSource?.url) {
    payload.sourceImage = hostedSource.url;
  } else if (!item.sourceImage) {
    return null;
  }

  if (hostedRender?.url) {
    payload.renderedImage = hostedRender.url;
  } else if (item.renderedImage && isHostedUrl(item.renderedImage)) {
    payload.renderedImage = item.renderedImage;
  }

  return payload;
};

export const getProject = async (projectId: string): Promise<DesignItem | null> => {
  try {
    return (await puter.kv.get<DesignItem>(getProjectKey(projectId))) ?? null;
  } catch (error) {
    console.warn("Failed to load project", error);
    return null;
  }
};

export const saveProject = async (item: DesignItem): Promise<DesignItem | null> => {
  try {
    const payload = await resolveProjectAssets(item);
    if (!payload) {
      return null;
    }

    await puter.kv.set(getProjectKey(item.id), payload);
    return payload;
  } catch (e) {
    console.warn("Failed to save project", e);
    return item.sourceImage ? item : null;
  }
};

export const createProject = async ({item }:  CreateProjectParams):
Promise<DesignItem | null | undefined> => {
  return await saveProject(item);
};
