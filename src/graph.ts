import * as nodes from './nodes/index';
import Node from './nodes/Node'
import {MultiSubject} from './helpers/listener';

interface GraphNode {
  node: Node<any, any>,
  x?: number,
  y?: number
}

export default class Graph {

    nodes: GraphNode[]
    __nodesActive: number
    __isRunningSet: WeakSet<any>
    subject: MultiSubject

    constructor(nodes=[]) {
        this.__isRunningSet = new WeakSet();
        this.nodes = nodes;
        this.__nodesActive = 0;
        this.subject = new MultiSubject(['running', 'stopped']);
        this.__setupRunningListeners();
    }

    get isRunning() {
      return this.__nodesActive > 0;
    }

    get isStopped() {
      return this.__nodesActive === 0;
    }

    serialize() {
        return this.nodes.map(({node, x, y}) => ({
            node: node.serialize(),
            x, y,
        }));
    }

    addNode(node) {
      this.nodes.push({node});
      this.__setupNodeRunningListener(node);
    }

    __setupNodeRunningListener(node) {
      node.subject.on('running', (isRunning) => {
        if (!isRunning && this.__isRunningSet.has(node)) {
          this.__isRunningSet.delete(node);
          this.__nodesActive -= 1;
        } else if (isRunning && !this.__isRunningSet.has(node)) {
          this.__isRunningSet.add(node);
          this.__nodesActive += 1;
        }
        if (this.__nodesActive > 0) {
          this.subject.next('running');
        } else {
          console.info('[Graphfx] graph stopped');
          this.subject.next('stopped');
        }
      });
    }

    __setupRunningListeners() {
      for (const {node} of this.nodes) {
        this.__setupNodeRunningListener(node);
      }
    }

    static async deserialize(nodes) {
        const graph = new Graph(await createUnconnectedNodes(nodes));
        await reconnectNodes(graph.nodes);
        return graph;
    }

    findIOByLabel(label) {
        const results = [];
        const isMatch = label instanceof RegExp ? (val) => label.test(val) : (val) => val === label;
        for (let {node} of this.nodes) {
            for (let name of Object.keys(node.in.variables)) {
                if (isMatch(node.in[name].label)) {
                    results.push(node.in[name])
                }
            }
            for (let name of Object.keys(node.out.variables)) {
                if (isMatch(node.out[name].label)) {
                    results.push(node.out[name])
                }
            }
        }
        return results;
    }

    destroy() {
        for(let {node} of this.nodes) {
            node.destroy();
        }
    }

}



export async function createNode<T extends keyof typeof nodes>(
  {name, options, id}:{name: T, options: any, id: string}):Promise<typeof nodes[T]> {
    try {
        const node = new nodes[name](options);
        await node.deserialize({id, options});
        // @ts-ignore
        return node;
    } catch (err) {
        console.error('Failed to create node', name, err)
    }
  }

export const createUnconnectedNodes = async (nodes):Promise<GraphNode[]> => {
  // @ts-ignore
  return (await Promise.all(nodes.map(async ({node, x, y}) => {
    const nodeInstance = await createNode(node);
    return ({
      node: nodeInstance,
      x, y,
      async connect(outputs) {
        try {
          await nodeInstance.reconnect(node, outputs);
        } catch(err) {
          console.error('Can\'t recoonect', nodeInstance, err);
        }
      }
    });
  }))).filter(({node}) => node);
}

export const reconnectNodes = async (nodes) => {
  const outputsById = nodes
    .map(({node}) => Object.values(node.out.__values))
    .reduce((acc, nxt) => acc.concat(nxt), [])
    .reduce((acc, nxt) => {
      acc[nxt.id] = nxt;
      return acc;
    }, {});

  return await Promise.all(nodes.map(async ({node, x, y, connect}) => {
    await connect(outputsById);
    return {node,x,y};
  }))
}

export const createNodes = async (nodes):Promise<GraphNode[]> => {
  const unconnectedNodes = await createUnconnectedNodes(nodes);
  // @ts-ignore
  return reconnectNodes(unconnectedNodes);
}
