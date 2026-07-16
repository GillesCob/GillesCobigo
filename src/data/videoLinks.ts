export interface IVideoLink {
  label: string;
  videoUrl: string;
}

const VIDEOS_BASE_URL = "https://videos-api.gillescobigo.com";

// Le token de route (clé de cet objet, utilisé dans /v/:token) est volontairement plus court que le nom
// de fichier stocké sur le VPS : c'est ce token-là qui part dans les messages de prospection.
export const videoLinks: Record<string, IVideoLink> = {
  svmgrxz8: {
    label: "Flux 1a - RH ESN",
    videoUrl: `${VIDEOS_BASE_URL}/6b156821-c58d-4b98-83a5-e3a6a3704017.mp4`,
  },
  L8reOUF7: {
    label: "Flux 1b - RH entreprise",
    videoUrl: `${VIDEOS_BASE_URL}/c627c5f7-ac5c-4f8f-a75c-671d99e10847.mp4`,
  },
  m_NNfmx3: {
    label: "Flux 2 - CTO / Directeur technique",
    videoUrl: `${VIDEOS_BASE_URL}/db65f572-bf9a-4e97-a329-4fceb13ca1bc.mp4`,
  },
  FIdrZbyU: {
    label: "Flux 3 - Lead Dev / Tech Lead",
    videoUrl: `${VIDEOS_BASE_URL}/ac33e7d4-4341-413f-a6f0-fbbc0f6db660.mp4`,
  },
  VMSNl7hK: {
    label: "Flux 4 - Business Manager",
    videoUrl: `${VIDEOS_BASE_URL}/a548f4c8-8a39-40bf-b6a7-2c3ef5d4d55f.mp4`,
  },
};
