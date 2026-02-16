import styles from './Button.module.css';

type Props = {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
};

export default function Button({ text, onClick, type = 'button' }: Props) {
  return (
    <button className={styles.button} type={type} onClick={onClick}>
      {text}
    </button>
  );
}
