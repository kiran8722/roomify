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

  const hosting =  await getOrCreateHostingConfig();
  const hostedSource = projectId ?
      await uploadImagetoHoisting({hosting, url:item.sourceImage, projectId,label:'source',}) : null;

  const hostedRender = projectId && item.renderedImage ?
      await uploadImagetoHoisting({hosting, url:item.renderedImage, projectId,label:'rendered',}) : null;

  const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
  ? item.sourceImage
  : ''
  );

  if(!resolvedSource){
    console.warn('Failed to host source image,skipped saving');
    return null;
  }
  const resolvedRender = hostedRender?.url
      ? hostedRender?.url
      : item.renderedImage && isHostedUrl(item.renderedImage)
          ? item.renderedImage
          : undefined;

  const {
    sourcePath: _sourcePath,
    renderedPath: _renderedPath,
    publicPath: _publicPath,
    ...rest
  } = item;

  const payload = {
    ...rest,
    sourceImage: resolvedSource,
    renderedImage: resolvedRender,
  }

  try {
    return payload;


  }
  catch (e){
  console.warn('Failed to create project',e);
  return null;
  }
}

