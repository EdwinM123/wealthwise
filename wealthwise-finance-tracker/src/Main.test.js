import { render, screen } from '@testing-library/react';
import Wealthwise from './Main';

test('renders learn react link', () => {
  render(<Wealthwise />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
