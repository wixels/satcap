type publisher = {
  authUid: string;
  email?: string;
  name: string;
};

export interface IResource {
  createdAt: string;
  description: string;
  featureImageUrl: string;
  packageDocId: string;
  title: string;
  url: string;
  visibility: string;
  type: string;
  publishedBy?: publisher;
  docId: string;
}
export interface INotice {
  createdAt: string;
  description: string;
  featureImageUrl: string;
  packageDocId: string;
  title: string;
  url: string;
  visibility: string;
  type: string;
  publishedBy?: publisher;
  docId: string;
}

export interface ILocation {
  id: string;
  name: string;
}

export interface ISurvey {
  description?: string;
  key: string;
  title: string;
}

export interface ISurveys {
  key: string;
  title: string;
  surveys: ISurvey[] | ISurvey;
}
export interface IPackage {
  name: string;
  packageId: string;
  scopes: string[];
  packageDocId?: string;
  survey: ISurveys;
}

export interface ILink {
  acceptResponses: boolean;
  linkId: string;
  locationDocId: string;
  package: IPackage[] | IPackage;
  survey: ISurveys;
  docId: string;
  description?: string;
}

export interface IError {
  code: string;
  message: string;
  name: string;
}

export interface IMine {
  imageUrl: string;
  name: string;
  packages: IPackage[];
  mineId?: string;
}

export interface IUser {
  authUid?: string;
  email: string;
  isAdmin: boolean;
  locationAdmin: string[];
  mineId: string | null;
  name: string;
  docId?: string;
  mobile?: string;
}

type status = 'open' | 'resolved' | 'archived';
export interface IDiscussion {
  contact: string;
  createdAt: string;
  description?: string;
  image?: string;
  isAnonymous: boolean;
  linkDocId: string;
  locationDocId: string;
  mineDocId: string;
  name: string;
  status: status;
  title: string;
  userRef: string;
  docId: string;
  publishedBy?: publisher;
}
