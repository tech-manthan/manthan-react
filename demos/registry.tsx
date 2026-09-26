import type { ReactElement } from 'react';
import { Button } from '../src/components/button';

export const demos: Record<string, () => ReactElement> = {
  button: () => (
    <Button variant="soft" tone="primary">
      Click me
    </Button>
  ),
};
