import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { routerFuture } from '../routerFuture';

/** Renders a component inside a router, starting at the given path. */
export function renderWithRouter(ui: ReactElement, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      {ui}
    </MemoryRouter>,
  );
}
