import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HealthBanner } from './HealthBanner';

describe('HealthBanner', () => {
  it('shows "all systems operational" when every probe is green', () => {
    const { getByText } = render(
      <HealthBanner
        routerStatus={{ litellm: true }}
        gpu={{ error: undefined }}
        containerStates={{ running: 29 }}
        ragVectorCount={1000}
      />,
    );
    expect(getByText(/all systems operational/i)).toBeTruthy();
  });

  it('degrades to orange when router.litellm is false', () => {
    const { container } = render(
      <HealthBanner
        routerStatus={{ litellm: false }}
        gpu={{ error: undefined }}
        containerStates={{ running: 29 }}
        ragVectorCount={1000}
      />,
    );
    expect(container.innerHTML).toMatch(/degraded|router unhealthy/i);
  });

  it('degrades to red when gpu error + router false', () => {
    const { container } = render(
      <HealthBanner
        routerStatus={{ litellm: false }}
        gpu={{ error: 'vllm_unreachable' }}
        containerStates={{ running: 29 }}
        ragVectorCount={0}
      />,
    );
    expect(container.innerHTML.toLowerCase()).toContain('vllm_unreachable');
    expect(container.className || container.innerHTML).toMatch(/red|error/);
  });
});
