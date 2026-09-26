import { Button } from '../src/components/button';
import { Dialog } from '../src/components/overlay';

export function DialogDemo() {
  return (
    <Dialog trigger={<Button>Open</Button>} title="Delete project?" description="This permanently deletes the project.">
      Are you sure?
    </Dialog>
  );
}
