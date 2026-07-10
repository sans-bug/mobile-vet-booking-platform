import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';

describe('VetConnect landing page', () => {
  it('renders the hero content', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Smart On-Demand Pet Healthcare/i)).toBeInTheDocument();
    expect(screen.getByText(/Compassionate Care for Your/i)).toBeInTheDocument();
  });
});
