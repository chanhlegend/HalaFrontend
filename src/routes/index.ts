import MainLayout from '../layouts/MainLayout';
import AuthPage from '../pages/AuthPage';
import HomePage from '../pages/HomePage';
import FriendPage from '../pages/FriendPage';
import NotificationPage from '../pages/NotificationPage';
import ProfilePage from '../pages/ProfilePage';
import MessagePage from '../pages/MessagePage';


export const ROUTE_PATH = {
    HOME: '/',
    AUTH: '/auth',
    PROFILE: '/profile',
    FRIENDS: '/friends',
    NOTIFICATIONS: '/notifications',
    MESSAGES: '/messages',
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
        path: ROUTE_PATH.PROFILE,
        page: ProfilePage,
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
    {
        path: ROUTE_PATH.MESSAGES,
        page: MessagePage,
        layout: MainLayout,
        isProtected: true,
    },
];
