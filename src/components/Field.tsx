import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import './Field.css';

interface FieldShellProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}

function FieldShell({ label, hint, htmlFor, children }: FieldShellProps) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function InputField({ label, hint, id, ...rest }: InputFieldProps) {
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <input id={id} className="field__control" {...rest} />
    </FieldShell>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextareaField({ label, hint, id, ...rest }: TextareaFieldProps) {
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <textarea id={id} className="field__control" {...rest} />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function SelectField({ label, hint, id, children, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <select id={id} className="field__control" {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}
