import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, Checkbox, Field, FileUpload, Input, rules, useForm } from '../src/index';

afterEach(cleanup);
const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

function SignUp({ onSubmit }: { onSubmit: (v: unknown) => void }) {
  const form = useForm({
    initialValues: { email: '', terms: false },
    rules: { email: [rules.required('Enter your email.'), rules.email()], terms: rules.required('Accept the terms.') },
    onSubmit,
  });
  return (
    <form onSubmit={form.handleSubmit}>
      <Field label="Email" error={form.errors.email}>
        <Input {...form.register('email')} />
      </Field>
      <Checkbox label="I agree" {...form.registerCheckbox('terms')} />
      {form.errors.terms && <p>{form.errors.terms}</p>}
      <Button type="submit" loading={form.submitting}>
        Send
      </Button>
    </form>
  );
}

describe('useForm', () => {
  it('validates on blur and submit, then submits valid values', async () => {
    const onSubmit = vi.fn();
    render(<SignUp onSubmit={onSubmit} />);
    const email = screen.getByLabelText('Email');
    fireEvent.change(email, { target: { value: 'nope' } });
    expect(screen.queryByText(/valid email/)).toBeNull();
    fireEvent.blur(email);
    expect(screen.getByText(/valid email/)).toBeTruthy();
    expect(email.getAttribute('aria-invalid')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await flush();
    expect(screen.getByText('Accept the terms.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(email, { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByLabelText('I agree'));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await flush();
    expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', terms: true });
  });
});

describe('FileUpload', () => {
  it('accepts, rejects and removes files', async () => {
    const onValueChange = vi.fn();
    render(<FileUpload multiple accept=".pdf" maxFiles={2} onValueChange={onValueChange} />);
    const zone = screen.getByRole('button', { name: /Drop files here/ });
    const drop = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: unknown };
    drop.dataTransfer = { files: [new File(['1'], 'a.pdf', { type: 'application/pdf' }), new File(['2'], 'b.png', { type: 'image/png' })], types: ['Files'] };
    act(() => void zone.dispatchEvent(drop));
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'a.pdf' })]);
    expect(screen.getByRole('alert').textContent).toContain("b.png: this file type isn't allowed.");
    expect(zone.getAttribute('aria-invalid')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });
});
