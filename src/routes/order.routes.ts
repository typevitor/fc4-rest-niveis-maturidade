import { Router } from 'express';
import { createOrderService } from '../services/order.service';
import { Resource, ResourceCollection } from '../http/Resource';

const router = Router();

router.post('/', async (req, res) => {
    const orderService = await createOrderService();
    const { payment_method, cart_uuid, card_token } = req.body;
    // @ts-expect-error
    const customerId = req.userId;
    const { order, payment } = await orderService.createOrder({customerId, payment_method, card_token, cart_uuid});
    const resource = new Resource({order, payment}, {
    _links: {
        self: {
            href: `/orders/${order.id}`,
            method: 'GET',
            type: 'application/json'
        },
        cancel: {
            href: `/orders/${order.id}/cancel`,
            method: 'POST',
            type: 'application/json'
        },
    }
    });
    res.json(resource);
});

router.get('/', async (req, res) => {
    const orderService = await createOrderService();
    const { page = 1, limit = 10 } = req.query;
    // @ts-expect-error
    const customerId = req.userId;
    const { orders, total } = await orderService.listOrders({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        customerId
    });
    
    const resource = new ResourceCollection(orders, {
        paginationData: {
            total,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
        },
    })
    res.json(resource.toJson());});


export default router;
