export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    events?: IEvent[];
    polls?: IPoll[];
    whitelist?: IWhitelistUser[];
    votes?: IVote[];
    userVotes?: IVoteRestriction[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;

  }
  
  export interface IEvent {
    id: string;
    name: string;
    description?: string;
    userId: string;
    owner?: IUser;
    polls?: IPoll[];
    whitelist?: IWhitelistUser[];
    guests?: IGuest[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;

  }
  
  export interface IPoll {
    id: string;
    eventId?: string | null;
    event?: IEvent;
    userId: string;
    owner?: IUser;
    question: string;
    description?: string;
    isPublic: boolean;
    startVoteAt: Date;
    endVoteAt: Date;
    isVoteEnd: boolean;
    banner?: string;
    publishedAt?: Date | null;
    options?: IOption[];
    whitelist?: IWhitelistUser[];
    votes?: IVote[];
    guestVotes?: IGuest[];
    voteRestrict?: IVoteRestriction[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    canEdit?: boolean;

  }
  
  export interface IOption {
    id: string;
    text: string;
    banner?: string;
    description?: string;
    pollId: string;
    poll?: IPoll;
    votes?: IVote[];
    voteRestrict?: IVoteRestriction[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;

  }
  
  export interface IWhitelistUser {
    id: string;
    userId: string;
    user?: IUser;
    eventId?: string | null;
    event?: IEvent;
    pollId?: string | null;
    poll?: IPoll;
    point: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;

  }
  
  export interface IGuest {
    id: string;
    name: string;
    key: string;
    eventId?: string | null;
    event?: IEvent;
    pollId?: string | null;
    poll?: IPoll;
    votes?: IVote[];
    guestVotes?: IVoteRestriction[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;

  }
  
  export interface IVoteRestriction {
    id: string;
    userId?: string | null;
    user?: IUser;
    guestId?: string | null;
    guest?: IGuest;
    pollId: string;
    poll?: IPoll;
    optionId: string;
    option?: IOption;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;

  }
  
  export interface IVote {
    id: string;
    pollId: string;
    poll?: IPoll;
    optionId: string;
    option?: IOption;
    userId?: string | null;
    user?: IUser;
    guestId?: string | null;
    guest?: IGuest;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;

  }
  
  export interface DataLog {
    action: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    meta: string[];
  }
  