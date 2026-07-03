let tasks = []
const listeners = new Set()

const notify = () => {
    listeners.forEach((listener) => listener([...tasks]))
}

export const subscribeGenerationQueue = (listener) => {
    listeners.add(listener)
    listener([...tasks])
    return () => listeners.delete(listener)
}

export const createGenerationTask = ({ type, label }) => {
    const task = {
        id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        name: label || `${type} generation`,
        status: 'running',
        createdAt: Date.now(),
    }

    tasks = [task, ...tasks].slice(0, 12)
    notify()
    return task.id
}

export const completeGenerationTask = (taskId, resultLabel) => {
    tasks = tasks.map((task) =>
        task.id === taskId
            ? { ...task, status: 'complete', resultLabel, completedAt: Date.now() }
            : task
    )
    notify()
}

export const failGenerationTask = (taskId, errorMessage) => {
    tasks = tasks.map((task) =>
        task.id === taskId
            ? { ...task, status: 'failed', errorMessage, completedAt: Date.now() }
            : task
    )
    notify()
}
