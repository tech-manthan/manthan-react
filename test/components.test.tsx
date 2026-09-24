import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  createToaster,
  Dialog,
  Field,
  Input,
  Pagination,
  RadioGroup,
  Radio,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
} from '../src/index';

afterEach(cleanup);

describe('@manthan/react', () => {
  it('renders buttons from the shared recipe', () => {
    render(
      <Button variant="soft" tone="danger" loading>
        Delete
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn.className).toContain('mn-btn-soft');
    expect(btn.className).toContain('tone-danger');
    expect(btn).toHaveProperty('disabled', true);
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('wires Field label, description and error to the control', () => {
    render(
      <Field label="Email" description="Work address" error="Required" required>
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toMatch(/description .*error/);
    expect(input).toHaveProperty('required', true);
  });

  it('handles checkbox, switch and radio state', () => {
    const onChecked = vi.fn();
    const onValue = vi.fn();
    render(
      <>
        <Checkbox label="Accept" onCheckedChange={onChecked} indeterminate />
        <Switch label="Wi-Fi" defaultChecked />
        <RadioGroup defaultValue="a" onValueChange={onValue}>
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>
      </>,
    );
    const box = screen.getByLabelText('Accept') as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    fireEvent.click(box);
    expect(onChecked).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toHaveProperty('checked', true);
    fireEvent.click(screen.getByLabelText('B'));
    expect(onValue).toHaveBeenCalledWith('b');
    expect(screen.getByLabelText('B')).toHaveProperty('checked', true);
  });

  it('updates slider fill', () => {
    render(<Slider aria-label="Volume" defaultValue={20} max={200} />);
    const slider = screen.getByLabelText('Volume') as HTMLInputElement;
    expect(slider.style.getPropertyValue('--mn-fill')).toBe('10%');
    fireEvent.change(slider, { target: { value: '100' } });
    expect(slider.style.getPropertyValue('--mn-fill')).toBe('50%');
  });

  it('switches tabs with clicks and arrow keys', () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>,
    );
    const one = screen.getByRole('tab', { name: 'One' });
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Two' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Second').hidden).toBe(false);
    expect(screen.getByText('First').hidden).toBe(true);
  });

  it('opens a dialog from its trigger', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog title="Edit" trigger={<Button>Open</Button>} onOpenChange={onOpenChange}>
        Body
      </Dialog>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }));
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(false);
  });

  it('paginates', () => {
    const onPage = vi.fn();
    render(<Pagination total={10} defaultPage={5} onPageChange={onPage} />);
    expect(screen.getByRole('button', { name: 'Page 5' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPage).toHaveBeenCalledWith(6);
  });

  it('renders toasts and alerts', () => {
    const store = createToaster();
    render(
      <>
        <Toaster toaster={store} />
        <Alert tone="warning" title="Careful">
          Details
        </Alert>
        <Avatar alt="Grace Hopper" />
      </>,
    );
    act(() => {
      store.success({ title: 'Saved', description: 'All good' });
    });
    expect(screen.getByRole('status').textContent).toContain('All good');
    expect(screen.getByRole('alert').textContent).toContain('Careful');
    expect(screen.getByRole('img', { name: 'Grace Hopper' }).textContent).toBe('GH');
  });
});
