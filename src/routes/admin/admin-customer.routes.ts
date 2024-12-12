import { Router } from 'express';
import { createCustomerService } from '../../services/customer.service';
import { Resource, ResourceCollection } from '../../http/Resource';

const router = Router();

router.post('/', async (req, res) => {
    const customerService = await createCustomerService();
    const { name, email, password, phone, address } = req.body;
    const customer = await customerService.registerCustomer({name, email, password, phone, address});
    res.set('Location', `/admin/products/${customer.id}`).status(201);
    const resource = new Resource(customer)
    res.json(resource.toJson());
});

router.get('/:customerId', async (req, res) => {
    const customerService = await createCustomerService();
    const customer = await customerService.getCustomer(+req.params.customerId);
    if(customer) {
        const resource = new Resource(customer)
        res.json(resource.toJson());
    }
    return res.status(404).json({
      title: 'Not Found',
      status: 404,
      detail: `Customer with id ${req.params.customerId} not found`
    });
});

router.patch('/:customerId', async (req, res) => {
    const customerService = await createCustomerService();
    const { phone, address, password } = req.body;
    const customer = await customerService.updateCustomer({
        customerId: +req.params.customerId,
        phone, 
        address,
        password
    });
    const resource = new Resource(customer)
    res.json(resource.toJson());
});

router.delete('/:customerId', async (req, res) => {
    const customerService = await createCustomerService();
    const { customerId } = req.params;
    await customerService.deleteCustomer(parseInt(customerId));
    res.sendStatus(204);
});

router.get('/', async (req, res) => {
    const customerService = await createCustomerService();
    const { page = 1, limit = 10 } = req.query;
    const { customers, total } = await customerService.listCustomers({
        page: parseInt(page as string),
        limit: parseInt(limit as string)
    });
    const resource = new ResourceCollection(customers, {
        paginationData: {
            total,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
        },
    })
    res.json(resource.toJson());
});

export default router;