import Logo from './Logo';
import SidebarRoutes from './sidebar-routes';

const Sidebar = () => {
    return (
        <div className="flex h-full flex-col overflow-y-auto border-r bg-white shadow-sm">
            {/* Logo */}
            <div className="p-6">
                <Logo />
            </div>
            {/* Sidebar routes */}
            <SidebarRoutes />
        </div>
    );
};

export default Sidebar;
