import type { ReactElement } from 'react';
import { Button } from '../src/components/button';
import { Input } from '../src/components/form';
import { Dialog } from '../src/components/overlay';

export const demos: Record<string, () => ReactElement> = {
  button: () => (
    <Button variant="soft" tone="primary">
      Click me
    </Button>
  ),
  input: () => <Input placeholder="you@example.com" />,
  dialog: () => (
    <Dialog trigger={<Button>Open</Button>} title="Delete project?" description="This permanently deletes the project.">
      Are you sure?
    </Dialog>
  ),
};
