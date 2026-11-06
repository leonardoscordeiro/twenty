// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  convertCurrencyAmountToCurrencyMicros,
  isDefined,
} from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

const toLocalDateString = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const useCentralRecordUpdates = () => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueToast } = useToast();
  const { objectMetadataItem: acessoMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'acesso',
  });

  // useUpdateOneRecord writes the cache optimistically and rolls it back when the mutation fails.
  const save = async (
    objectNameSingular: string,
    idToUpdate: string,
    updateOneRecordInput: Record<string, unknown>,
    successMessage: string,
  ) => {
    try {
      await updateOneRecord({
        objectNameSingular,
        idToUpdate,
        updateOneRecordInput,
        recordGqlFields: {
          id: true,
          ...Object.fromEntries(
            Object.keys(updateOneRecordInput).map((key) => [key, true]),
          ),
        },
      });
      enqueueToast({ status: 'success', children: successMessage });
    } catch {
      enqueueToast({
        status: 'error',
        children: 'Não salvou no CRM. O valor anterior voltou.',
      });
    }
  };

  const saveAmount = (
    objectNameSingular: 'company' | 'custoInfra',
    idToUpdate: string,
    amount: number | null,
  ) =>
    save(
      objectNameSingular,
      idToUpdate,
      {
        [objectNameSingular === 'company' ? 'mensalidade' : 'custoMensal']: {
          amountMicros: isDefined(amount)
            ? convertCurrencyAmountToCurrencyMicros(amount)
            : null,
          currencyCode: 'BRL',
        },
      },
      'Salvo no CRM',
    );

  const markAcessoReviewed = (acessoId: string) => {
    const now = new Date();
    const revisadoEmType = acessoMetadataItem.fields.find(
      (field) => field.name === 'revisadoEm',
    )?.type;

    return save(
      'acesso',
      acessoId,
      {
        revisadoEm:
          revisadoEmType === FieldMetadataType.DATE
            ? toLocalDateString(now)
            : now.toISOString(),
      },
      'Revisão salva no CRM',
    );
  };

  return { saveAmount, markAcessoReviewed };
};
