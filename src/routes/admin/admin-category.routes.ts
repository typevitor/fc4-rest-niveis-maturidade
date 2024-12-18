import { Router } from 'express';
import { createCategoryService } from '../../services/category.service';
import { Resource, ResourceCollection } from '../../http/resource';

const router = Router();

router.post('/', async (req, res) => {
    const categoryService = await createCategoryService();
    const { name, slug } = req.body;
    const category = await categoryService.createCategory({ name, slug });
    res.set('Location', `/admin/products/${category.id}`).status(201);
    const resource = new Resource(category);
    res.json(resource);
});

router.get('/:categoryId', async (req, res) => {
    const categoryService = await createCategoryService();
    const category = await categoryService.getCategoryById(+req.params.categoryId);
    if (!category) {
        return res.status(404).json({
            title: 'Not Found',
            status: 404,
            detail: `Category with id ${req.params.categoryId} not found`
        });
    }
    const resource = new Resource(category);
    res.json(resource);
});

router.patch('/:categoryId', async (req, res) => {
    const categoryService = await createCategoryService();
    const { name, slug } = req.body;
    const category = await categoryService.updateCategory({ id: +req.params.categoryId, name, slug });
    const resource = new Resource(category);
    res.json(resource);
});

router.delete('/:categoryId', async (req, res) => {
    const categoryService = await createCategoryService();
    await categoryService.deleteCategory(+req.params.categoryId);
    res.sendStatus(204);
});

router.get('/', async (req, res) => {
    const categoryService = await createCategoryService();
    const { page = 1, limit = 10, name } = req.query;
    const { categories, total } = await categoryService.listCategories({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filter: { name: name as string }
    });
    const resource = new ResourceCollection(categories, {
        paginationData: {
            total,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
        },
    });
    res.json(resource.toJson());
});

export default router;