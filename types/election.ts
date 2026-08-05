export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMINISTRATOR' 
  | 'ELECTION_OFFICER' 
  | 'POLLING_UNIT_AGENT' 
  | 'FIELD_AGENT';

export interface ElectoralLocation {
  stateId: string;
  senatorialDistrictId?: string;
  lgaId?: string;
  federalConstituencyId?: string;
  stateConstituencyId?: string;
  wardId?: string;
  pollingUnitId?: string;
}

export type IncidentCategory =
  | 'VIOLENCE'
  | 'BALLOT_BOX_SNATCHING'
  | 'VOTE_BUYING'
  | 'VOTER_INTIMIDATION'
  | 'OVER_VOTING'
  | 'UNDER_AGE_VOTING'
  | 'POLLING_UNIT_NOT_OPEN'
  | 'LATE_ARRIVAL_OFFICIALS'
  | 'EQUIPMENT_FAILURE'
  | 'BVAS_FAILURE'
  | 'SECURITY_INCIDENT'
  | 'PROTEST'
  | 'WEATHER_DISRUPTION'
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface CandidateVote {
  candidateId: string;
  partyAcronym: string;
  candidateName: string;
  voteCount: number;
}

export interface PollingUnitResult {
  id: string;
  pollingUnitCode: string;
  pollingUnitName: string;
  electionId: string;
  candidateVotes: CandidateVote[];
  rejectedVotes: number;
  totalAccreditedVoters: number;
  totalVotesCast: number;
  status: 'DRAFT' | 'PUBLISHED';
  submissionTimestamp: string;
  locationCoordinates: {
    latitude: number;
    longitude: number;
  };
  mediaAttachments: string[];
}