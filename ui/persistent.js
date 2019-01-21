
import * as nodes from '../src/nodes';
import defaultValues from './defaultGraph';


export const createNode = ({name, options, id}) => {
  try {
      const node = new nodes[name](options);
      node.deserialize({id, options});
      return node;
  } catch (err) {
      console.error('Failed to create node', name, err)
  }
}

export const createNodes = (nodes) => {
  nodes = nodes.map(({node, x, y}) => {
    const nodeInstance = createNode(node);
    return ({
      node: nodeInstance,
      x, y,
      connect(outputs) {
        try {
          nodeInstance.reconnect(node, outputs);
        } catch(err) {
          console.error('Can\'t recoonect', nodeInstance, err);
        }
      }
    });
  }).filter(({node}) => node);

  const outputsById = nodes
    .map(({node}) => Object.values(node.out.__values))
    .reduce((acc, nxt) => acc.concat(nxt), [])
    .reduce((acc, nxt) => {
      acc[nxt.id] = nxt;
      return acc;
    }, {});

  return nodes.map(({node, x, y, connect}) => {
    connect(outputsById);
    return {node,x,y};
  })
}

export const serializeNodes = (nodes) =>
  nodes.map(({node, x, y}) => ({
      node: node.serialize(),
      x, y,
  }));


export const load = (name) => {
  try {
    return createNodes(JSON.parse(localStorage.getItem(`IFP_GRAPH_${name}`)) || defaultValues);
  } catch (err) {
    return createNodes(defaultValues);
  }
};
export const save = (name, graph) => localStorage.setItem(`IFP_GRAPH_${name}`, JSON.stringify(serializeNodes(graph)));