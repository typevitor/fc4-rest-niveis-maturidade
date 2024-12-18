import { Router } from "express";
import { createCartService } from "../services/cart.service";
import { Resource } from "../http/resource";

const router = Router();

router.post("/", async (req, res) => {
  const cartService = await createCartService();
    // @ts-expect-error
  const customerId = req.userId;
  const cart = await cartService.createCart(customerId)
  const resource = new Resource(cart);
  res.json(resource);
});

router.post("/:cartUuid/items", async (req, res) => {
  const cartService = await createCartService();
  // @ts-expect-error
  const customerId = req.userId;
  const { productId, quantity } = req.body;
  const cart = await cartService.addItemToCart({
    customerId: customerId,
    cartUuid: req.params.cartUuid,
    productId: parseInt(productId),
    quantity: parseInt(quantity),
  });
  const resource = new Resource({
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
      },
    })),
    createdAt: cart.createdAt,
    customer: cart.customer
  });
  res.json(resource);
});

router.get("/:cartUuid", async (req, res) => {
  const cartService = await createCartService();
  const cart = await cartService.getCart(req.params.cartUuid);
  const resource = new Resource(cart);
  res.json(resource);
});

router.post("/:cartUuid/items/:cartItemId/remove", async (req, res) => {
  const cartService = await createCartService();
  const { cartItemId } = req.params;
  await cartService.removeItemFromCart({
    cartUuid: req.params.cartUuid,
    cartItemId: parseInt(cartItemId),
  });
  res.sendStatus(204)
});

router.post("/:cartUuid/clear", async (req, res) => {
  const cartService = await createCartService();
  const cart = await cartService.clearCart(req.params.cartUuid);
  const resource = new Resource(cart);
  res.json(resource);
});

export default router;
