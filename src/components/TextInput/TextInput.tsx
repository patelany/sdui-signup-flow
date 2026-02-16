import styles from './TextInput.module.css';

type Props = {
  label: string;
  name: 'email' | 'password';
  placeholder?: string;
  required?: boolean;

  value?: string;
  onChange?: (name: Props['name'], value: string) => void;
  error?: string;
};

export default function TextInput({
  label,
  name,
  placeholder,
  required,
  value = '',
  onChange,
  error,
}: Props) {
  const inputId = `input-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>

      <input
        id={inputId}
        className={styles.input}
        name={name}
        type={name === 'password' ? 'password' : 'email'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(name, e.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />

      {error ? (
        <div id={errorId} className={styles.error} role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
