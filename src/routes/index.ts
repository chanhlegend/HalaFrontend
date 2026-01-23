import MainLayout from '../layouts/MainLayout';
import AuthPage from '../pages/AuthPage';
import HomePage from '../pages/HomePage';
import FriendPage from '../pages/FriendPage';
import NotificationPage from '../pages/NotificationPage';


export const ROUTE_PATH = {
    HOME: '/',
    AUTH: '/auth',
    FRIENDS: '/friends',
    NOTIFICATIONS: '/notifications',
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
    {
        path: ROUTE_PATH.FRIENDS,
        page: FriendPage,
        layout: MainLayout,
        isProtected: true,
    },
    {
        path: ROUTE_PATH.NOTIFICATIONS,
        page: NotificationPage,
        layout: MainLayout,
        isProtected: true,
    },
];
