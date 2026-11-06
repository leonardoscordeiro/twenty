import { type CentralCampaign } from '@/central/utils/centralCampaigns';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlFields } from 'twenty-shared/types';

const CAMPAIGN_GQL_FIELDS: RecordGqlFields = {
  id: true,
  name: true,
  subject: true,
  status: true,
  createdAt: true,
  scheduledAt: true,
  sentAt: true,
  sentCount: true,
  deliveredCount: true,
  failedCount: true,
  bouncedCount: true,
  uniqueOpenCount: true,
  uniqueClickCount: true,
  list: { id: true, name: true },
};

export const useCentralCampaigns = () => {
  const { records, loading } = useFindManyRecords<
    CentralCampaign & { __typename: string }
  >({
    objectNameSingular: 'messageCampaign',
    recordGqlFields: CAMPAIGN_GQL_FIELDS,
    orderBy: [{ createdAt: 'DescNullsLast' }],
  });

  return { campaigns: records, loading };
};
