import { type CentralCompany } from '@/central/types/CentralCompany';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const LIST_ITEM_REGEX = /^\s*(?:[-*]|\d+\.)\s+(.*)$/;

export const getPlaybookNote = (company: CentralCompany) => {
  const notes = company.noteTargets
    .map((noteTarget) => noteTarget.note)
    .filter(isDefined);

  return (
    notes.find((note) => note.title?.startsWith('Playbook')) ?? notes.at(0)
  );
};

export const getPlaybookRules = (markdown: string | null | undefined) =>
  (markdown ?? '')
    .split('\n')
    .map((line) => LIST_ITEM_REGEX.exec(line)?.[1])
    .filter(isNonEmptyString)
    .map((item) => item.replace(/\*\*|__|`/g, '').replace(/\\(.)/g, '$1'))
    .slice(0, 5);
