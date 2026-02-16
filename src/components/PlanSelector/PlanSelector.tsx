import styles from './PlanSelector.module.css';

type Option = { id: string; title: string; price: string };

type Props = {
  name: 'plan';
  options: Option[];
  required?: boolean;
  value?: string;
  onChange?: (name: 'plan', value: string) => void;
  error?: string;
};

export default function PlanSelector({ name, options, value, onChange, error }: Props) {
  const groupId = `radio-${name}`;
  const errorId = `${groupId}-error`;

  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? `${groupId}-error` : undefined}>
      <legend className={styles.legend}>Plans</legend>

      <div className={styles.grid}>
        {options.map((opt) => {
          const id = `${groupId}-${opt.id}`;
          return (
            <label key={opt.id} className={styles.card} htmlFor={id}>
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange?.(name, opt.id)}
              />
              <div className={styles.cardBody}>
                <div className={styles.title}>{opt.title}</div>
                <div className={styles.price}>{opt.price}</div>
              </div>
            </label>
          );
        })}
      </div>

      {error ? (
        <div id={`${errorId}-error`} className={styles.error} role="alert">
          {error}
        </div>
      ) : null}
    </fieldset>
  );
}
