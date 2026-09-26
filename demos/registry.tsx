import type { ReactElement } from 'react';
import { Button } from '../src/components/button';
import { Input } from '../src/components/form';

export const demos: Record<string, () => ReactElement> = {
  button: () => (
    <Button variant="soft" tone="primary">
      Click me
    </Button>
  ),
  input: () => <Input placeholder="you@example.com" />,
};
