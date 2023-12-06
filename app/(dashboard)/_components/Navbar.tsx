import NavbarRoutes from '@/components/navbar-routes';
import MobileSidebar from './mobile-sidebar';

const Navbar = () => {
    return (
        <div className="flex h-full items-center border-b bg-white p-4 shadow-sm">
            {/* Mobile sidebar */}
            <MobileSidebar />
            {/* Navbar routes */}
            <NavbarRoutes />
        </div>
    );
};

export default Navbar;
