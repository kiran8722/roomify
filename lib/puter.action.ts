import puter from "@heyputer/puter.js";
import {getOrCreateHostingConfig, uploadImagetoHoisting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

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

export const createProject = async ({item }:  CreateProjectParams):
Promise<DesignItem | null | undefined> => {
  const projectId = item.id;

  const payload = {
    ...item,
    sourceImage: item.sourceImage,
    renderedImage: item.renderedImage,
  };

  try {
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
  } catch (e) {
    console.warn("Failed to create project", e);
    return item.sourceImage ? payload : null;
  }
};
