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
  date: string;
}

export interface ILocation {
  id: string;
  name: string;
}

export interface IQuestion {
  id: string;
  answerId?: string;
  surveyKey: string;
  title: string;
  subtitle?: string;
  type: string;
  order: int;
  isLocked: boolean;
  maxAnswerCount?: int;
  answers: IAnswer[];
  createdAt?: string;
  lastUpdatedAt?: string;
}

export interface IAnswer {
  id: string;
  title: string;
  order: int;
  specifyAnswer: boolean;
  subQuestionsRelated: boolean;
  questions?: IQuestion[];
  conditionalView?: IConditionalView;
  createdAt?: string;
  lastUpdatedAt?: string;
}

export interface IConditionalView {
  text: string;
  link: IConditionalViewLink;
}

export interface IConditionalViewLink {
  text: string;
  url: string;
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
  docId: string;
  scopes: string[];
  packageDocId?: string;
  survey: ISurvey;
}

export interface ILink {
  acceptResponses: boolean;
  linkId: string;
  locationDocId: string;
  package: IPackage | IPackage[];
  survey: ISurveys;
  docId: string;
  description?: string;
  responses?: any[];
  createdAt?: string;
  deletedAt?: string;
}

export interface IError {
  code: string;
  message: string;
  name: string;
}

export interface IMine {
  imageUrl?: string;
  name?: string;
  packages?: IPackage[];
  mineId?: string;
  scopes?: string[];
  featureImageUrl?: string;
  description?: string;
  address?: string;
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
  jobTitle?: string;
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
