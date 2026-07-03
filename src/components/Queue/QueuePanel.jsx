import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { subscribeGenerationQueue } from '../../services/generationQueue'
import './QueuePanel.css'

function QueuePanel() {
    const [expanded, setExpanded] = useState(false)
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        return subscribeGenerationQueue(setTasks)
    }, [])

    const activeCount = tasks.filter(t => t.status === 'running').length
    const completedCount = tasks.filter(t => t.status !== 'running').length
    const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

    return (
        <div className={`queue-panel ${expanded ? 'expanded' : ''}`}>
            <div
                className="queue-header"
                onClick={() => setExpanded(!expanded)}
            >
                <div
                    className="queue-progress"
                    style={{ width: `${progress}%` }}
                />
                <div className="queue-info">
                    <span className="queue-label">Queue</span>
                    <span className="queue-count">{activeCount} active</span>
                </div>
                <ChevronRight
                    size={24}
                    className={`queue-chevron ${expanded ? 'rotated' : ''}`}
                />
            </div>

            {expanded && (
                <div className="queue-content">
                    {tasks.length === 0 ? (
                        <p className="queue-empty">No active tasks</p>
                    ) : (
                        <ul className="queue-list">
                            {tasks.map((task) => (
                                <li key={task.id} className="queue-item">
                                    <span className="task-name">{task.name}</span>
                                    <span className={`task-status ${task.status}`}>
                                        {task.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}

export default QueuePanel
