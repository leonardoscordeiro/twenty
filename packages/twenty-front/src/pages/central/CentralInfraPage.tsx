import { CentralInfraOverview } from '@/central/components/CentralInfraOverview';
import { CentralPageLayout } from '@/central/components/CentralPageLayout';

export const CentralInfraPage = () => (
  // oxlint-disable-next-line lingui/no-unlocalized-strings
  <CentralPageLayout title="Infra e custos">
    <CentralInfraOverview />
  </CentralPageLayout>
);
