import {
  getCentralPersonName,
  getCentralPersonPhone,
  getPrimaryContact,
  getWhatsAppUrl,
} from '@/central/utils/centralPeople';

describe('centralPeople', () => {
  it('falls back to the first person while no papel is set', () => {
    const people = [
      { id: 'a', papel: null },
      { id: 'b', papel: null },
    ];

    expect(getPrimaryContact(people)?.id).toBe('a');
    expect(getPrimaryContact([])).toBeUndefined();
  });

  it('prefers the person marked PRINCIPAL', () => {
    const people = [
      { id: 'a', papel: 'TECNICO' },
      { id: 'b', papel: 'PRINCIPAL' },
    ];

    expect(getPrimaryContact(people)?.id).toBe('b');
  });

  it('builds names and phones only from filled values', () => {
    expect(
      getCentralPersonName({ name: { firstName: 'Felipe', lastName: null } }),
    ).toBe('Felipe');
    expect(getCentralPersonPhone({ phones: null })).toBeNull();
    expect(
      getCentralPersonPhone({
        phones: {
          primaryPhoneNumber: '51999998888',
          primaryPhoneCallingCode: '+55',
        },
      }),
    ).toBe('+55 51999998888');
  });

  it('only links WhatsApp for a plausible number', () => {
    expect(getWhatsAppUrl('+55 51999998888')).toBe(
      'https://wa.me/5551999998888',
    );
    expect(getWhatsAppUrl('123')).toBeNull();
    expect(getWhatsAppUrl(null)).toBeNull();
  });
});
