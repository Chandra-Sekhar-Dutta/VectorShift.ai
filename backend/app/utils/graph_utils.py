from collections import defaultdict
from typing import List, Dict, Any
from app.models.schemas import Edge

def is_dag(nodes: List[Dict[str, Any]], edges: List[Edge]) -> bool:
    """
    Check if the graph is a Directed Acyclic Graph (DAG) using DFS.
    Returns True if the graph is a DAG, False otherwise (contains cycles).
    """
    if not nodes or not edges:
        return True
    
    # Build adjacency list
    graph = defaultdict(list)
    node_ids = {node['id'] for node in nodes}
    
    for edge in edges:
        # Only add valid edges (both nodes exist)
        if edge.source in node_ids and edge.target in node_ids:
            graph[edge.source].append(edge.target)
    
    # Track visited states: 0=unvisited, 1=visiting, 2=visited
    visited = defaultdict(int)
    
    def has_cycle(node_id):
        """DFS to detect cycles. Returns True if cycle found."""
        visited[node_id] = 1  # Mark as visiting
        
        for neighbor in graph[node_id]:
            if visited[neighbor] == 1:  # Back edge found (cycle)
                return True
            if visited[neighbor] == 0:  # Unvisited node
                if has_cycle(neighbor):
                    return True
        
        visited[node_id] = 2  # Mark as visited
        return False
    
    # Check all nodes for cycles
    for node in nodes:
        if visited[node['id']] == 0:
            if has_cycle(node['id']):
                return False
    
    return True
