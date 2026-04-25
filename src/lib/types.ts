export type UserProfile = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  headline?: string;
  skills: string[];
  interests: string[];
  goal?: string;
  lookingFor?: string[];
  company?: string;
  college?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  createdAt?: number;
  updatedAt?: number;
};

export type Connection = {
  id: string;
  ownerId: string;
  peerId: string;
  peerSnapshot: Pick<UserProfile, "id" | "name" | "photoURL" | "headline" | "skills" | "interests">;
  matchScore?: number;
  matchReasons?: string[];
  icebreakers?: string[];
  metAt?: string;
  createdAt: number;
};

export type IcebreakerResponse = {
  matchScore: number;
  matchReasons: string[];
  icebreakers: string[];
  whatToAvoid?: string;
  collabIdea?: string;
};

export type FollowUpMessage = {
  peerId: string;
  peerName: string;
  message: string;
};
