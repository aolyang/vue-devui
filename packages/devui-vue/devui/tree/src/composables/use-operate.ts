import { Ref, ref } from 'vue';
import { randomId } from '../../../shared/utils';
import { IInnerTreeNode, ITreeNode, IUseCore, IUseOperate } from './use-tree-types';

export default function () {
  return function useOperate(data: Ref<IInnerTreeNode[]>, core: IUseCore): IUseOperate {

    const { setNodeValue, getChildren, getIndex, getLevel } = core;

    const insertBefore = (
      parentNode: ITreeNode,
      node: ITreeNode,
      referenceNode?: ITreeNode,
    ): void => {
      const children = getChildren(parentNode, {
        recursive: false,
      });
      const lastChild = children[children.length - 1];
      let insertedIndex = getIndex(parentNode) + 1;

      if (referenceNode) {
        insertedIndex = getIndex(referenceNode);
      } else if (lastChild) {
        insertedIndex = getIndex(lastChild) + 1;
      }

      setNodeValue(parentNode, 'expanded', true);
      setNodeValue(parentNode, 'isLeaf', false);

      if (lastChild) {
        setNodeValue(lastChild, 'parentChildNode', children.length + 1);
      }

      const currentNode = ref({
        ...node,
        level: getLevel(parentNode) + 1,
        parentId: parentNode.id,
        isLeaf: true,
        parentChildNode: children.length + 1,
        currentIndex: lastChild?.currentIndex + 1,
      });

      if (currentNode.value.id === undefined) {
        currentNode.value.id = randomId();
      }

      data.value = data.value.slice(0, insertedIndex)
        .concat(
          currentNode.value,
          data.value.slice(insertedIndex, data.value.length)
        );
    };

    const removeNode = (node: IInnerTreeNode, config = { recursive: true }): void => {
      if (!config.recursive) {
        getChildren(node).forEach(child => {
          setNodeValue(child, 'level', getLevel(child) - 1);
        });
      }

      data.value = data.value.filter(item => {
        if (config.recursive) {
          return item.id !== node.id && !getChildren(node).map(nodeItem => nodeItem.id).includes(item.id);
        } else {
          return item.id !== node.id;
        }
      });
    };

    const editNode = (node: IInnerTreeNode, label: string): void => {
      setNodeValue(node, 'label', label);
    };

    return {
      insertBefore,
      removeNode,
      editNode,
    };
  };
}
