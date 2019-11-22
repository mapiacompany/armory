export class DialogConfig<D = any> {
  initialState?: D;
  size?: 'sm' | 'md' | 'lg' | 'full';
  width?: string;
  height?: string;
  closeButton?: boolean;
  fade?: boolean;
  backDrop?: boolean;
  accessiblility?: boolean;
}
