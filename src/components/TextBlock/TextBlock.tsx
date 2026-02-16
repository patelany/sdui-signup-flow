import styles from './TextBlock.module.css';

export default function TextBlock({ text }: { text: string }) {
  return <p className={styles.text}>{text}</p>;
}