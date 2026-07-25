import { mountMindVoid } from './app/mount';
import './styles/tokens.generated.css';
import './styles/void.css';

const root = document.querySelector<HTMLElement>('#app');
if (!root) {
  throw new Error('Mind Void: missing #app mount root');
}

mountMindVoid(root);
