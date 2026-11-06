import { type CentralActivity } from '@/central/types/CentralActivity';
import {
  getCentralPlaybookTitle,
  isCentralPlaybookNote,
  searchCentralNotes,
} from '@/central/utils/centralNotes';

const note = (overrides: Partial<CentralActivity>): CentralActivity => ({
  id: 'id',
  title: null,
  dueAt: null,
  status: null,
  bodyMarkdown: null,
  companyId: null,
  companyName: null,
  ...overrides,
});

describe('centralNotes', () => {
  it('recognises playbook notes by title', () => {
    expect(
      isCentralPlaybookNote(note({ title: getCentralPlaybookTitle('V8') })),
    ).toBe(true);
    expect(isCentralPlaybookNote(note({ title: 'Reunião' }))).toBe(false);
  });

  it('finds the term in the body and splits the snippet around it', () => {
    const [result] = searchCentralNotes(
      [note({ title: 'Infra', bodyMarkdown: 'Proxy com Transform Rule' })],
      'transform',
    );

    expect(result.before).toBe('Proxy com ');
    expect(result.match).toBe('Transform');
    expect(result.after).toBe(' Rule');
  });

  it('matches titles and ignores blank queries', () => {
    const notes = [note({ title: 'Supabase', bodyMarkdown: 'Projeto' })];

    expect(searchCentralNotes(notes, 'supa')).toHaveLength(1);
    expect(searchCentralNotes(notes, '  ')).toEqual([]);
    expect(searchCentralNotes(notes, 'nada')).toEqual([]);
  });
});
