import MainLayout from '../layouts/MainLayout';
import AuthPage from '../pages/AuthPage';
import HomePage from '../pages/HomePage';

export const ROUTE_PATH = {
    HOME: '/',
    AUTH: '/auth',
};

export const AppRoute = [
    {
        path: ROUTE_PATH.AUTH,
        page: AuthPage,
        layout: null,
        isProtected: false,
    },
    {
        path: ROUTE_PATH.HOME,
        page: HomePage,
        layout: MainLayout,
        isProtected: true,
    },
];
