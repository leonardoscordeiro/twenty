import { CentralAccessesOverview } from '@/central/components/CentralAccessesOverview';
import { CentralInfraOverview } from '@/central/components/CentralInfraOverview';
import { CentralNativeListLayout } from '@/central/components/CentralNativeListLayout';
import { CENTRAL_NATIVE_LISTS } from '@/central/constants/CentralNativeLists';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

type CentralNativeListObjectNamePlural =
  (typeof CENTRAL_NATIVE_LISTS.objectNamesPlural)[number];

export const isCentralNativeList = (
  objectNamePlural: string | undefined,
  searchParams: URLSearchParams,
): objectNamePlural is CentralNativeListObjectNamePlural =>
  CENTRAL_NATIVE_LISTS.objectNamesPlural.some(
    (namePlural) => namePlural === objectNamePlural,
  ) && !searchParams.has(CENTRAL_NATIVE_LISTS.tableSearchParam);

type CentralNativeListProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const CentralNativeList = ({
  objectMetadataItem,
}: CentralNativeListProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem.icon);

  return (
    <CentralNativeListLayout
      title={objectMetadataItem.labelPlural}
      icon={<Icon size={theme.icon.size.md} />}
    >
      {objectMetadataItem.namePlural === 'acessos' ? (
        <CentralAccessesOverview />
      ) : (
        <CentralInfraOverview />
      )}
    </CentralNativeListLayout>
  );
};
