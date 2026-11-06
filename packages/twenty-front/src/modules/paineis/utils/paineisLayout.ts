export const PAINEIS_BLOCK_IDS = [
  'receita',
  'custo',
  'margem',
  'pipeline',
  'vencimentos',
  'acessos',
] as const;

export type PaineisBlockId = (typeof PAINEIS_BLOCK_IDS)[number];

export type PaineisLayout = {
  order: PaineisBlockId[];
  hidden: PaineisBlockId[];
};

export const DEFAULT_PAINEIS_LAYOUT: PaineisLayout = {
  order: [...PAINEIS_BLOCK_IDS],
  hidden: [],
};

const LAYOUT_STORAGE_KEY = 'paineis.negocio.layout';

const isBlockId = (value: unknown): value is PaineisBlockId =>
  PAINEIS_BLOCK_IDS.includes(value as PaineisBlockId);

// Unknown ids are dropped and new blocks appended, so a stored layout survives block changes.
export const normalizeLayout = (value: unknown): PaineisLayout => {
  const stored = (value ?? {}) as { order?: unknown; hidden?: unknown };
  const order = Array.isArray(stored.order)
    ? [...new Set(stored.order.filter(isBlockId))]
    : [];
  const hidden = Array.isArray(stored.hidden)
    ? stored.hidden.filter(isBlockId)
    : [];

  return {
    order: [
      ...order,
      ...PAINEIS_BLOCK_IDS.filter((blockId) => !order.includes(blockId)),
    ],
    hidden: [...new Set(hidden)],
  };
};

// Storage can throw (private mode, blocked site data); the default layout then applies.
export const readLayout = (): PaineisLayout => {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);

    return raw === null
      ? DEFAULT_PAINEIS_LAYOUT
      : normalizeLayout(JSON.parse(raw));
  } catch {
    return DEFAULT_PAINEIS_LAYOUT;
  }
};

export const writeLayout = (layout: PaineisLayout) => {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Layout still applies for this visit.
  }
};

export const moveBlock = (
  layout: PaineisLayout,
  blockId: PaineisBlockId,
  offset: -1 | 1,
): PaineisLayout => {
  const index = layout.order.indexOf(blockId);
  let target = index + offset;

  // Swapping with a hidden block would look like a no-op, so skip over them.
  while (layout.hidden.includes(layout.order[target])) {
    target += offset;
  }

  if (index < 0 || target < 0 || target >= layout.order.length) {
    return layout;
  }

  const order = [...layout.order];
  [order[index], order[target]] = [order[target], order[index]];

  return { ...layout, order };
};

export const toggleBlock = (
  layout: PaineisLayout,
  blockId: PaineisBlockId,
): PaineisLayout => ({
  ...layout,
  hidden: layout.hidden.includes(blockId)
    ? layout.hidden.filter((hiddenId) => hiddenId !== blockId)
    : [...layout.hidden, blockId],
});

export const getVisibleBlocks = (layout: PaineisLayout) =>
  layout.order.filter((blockId) => !layout.hidden.includes(blockId));
