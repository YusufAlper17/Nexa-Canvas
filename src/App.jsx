import { useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import FlowCanvas from './components/Canvas/FlowCanvas'
import LeftToolbar from './components/Toolbar/LeftToolbar'
import TopBar from './components/Toolbar/TopBar'
import ParametersPanel from './components/Parameters/ParametersPanel'
import QueuePanel from './components/Queue/QueuePanel'
import CreditsIndicator from './components/Credits/CreditsIndicator'
import ApiSettingsModal from './components/Settings/ApiSettingsModal'
import './App.css'

function App() {
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false)

  return (
    <ReactFlowProvider>
      <div className="app-container">
        <main className="main-content full-screen">
          <div className="canvas-container">
            <TopBar onOpenApiSettings={() => setIsApiSettingsOpen(true)} />
            <LeftToolbar />
            <FlowCanvas />
            <CreditsIndicator onOpenApiSettings={() => setIsApiSettingsOpen(true)} />
            <ParametersPanel />
            <QueuePanel />
          </div>
        </main>
        <ApiSettingsModal
          isOpen={isApiSettingsOpen}
          onClose={() => setIsApiSettingsOpen(false)}
        />
      </div>
    </ReactFlowProvider>
  )
}

export default App
