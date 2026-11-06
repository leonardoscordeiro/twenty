import {
  DEFAULT_PAINEIS_LAYOUT,
  getVisibleBlocks,
  moveBlock,
  normalizeLayout,
  toggleBlock,
} from '@/paineis/utils/paineisLayout';

describe('paineisLayout', () => {
  it('drops unknown ids and appends missing blocks', () => {
    const layout = normalizeLayout({
      order: ['acessos', 'antigo', 'acessos'],
      hidden: ['receita', 'antigo'],
    });

    expect(layout.order[0]).toBe('acessos');
    expect(layout.order).toHaveLength(DEFAULT_PAINEIS_LAYOUT.order.length);
    expect(layout.hidden).toEqual(['receita']);
  });

  it('falls back to the default for garbage', () => {
    expect(normalizeLayout('x')).toEqual(DEFAULT_PAINEIS_LAYOUT);
  });

  it('moves past hidden blocks and stops at the edges', () => {
    const layout = toggleBlock(DEFAULT_PAINEIS_LAYOUT, 'custo');
    const moved = moveBlock(layout, 'receita', 1);

    expect(getVisibleBlocks(moved).slice(0, 2)).toEqual(['margem', 'receita']);
    expect(moveBlock(layout, 'receita', -1)).toBe(layout);
  });

  it('hides and shows a block', () => {
    const hidden = toggleBlock(DEFAULT_PAINEIS_LAYOUT, 'pipeline');

    expect(getVisibleBlocks(hidden)).not.toContain('pipeline');
    expect(getVisibleBlocks(toggleBlock(hidden, 'pipeline'))).toContain(
      'pipeline',
    );
  });
});
