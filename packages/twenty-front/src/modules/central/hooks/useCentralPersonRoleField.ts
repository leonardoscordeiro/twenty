import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

// papel is not in the workspace schema yet; every caller must work while roleField is undefined.
export const useCentralPersonRoleField = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'person',
  });

  const roleField = objectMetadataItem.fields.find(
    (field) => field.name === 'papel' && field.isActive,
  );

  const getRoleLabel = (value: string | null | undefined) =>
    roleField?.options?.find((option) => option.value === value)?.label ?? null;

  return { roleField, roleOptions: roleField?.options ?? [], getRoleLabel };
};
