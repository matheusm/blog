import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TO-DO: Logo redirect to home page.
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/LogoCompleted.svg" alt="Space Traveling Logo" />
      </div>
    </header>
  );
}
