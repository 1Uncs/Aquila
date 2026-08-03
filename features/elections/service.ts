import { Election, ElectionCycle, User, PollingUnit, PoliticalParty, Candidate, ResultSubmission, IncidentReport } from '@/features/auth/store';

const NIGERIA_STATES = [
  { id: 's1', name: 'Abia', code: 'AB' },
  { id: 's2', name: 'Adamawa', code: 'AD' },
  { id: 's3', name: 'Akwa Ibom', code: 'AK' },
  { id: 's4', name: 'Anambra', code: 'AN' },
  { id: 's5', name: 'Bauchi', code: 'BA' },
  { id: 's6', name: 'Bayelsa', code: 'BY' },
  { id: 's7', name: 'Benue', code: 'BE' },
  { id: 's8', name: 'Borno', code: 'BO' },
  { id: 's9', name: 'Cross River', code: 'CR' },
  { id: 's10', name: 'Delta', code: 'DE' },
  { id: 's11', name: 'Ebonyi', code: 'EB' },
  { id: 's12', name: 'Edo', code: 'ED' },
  { id: 's13', name: 'Ekiti', code: 'EK' },
  { id: 's14', name: 'Enugu', code: 'EN' },
  { id: 's15', name: 'FCT', code: 'FC' },
  { id: 's16', name: 'Gombe', code: 'GO' },
  { id: 's17', name: 'Imo', code: 'IM' },
  { id: 's18', name: 'Jigawa', code: 'JI' },
  { id: 's19', name: 'Kaduna', code: 'KD' },
  { id: 's20', name: 'Kano', code: 'KN' },
  { id: 's21', name: 'Katsina', code: 'KT' },
  { id: 's22', name: 'Kebbi', code: 'KE' },
  { id: 's23', name: 'Kogi', code: 'KO' },
  { id: 's24', name: 'Kwara', code: 'KW' },
  { id: 's25', name: 'Lagos', code: 'LA' },
  { id: 's26', name: 'Nasarawa', code: 'NA' },
  { id: 's27', name: 'Niger', code: 'NI' },
  { id: 's28', name: 'Ogun', code: 'OG' },
  { id: 's29', name: 'Ondo', code: 'ON' },
  { id: 's30', name: 'Osun', code: 'OS' },
  { id: 's31', name: 'Oyo', code: 'OY' },
  { id: 's32', name: 'Plateau', code: 'PL' },
  { id: 's33', name: 'Rivers', code: 'RI' },
  { id: 's34', name: 'Sokoto', code: 'SO' },
  { id: 's35', name: 'Taraba', code: 'TA' },
  { id: 's36', name: 'Yobe', code: 'YO' },
  { id: 's37', name: 'Zamfara', code: 'ZA' },
];

const LGAS: Array<{ id: string; name: string; stateId: string }> = [
  ...NIGERIA_STATES.slice(0, 37).flatMap((s) =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `${s.id}-lga-${i + 1}`,
      name: `${s.name} LGA ${i + 1}`,
      stateId: s.id,
    }))
  ),
];

const PARTIES: PoliticalParty[] = [
  { id: 'p1', name: 'All Progressives Congress', acronym: 'APC', code: 'APC', status: 'ACTIVE' },
  { id: 'p2', name: 'Peoples Democratic Party', acronym: 'PDP', code: 'PDP', status: 'ACTIVE' },
  { id: 'p3', name: 'Labour Party', acronym: 'LP', code: 'LP', status: 'ACTIVE' },
  { id: 'p4', name: 'New Nigeria Peoples Party', acronym: 'NNPP', code: 'NNPP', status: 'ACTIVE' },
  { id: 'p5', name: 'All Progressives Grand Alliance', acronym: 'APGA', code: 'APGA', status: 'ACTIVE' },
];

const POSITIONS = [
  { id: 'pos1', name: 'President', electoralAreaType: 'Country' },
  { id: 'pos2', name: 'Governor', electoralAreaType: 'State' },
  { id: 'pos3', name: 'Senator', electoralAreaType: 'Senatorial District' },
  { id: 'pos4', name: 'Member, House of Representatives', electoralAreaType: 'Federal Constituency' },
  { id: 'pos5', name: 'Member, State House of Assembly', electoralAreaType: 'State Constituency' },
  { id: 'pos6', name: 'Local Government Chairman', electoralAreaType: 'LGA / Area Council' },
  { id: 'pos7', name: 'Councillor', electoralAreaType: 'Ward' },
];

const POLLING_UNITS: PollingUnit[] = LGAS.slice(0, 50).flatMap((lga) =>
  Array.from({ length: 3 }, (_, i) => ({
    id: `pu-${lga.id}-${i + 1}`,
    name: `PU ${lga.name} ${i + 1}`,
    code: `PU/${lga.id.slice(-3).toUpperCase()}/${i + 1}`,
    wardId: `ward-${lga.id}`,
    wardName: `${lga.name} Ward`,
    lgaId: lga.id,
    lgaName: lga.name,
    stateId: lga.stateId,
    stateName: NIGERIA_STATES.find((s) => s.id === lga.stateId)?.name ?? '',
    latitude: 6.5 + Math.random() * 6,
    longitude: 3 + Math.random() * 7,
    status: 'ACTIVE' as const,
  }))
);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
  login: async (email: string, _password: string): Promise<User> => {
    await delay(600);
    return {
      id: 'u1',
      email,
      name: email.split('@')[0] ?? email,
      role: email.includes('admin') ? 'ADMIN' : 'FIELD_AGENT',
      assignedLocations: ['s25'],
    };
  },

  getElectionCycles: async (): Promise<ElectionCycle[]> => {
    await delay(400);
    return [
      {
        id: 'c1',
        name: '2027 General Election',
        description: 'Nigeria General Elections 2027',
        startDate: '2027-02-25',
        endDate: '2027-03-15',
        status: 'SCHEDULED',
      },
      {
        id: 'c2',
        name: '2026 Governorship - Edo',
        description: 'Edo State Governorship Election 2026',
        startDate: '2026-09-21',
        endDate: '2026-09-22',
        status: 'COMPLETED',
      },
    ];
  },

  getElections: async (_cycleId?: string): Promise<Election[]> => {
    await delay(500);
    return [
      {
        id: 'e1',
        cycleId: 'c1',
        position: 'President',
        electoralArea: 'Nigeria',
        electoralAreaType: 'Country',
        electionDate: '2027-02-25',
        status: 'SCHEDULED',
        candidateCount: 5,
      },
      {
        id: 'e2',
        cycleId: 'c1',
        position: 'Senator',
        electoralArea: 'Lagos West',
        electoralAreaType: 'Senatorial District',
        electionDate: '2027-02-25',
        status: 'SCHEDULED',
        candidateCount: 4,
      },
      {
        id: 'e3',
        cycleId: 'c1',
        position: 'Governor',
        electoralArea: 'Lagos',
        electoralAreaType: 'State',
        electionDate: '2027-02-25',
        status: 'SCHEDULED',
        candidateCount: 4,
      },
    ];
  },

  getCandidates: async (electionId: string): Promise<Candidate[]> => {
    await delay(400);
    return [
      { id: 'cand1', electionId, partyId: 'p1', partyName: 'APC', partyAcronym: 'APC', fullName: 'Adeyemi Oluwaseun', status: 'ACTIVE' },
      { id: 'cand2', electionId, partyId: 'p2', partyName: 'PDP', partyAcronym: 'PDP', fullName: 'Nwosu Chinedu', status: 'ACTIVE' },
      { id: 'cand3', electionId, partyId: 'p3', partyName: 'LP', partyAcronym: 'LP', fullName: 'Okonkwo Emeka', status: 'ACTIVE' },
      { id: 'cand4', electionId, partyId: 'p4', partyName: 'NNPP', partyAcronym: 'NNPP', fullName: 'Musa Ibrahim', status: 'ACTIVE' },
    ];
  },

  getResults: async (electionId?: string): Promise<ResultSubmission[]> => {
    await delay(500);
    const bases: ResultSubmission[] = [
      {
        id: 'r1',
        electionId: 'e1',
        pollingUnitId: 'pu-s25-lga-1-1',
        pollingUnitName: 'PU Ikeja LGA 1',
        candidateVotes: { cand1: 234, cand2: 189, cand3: 98, cand4: 45 },
        rejectedVotes: 12,
        totalAccreditedVoters: 600,
        totalVotesCast: 578,
        status: 'PUBLISHED',
        latitude: 6.6,
        longitude: 3.35,
        submittedAt: '2027-02-25T14:30:00Z',
        submittedBy: 'u2',
      },
      {
        id: 'r2',
        electionId: 'e1',
        pollingUnitId: 'pu-s25-lga-1-2',
        pollingUnitName: 'PU Ikeja LGA 2',
        candidateVotes: { cand1: 312, cand2: 256, cand3: 120, cand4: 67 },
        rejectedVotes: 8,
        totalAccreditedVoters: 780,
        totalVotesCast: 763,
        status: 'PUBLISHED',
        latitude: 6.62,
        longitude: 3.38,
        submittedAt: '2027-02-25T14:45:00Z',
        submittedBy: 'u3',
      },
      {
        id: 'r3',
        electionId: 'e1',
        pollingUnitId: 'pu-s25-lga-2-1',
        pollingUnitName: 'PU Lagos Mainland 1',
        candidateVotes: { cand1: 189, cand2: 345, cand3: 56, cand4: 23 },
        rejectedVotes: 5,
        totalAccreditedVoters: 650,
        totalVotesCast: 613,
        status: 'PUBLISHED',
        latitude: 6.5,
        longitude: 3.4,
        submittedAt: '2027-02-25T15:00:00Z',
        submittedBy: 'u2',
      },
    ];
    if (electionId) return bases.filter((r) => r.electionId === electionId);
    return bases;
  },

  getIncidents: async (electionId?: string): Promise<IncidentReport[]> => {
    await delay(400);
    const incidents: IncidentReport[] = [
      {
        id: 'i1',
        electionId: 'e1',
        pollingUnitId: 'pu-s25-lga-1-1',
        electoralArea: 'Ikeja LGA',
        category: 'VOTE_BUYING',
        severity: 'MEDIUM',
        status: 'UNDER_REVIEW',
        description: 'Suspected vote buying observed near the PU entrance',
        latitude: 6.6,
        longitude: 3.35,
        mediaUrls: [],
        reportedBy: 'u2',
        reportedAt: '2027-02-25T12:15:00Z',
      },
      {
        id: 'i2',
        electionId: 'e1',
        electoralArea: 'Lagos Mainland',
        category: 'BVAS_FAILURE',
        severity: 'HIGH',
        status: 'RESOLVED',
        description: 'BVAS device malfunction at 2 polling units',
        mediaUrls: [],
        reportedBy: 'u3',
        reportedAt: '2027-02-25T10:30:00Z',
      },
    ];
    if (electionId) return incidents.filter((i) => i.electionId === electionId);
    return incidents;
  },

  getStates: async () => {
    await delay(300);
    return NIGERIA_STATES;
  },

  getLgas: async (stateId?: string) => {
    await delay(300);
    const filtered = stateId ? LGAS.filter((l) => l.stateId === stateId) : LGAS;
    return filtered.slice(0, 20);
  },

  getPollingUnits: async (lgaId?: string) => {
    await delay(300);
    const filtered = lgaId ? POLLING_UNITS.filter((p) => p.lgaId === lgaId) : POLLING_UNITS;
    return filtered.slice(0, 15);
  },

  getParties: async (): Promise<PoliticalParty[]> => {
    await delay(300);
    return PARTIES;
  },

  getPositions: async () => {
    await delay(300);
    return POSITIONS;
  },
};
