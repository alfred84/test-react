import { isNavItemActive, NAV_ITEMS, type NavItem } from './navItems';

const byId = (id: string): NavItem => {
  const item = NAV_ITEMS.find((n) => n.id === id);
  if (!item) throw new Error(`Unknown nav item: ${id}`);
  return item;
};

describe('isNavItemActive', () => {
  it('matches the exact path for items without a prefix', () => {
    expect(isNavItemActive(byId('home'), '/')).toBe(true);
    expect(isNavItemActive(byId('home'), '/clients')).toBe(false);
  });

  it('matches any child route for items that declare a matchPrefix', () => {
    expect(isNavItemActive(byId('clients'), '/clients')).toBe(true);
    expect(isNavItemActive(byId('clients'), '/clients/new')).toBe(true);
    expect(isNavItemActive(byId('clients'), '/clients/123/edit')).toBe(true);
    expect(isNavItemActive(byId('clients'), '/')).toBe(false);
  });
});
