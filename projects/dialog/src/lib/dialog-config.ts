export class DialogConfig<D = any> {
  data?: D;
  size?: 'sm' | 'md' | 'lg' | 'full';
  width?: string;
  height?: string;
  closeButton?: boolean;
  fade?: boolean;
  backDrop?: boolean;
  accessiblility?: boolean;
}
