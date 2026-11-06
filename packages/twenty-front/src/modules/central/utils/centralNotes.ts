import { type CentralActivity } from '@/central/types/CentralActivity';
import { isNonEmptyString } from '@sniptt/guards';

const PLAYBOOK_TITLE_PREFIX = 'Playbook';
const SNIPPET_CONTEXT_LENGTH = 60;

export const isCentralPlaybookNote = (note: CentralActivity) =>
  note.title?.startsWith(PLAYBOOK_TITLE_PREFIX) ?? false;

export const getCentralPlaybookTitle = (companyName: string | null) =>
  `${PLAYBOOK_TITLE_PREFIX} · ${companyName ?? 'Sem cliente'}`;

export type CentralNoteMatch = {
  note: CentralActivity;
  before: string;
  match: string;
  after: string;
};

export const searchCentralNotes = (
  notes: CentralActivity[],
  query: string,
): CentralNoteMatch[] => {
  const term = query.trim().toLowerCase();

  if (!isNonEmptyString(term)) {
    return [];
  }

  return notes.flatMap((note) => {
    const body = (note.bodyMarkdown ?? '').replace(/\s+/g, ' ').trim();
    const bodyIndex = body.toLowerCase().indexOf(term);
    const titleMatches = (note.title ?? '').toLowerCase().includes(term);

    if (bodyIndex < 0 && !titleMatches) {
      return [];
    }

    if (bodyIndex < 0) {
      return [
        {
          note,
          before: body.slice(0, SNIPPET_CONTEXT_LENGTH * 2),
          match: '',
          after: '',
        },
      ];
    }

    const start = Math.max(0, bodyIndex - SNIPPET_CONTEXT_LENGTH);
    const end = bodyIndex + term.length;

    return [
      {
        note,
        before: `${start > 0 ? '…' : ''}${body.slice(start, bodyIndex)}`,
        match: body.slice(bodyIndex, end),
        after: body.slice(end, end + SNIPPET_CONTEXT_LENGTH),
      },
    ];
  });
};
