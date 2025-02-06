import { Router } from "express";
import { createCategoryService } from "../services/category.service";
import { Resource, ResourceCollection } from "../http/resource";
import cors from "cors";
import { defaultCorsOptions } from "../http/cors";
import { responseCached } from "../http/response-cached";

const router = Router();

const corsCollection = cors({
  ...defaultCorsOptions,
  methods: ["GET"],
});

const corsItem = cors({
  ...defaultCorsOptions,
  methods: ["GET"],
});

router.get("/:categorySlug", corsItem, async (req, res) => {
  const categoryService = await createCategoryService();
  const category = await categoryService.getCategoryBySlug(
    req.params.categorySlug
  );
  const resource = new Resource(category);
  res.json(resource);
});

router.get("/", corsCollection, async (req, res) => {
  const categoryService = await createCategoryService();
  const { page = 1, limit = 10, name } = req.query;
  const { categories, total } = await categoryService.listCategories({
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    filter: { name: name as string },
  });
  const resource = new ResourceCollection(categories, {
    paginationData: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    },
  });
  return responseCached(
    {res, body: resource.toJson()}, {
    maxAge: 60,
    type: "public",
    revalidate: "must-revalidate"
  });
});

router.options("/", corsCollection);
router.options("/:categorySlug", corsItem);

export default router;
