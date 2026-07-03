import {
    Home,
    WandSparkles,
    LayoutGrid,
    Image,
    Video,
    SquarePen,
    Sparkles,
    PanelLeftClose,
    PanelLeft,
    ChevronDown,
    CircleHelp,
    MessageSquare,
    Settings,
    Workflow
} from 'lucide-react'
import { appConfig } from '../../data/appConfig'
import './Sidebar.css'

function Sidebar({ collapsed, onCollapse }) {
    const navItems = [
        { icon: Home, label: 'Ana Sayfa', path: '/dashboard', active: false },
        { icon: WandSparkles, label: 'AI Paketi', path: '/generator', active: false },
        { icon: LayoutGrid, label: 'Varlıklar', path: '/assets', active: false },
    ]

    const pinnedTools = [
        { icon: Workflow, label: 'Flow Canvas', path: '/flow', color: '#00d9ff', active: true },
        { icon: Image, label: 'Görsel Oluşturucu', path: '/generator?mode=image', color: '#00d9ff' },
        { icon: Video, label: 'Video Oluşturucu', path: '/generator?mode=video', color: '#a855f7' },
        { icon: SquarePen, label: 'Görsel Düzenle', path: '/image-edit', color: '#22c55e' },
    ]

    if (collapsed) {
        return (
            <aside className="sidebar collapsed">
                <button className="collapse-btn" onClick={onCollapse}>
                    <PanelLeft size={18} />
                </button>
            </aside>
        )
    }

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <a href="/dashboard" className="logo-link">
                    <div className="logo-icon">M</div>
                    <span className="logo-text">{appConfig.shortName}</span>
                </a>
                <button className="collapse-btn" onClick={onCollapse}>
                    <PanelLeftClose size={18} />
                </button>
            </div>

            {/* Workspace Selector */}
            <div className="workspace-selector">
                <button className="workspace-btn">
                    <div className="workspace-avatar">P</div>
                    <span className="workspace-name">Kişisel</span>
                    <ChevronDown size={16} className="workspace-chevron" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section">
                    {navItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${item.active ? 'active' : ''}`}
                        >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>

                {/* Pinned Tools */}
                <div className="nav-section">
                    <h3 className="section-title">Sabitlenmiş Araçlar</h3>
                    {pinnedTools.map((tool) => (
                        <a
                            key={tool.path}
                            href={tool.path}
                            className={`nav-item ${tool.active ? 'active' : ''}`}
                        >
                            <tool.icon size={16} style={{ color: tool.color }} />
                            <span>{tool.label}</span>
                        </a>
                    ))}
                </div>

                {/* Gems Section */}
                <div className="nav-section">
                    <h3 className="section-title">Gems</h3>
                    <a href="/gems" className="nav-item">
                        <Sparkles size={16} style={{ color: '#facc15' }} />
                        <span>Gems Hub</span>
                    </a>
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {/* Pro Card */}
                <div className="pro-card">
                    <div className="pro-indicator"></div>
                    <h4>Bring Your Own Key</h4>
                    <p>Connect your preferred AI providers from API Settings.</p>
                    <button className="pro-btn">Configure</button>
                </div>

                {/* Actions */}
                <div className="footer-actions">
                    <button className="action-btn" title="Yardım">
                        <CircleHelp size={20} />
                    </button>
                    <button className="action-btn" title="Geri Bildirim">
                        <MessageSquare size={20} />
                    </button>
                    <button className="action-btn" title="Ayarlar">
                        <Settings size={20} />
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
