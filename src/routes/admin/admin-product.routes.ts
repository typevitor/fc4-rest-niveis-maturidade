import { Router } from "express";
import { createProductService } from "../../services/product.service";
import cors from "cors";
import { defaultCorsOptions } from "../../http/cors";
import { ProductResource, ProductResourceCollection } from "../../http/product-resource";

const router = Router();

const corsCollection = cors({
  ...defaultCorsOptions,
  methods: ["GET", "POST"],
});

const corsItem = cors({
  ...defaultCorsOptions,
  methods: ["GET", "PATCH", "DELETE"],
});


router.post("/", corsItem, async (req, res, next) => {
  try {
    const productService = await createProductService();
    const { name, slug, description, price, categoryIds } = req.body;
    const product = await productService.createProduct(
      name,
      slug,
      description,
      price,
      categoryIds
    );
    res.set('Location', `/admin/products/${product.id}`).status(201);
    const resource = new ProductResource(product, req);
    res.json(resource.toJson());
  }catch (e) {
    next(e);
  }
});

router.get("/:productId", corsItem, async (req, res) => {
  const productService = await createProductService();
  const product = await productService.getProductById(
    +req.params.productId
  );
  if(!product){
    return res.status(404).json({
      title: 'Not Found',
      status: 404,
      detail: `Product with id ${req.params.productId} not found`
    });
  }
  const resource = new ProductResource(product, req);
  res.json(resource.toJson());
});

router.patch("/:productId", corsItem, async (req, res) => {
  const productService = await createProductService();
  const { name, slug, description, price, categoryIds } = req.body;
  const product = await productService.updateProduct({
    id: +req.params.productId,
    name,
    slug,
    description,
    price,
    categoryIds,
  });
  //@ts-expect-error
  const resource = new ProductResource(product, req);
  res.json(resource.toJson());
});

router.delete("/:productId", corsItem, async (req, res) => {
  const productService = await createProductService();
  await productService.deleteProduct(+req.params.productId);
  res.sendStatus(204);
});

router.get("/", async (req, res) => {
  const productService = await createProductService();
  const {
    page = 1,
    limit = 10,
    name,
    categories_slug: categoriesSlugStr,
  } = req.query;
    
    const categories_slug = categoriesSlugStr
      ? categoriesSlugStr.toString().split(",")
      : [];
    const { products, total } = await productService.listProducts({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      filter: {
        name: name as string,
        categories_slug,
      },
    });
  
    if(!req.headers['accept'] || req.headers['accept'] === 'application/json') {
      const resource = new ProductResourceCollection(products, req)
      res.json(resource.toJson());
    }
  if(req.headers['accept'] === 'text/csv') {
    const csv = products.map((product) => {
      return `${product.name},${product.slug},${product.description},${product.price}`;
    })
    .join("\n");
    res.set("Content-Type", "text/csv");
    return res.send(csv);
  }
});

router.options("/", corsCollection);
router.options("/:productId", corsItem);

export default router;
