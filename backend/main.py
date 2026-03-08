from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict, deque
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Get configuration from environment variables
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Edge(BaseModel):
    source: str
    target: str

class PipelineData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Edge]

@app.get('/')
def read_root():
    return {'Listening at': 'http://localhost:8000'}

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

@app.post('/pipelines/parse')
def parse_pipeline(data: PipelineData):
    """
    Parse the pipeline and return analysis:
    - num_nodes: number of nodes in the pipeline
    - num_edges: number of edges in the pipeline
    - is_dag: whether the graph is a directed acyclic graph
    """
    try:
        num_nodes = len(data.nodes)
        num_edges = len(data.edges)
        dag = is_dag(data.nodes, data.edges)
        
        return {
            'num_nodes': num_nodes,
            'num_edges': num_edges,
            'is_dag': dag,
            'status': 'success'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e),
            'num_nodes': 0,
            'num_edges': 0,
            'is_dag': False
        }
