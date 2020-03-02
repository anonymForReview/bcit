import * as GraphQuery from './../graph/GraphQuery';
import cytoscape from "cytoscape";
import * as creategraph from "../graph/GraphEditor";

function checkBPC(graph) {
  const resultGraph = cytoscape({/* options */});

  // 1st get all business nodes --> done
  const businessNodes = GraphQuery.filterNodes(graph, {type: 'businessprocess'});

  // 2nd get compliance requirement of each businessNode
  let resultElements = [];
  businessNodes.forEach(businessNode => {
    const preds = GraphQuery.getPredecessors(businessNode, 'compliance');

    // 3rd check compliance process of first entry
    if (preds.length > 0) {
      console.log(businessNode);
      const complianceRequirement = preds[0];
      console.log(complianceRequirement);

      const complianceProcesses = GraphQuery.getPredecessors(complianceRequirement, 'complianceprocess');
      console.log(complianceProcesses);

      // 4th if no compliance process append preds to compliance
      if (complianceProcesses.length === 0) {
        console.log('violation');
        resultElements.push(complianceRequirement); // add compliance requirement
        resultElements.push(businessNode); // add business node

        creategraph.addUniqueNode(resultGraph, { node: complianceRequirement }, 'violated');
        creategraph.addUniqueNode(resultGraph, { node: businessNode }, 'violated');
      }
    }
  });

  return resultGraph;
}

export function getViolatedGraph(graph) {
  return checkBPC(graph);
}
