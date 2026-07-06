import {test as base} from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CartPage } from '../pages/CartPage';
import { PlaceOrderPage } from '../pages/PlaceOrderPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { OrdersPage } from '../pages/OrdersPage';

export const test = base.extend({
    loginPage: async ({page}, use) => {
        await use(new LoginPage(page));
    },
    dashboardPage: async ({page}, use) => {
        await use(new DashboardPage(page));
    },
    cartPage: async ({page}, use) => {
        await use(new CartPage(page));
    },
    placeOrderPage: async ({page}, use) => {
        await use(new PlaceOrderPage(page));
    },
    orderConfirmationPage: async ({page}, use) => {
        await use(new OrderConfirmationPage(page));
    },
    ordersPage: async ({page}, use) => {
        await use(new OrdersPage(page));
    }
});