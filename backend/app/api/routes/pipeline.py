from fastapi import APIRouter
from app.models import PipelineData
from app.utils import is_dag

router = APIRouter(prefix="/pipelines", tags=["pipelines"])

@router.post('/parse')
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
