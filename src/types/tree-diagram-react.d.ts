declare module 'tree-diagram-react' {
  import { ComponentType } from 'react';

  interface TreeNode {
    name: string;
    children?: TreeNode[];
    stage?: string;
    percent?: number;
    metadata?: any;
  }

  interface TreeDiagramProps {
    data: TreeNode;
    initialOpenDepth?: number;
  }

  const TreeDiagram: ComponentType<TreeDiagramProps>;
  export default TreeDiagram;
}

declare module 'tree-diagram-react/styles.css' {
  const content: string;
  export default content;
}