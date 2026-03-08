# VectorShift Pipeline Builder

A visual pipeline builder application that enables users to create, configure, and execute data processing workflows using a node-based interface. Connect various processing nodes to build complex data pipelines with an intuitive drag-and-drop UI.

## Overview

VectorShift is a full-stack application consisting of a React-based frontend UI and a Python FastAPI backend. Users can visually design data processing pipelines by connecting nodes, configure node parameters, and execute pipelines to process data through multiple stages.

---

## Frontend

### Technology Stack
- **React** - UI framework
- **React Flow** - Node-based UI library for pipeline visualization
- **Tailwind CSS** - Utility-first CSS framework
- **react-icons** - Icon library (Material Design, Feather Icons)
- **react-toastify** - Toast notifications
- **Zustand** - State management

### Key Features
- 🖱️ **Drag-and-drop node creation** - Add nodes from toolbar to canvas
- 🔗 **Visual connections** - Connect nodes with handles to define data flow
- ⚙️ **Node configuration** - Edit node parameters with real-time validation
- 📝 **Multiple node types** - Input, Output, Text, LLM, Chat, Merge, Split, Save File, Choose Files
- 🎨 **Dark theme UI** - Professional dark interface with color-coded nodes
- 📱 **Responsive design** - Adapts to different screen sizes
- 📚 **Built-in documentation** - Interactive guide for new users
- ✨ **Auto-expanding textareas** - Dynamic field sizing for content

### Project Structure
```
frontend/
├── public/                 # Static files
├── src/
│   ├── App.js             # Main app component with header and layout
│   ├── index.js           # Entry point
│   ├── index.css          # Global styles with custom scrollbars
│   ├── store.js           # Zustand state management
│   ├── toolbar.js         # Left sidebar with draggable nodes
│   ├── ui.js              # React Flow canvas component
│   ├── submit.js          # Submit button for pipeline execution
│   ├── draggableNode.js   # Draggable node wrapper
│   ├── InstructionsModal.js # Documentation modal
│   ├── nodes/             # Node components
│   │   ├── baseNode.js         # Reusable node abstraction
│   │   ├── inputNode.js        # Input node
│   │   ├── llmNode.js          # LLM integration node
│   │   ├── textNode.js         # Text processing node
│   │   ├── chatNode.js         # Chat/conversation node
│   │   ├── outputNode.js       # Output display node
│   │   ├── saveFileNode.js     # Save to file node
│   │   ├── chooseFilesNode.js  # File upload node
│   │   ├── mergeNode.js        # Merge data streams node
│   │   └── splitNode.js        # Split data node
│   └── utils/
│       └── saveFileUtils.js    # File download utilities
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

### Available Nodes

#### Input Nodes
- **Input Node** - Enter custom text or data to start your pipeline

#### Processing Nodes
- **Text Node** - Display or transform text with reference syntax `{{nodeId}}`
- **LLM Node** - Send prompts to AI models with configurable temperature
- **Chat Node** - Multi-turn conversations with context awareness
- **Merge Node** - Combine multiple data streams into unified output
- **Split Node** - Divide data into multiple streams for parallel processing

#### Output & File Nodes
- **Output Node** - Display final pipeline results
- **Save File Node** - Save processed data to files
- **Choose Files Node** - Upload files for processing

### Setup & Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```
   The app will run on `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```

### Usage
1. Drag nodes from the toolbar to the canvas
2. Connect nodes by dragging from output handles (right) to input handles (left)
3. Click on nodes to configure their parameters
4. Use reference syntax `{{nodeId}}` in Text nodes to reference upstream outputs
5. Click Submit to execute the pipeline
6. View results in Output and Save File nodes

---

## Backend

### Technology Stack
- **Python 3.8+** - Programming language
- **FastAPI** - Modern web framework
- **Pydantic** - Data validation using Python type annotations
- **CORS** - Cross-Origin Resource Sharing for frontend communication
- **Google Gemini API** - AI/LLM integration

### Key Features
- 🚀 **RESTful API** - Clean API endpoints for pipeline execution
- 🔄 **Pipeline orchestration** - Execute multi-node pipelines sequentially
- 🤖 **LLM integration** - Integration with Google Gemini for AI responses
- 📊 **Data validation** - Pydantic schemas for request/response validation
- ⚡ **Async support** - Ready for asynchronous operations
- 📝 **API documentation** - Auto-generated Swagger docs at `/docs`

### Project Structure
```
backend/
├── main.py              # Application entry point
├── app/
│   ├── __init__.py
│   ├── config.py        # Configuration settings
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── chat.py          # Chat endpoint
│   │       ├── llm.py           # LLM endpoint
│   │       └── pipeline.py      # Pipeline execution endpoint
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py    # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── chat_service.py      # Chat service logic
│   │   ├── llm_service.py       # LLM service logic
│   │   └── pipeline_service.py  # Pipeline orchestration
│   └── utils/
│       ├── __init__.py
│       └── graph_utils.py       # Graph/pipeline utilities
└── requirements.txt     # Python dependencies
```

### API Endpoints

#### Chat Endpoint
- **POST** `/api/chat`
- Request body: `{ "context": "...", "question": "...", "temperature": 0.7 }`
- Response: `{ "response": "..." }`

#### LLM Endpoint
- **POST** `/api/llm`
- Request body: `{ "prompt": "...", "temperature": 0.7 }`
- Response: `{ "response": "..." }`

#### Pipeline Endpoint
- **POST** `/api/pipeline`
- Request body: Pipeline execution payload with node configurations
- Response: Execution results from all nodes

### Setup & Installation

1. **Create Python virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   Create `.env` file:
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   ENVIRONMENT=development
   ```

5. **Start development server:**
   ```bash
   python main.py
   ```
   The API will run on `http://localhost:8000`

### Dependencies
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `python-dotenv` - Environment variables
- `httpx` - HTTP client
- `google-generativeai` - Gemini API client
- `python-multipart` - File upload support

---

## Full Stack Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Running Locally

1. **Start Backend:**
   ```bash
   cd backend
   python -m venv venv
   # Activate venv (see above)
   pip install -r requirements.txt
   python main.py
   ```
   Backend runs on `http://localhost:8000`

2. **Start Frontend (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend runs on `http://localhost:3000`

3. **Access the application:**
   Open `http://localhost:3000` in your browser

### API Documentation
While backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

---

## Project Workflow

1. **User Interface** - React frontend displays node toolbar and canvas
2. **Node Creation** - User drags nodes from toolbar to canvas
3. **Configuration** - User configures node parameters (text inputs, selects, numbers)
4. **Connections** - User connects nodes by dragging handles
5. **Submission** - User clicks Submit button
6. **Backend Processing** - FastAPI receives pipeline configuration
7. **Execution** - Backend orchestrates node execution in correct order
8. **LLM Integration** - Nodes requiring AI use Google Gemini API
9. **Results** - Results returned to frontend and displayed in Output nodes
10. **File Export** - Users can save results using Save File nodes

---

## Key Features Overview

### Frontend
- ✨ Intuitive drag-and-drop interface
- 🎨 Dark theme with syntax highlighting
- 📚 Built-in documentation with searchable sections
- 🔄 Real-time data flow visualization
- ⚡ Fast, responsive UI with React Flow
- 💾 Auto-save of pipeline state

### Backend
- 🤖 AI integration with Google Gemini
- 🔄 Sequential pipeline execution
- 📊 Data validation and error handling
- 🚀 RESTful API design
- 📝 Auto-generated API documentation

---

## Environment Variables

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: `http://localhost:8000`)

### Backend
- `GOOGLE_API_KEY` - Google Gemini API key (required)
- `ENVIRONMENT` - Environment mode (development/production)
- `CORS_ORIGINS` - Allowed CORS origins (default: `["http://localhost:3000"]`)

---

## Development

### Code Style
- React/JavaScript - ES6+ with functional components
- Python - PEP 8 conventions
- Components are modular and reusable

### State Management
- Frontend uses Zustand for global state
- Each node can manage its own local state
- Store includes: nodes, edges, and utility functions

### Error Handling
- Frontend: Toast notifications for user feedback
- Backend: Standard HTTP status codes with error messages

---

## Deployment

### Frontend
- Build: `npm run build`
- Deploy to: Vercel, Netlify, AWS S3, or any static host

### Backend
- Deploy using: Docker, Heroku, AWS Lambda, or traditional VPS
- Ensure environment variables are set on deployment platform

---

## Future Enhancements

- [ ] Undo/Redo functionality
- [ ] Save/Load pipelines
- [ ] Custom node creation
- [ ] Batch processing
- [ ] History of executions
- [ ] Collaborative editing
- [ ] Advanced data visualization
- [ ] Plugin system for custom nodes

---

## License

This project is part of the VectorShift assignment.

---

## Support

For issues or questions, please refer to the built-in documentation accessible via the Documentation button in the app header.
