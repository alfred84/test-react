import { getClientFullName } from './Client';

describe('Client.getClientFullName', () => {
  it('joins first and last name with a space', () => {
    expect(getClientFullName({ firstName: 'Allen', lastName: 'Rivel Villalobos' })).toBe(
      'Allen Rivel Villalobos',
    );
  });

  it('trims surrounding whitespace when one part is empty', () => {
    expect(getClientFullName({ firstName: 'Allen', lastName: '' })).toBe('Allen');
    expect(getClientFullName({ firstName: '', lastName: 'Villalobos' })).toBe('Villalobos');
  });
});
